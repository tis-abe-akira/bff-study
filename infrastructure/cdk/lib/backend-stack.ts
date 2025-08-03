import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface BackendStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  keycloakUrl: string;
}

export class BackendStack extends cdk.Stack {
  public readonly backendUrl: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Backend用RDS Aurora PostgreSQL
    const backendDbSecret = new secretsmanager.Secret(this, 'BackendDbSecret', {
      description: 'Backend Database credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'backend' }),
        generateStringKey: 'password',
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    const dbSubnetGroup = new rds.SubnetGroup(this, 'BackendDbSubnetGroup', {
      description: 'Subnet group for Backend database',
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'BackendDbSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Backend database',
    });

    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from VPC'
    );

    const backendDb = new rds.DatabaseCluster(this, 'BackendDatabase', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      credentials: rds.Credentials.fromSecret(backendDbSecret),
      writer: rds.ClusterInstance.serverlessV2('writer'),
      readers: [
        rds.ClusterInstance.serverlessV2('reader', { scaleWithWriter: true }),
      ],
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 1,
      vpc: props.vpc,
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSecurityGroup],
      defaultDatabaseName: 'training',
      storageEncrypted: true,
      deletionProtection: false, // 開発環境用
      backup: {
        retention: cdk.Duration.days(7),
      },
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'BackendCluster', {
      vpc: props.vpc,
      clusterName: 'bff-study-backend',
      containerInsights: true,
    });

    // CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'BackendLogGroup', {
      logGroupName: '/ecs/bff-study-backend',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Task Definition用のセキュリティグループ
    const taskSecurityGroup = new ec2.SecurityGroup(this, 'BackendTaskSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Backend ECS tasks',
    });

    taskSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(8080),
      'Allow HTTP traffic from VPC'
    );

    // データベースアクセス許可
    dbSecurityGroup.addIngressRule(
      taskSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow database access from Backend tasks'
    );

    // ApplicationLoadBalancedFargateService
    const backendService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'BackendService', {
      cluster,
      serviceName: 'bff-study-backend',
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../../services/backend-ecs'),
        containerPort: 8080,
        environment: {
          SPRING_PROFILES_ACTIVE: 'aws',
          SERVER_PORT: '8080',
          KEYCLOAK_URL: props.keycloakUrl,
          SPRING_DATASOURCE_URL: `jdbc:postgresql://${backendDb.clusterEndpoint.hostname}:5432/training`,
        },
        secrets: {
          SPRING_DATASOURCE_USERNAME: ecs.Secret.fromSecretsManager(backendDbSecret, 'username'),
          SPRING_DATASOURCE_PASSWORD: ecs.Secret.fromSecretsManager(backendDbSecret, 'password'),
        },
        logDriver: ecs.LogDrivers.awsLogs({
          logGroup,
          streamPrefix: 'backend',
        }),
      },
      assignPublicIp: false,
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      publicLoadBalancer: false, // 内部ALB
      listenerPort: 80,
      securityGroups: [taskSecurityGroup],
    });

    // Auto Scaling設定
    const scalableTarget = backendService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    scalableTarget.scaleOnCpuUtilization('BackendCpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.minutes(5),
      scaleOutCooldown: cdk.Duration.minutes(2),
    });

    scalableTarget.scaleOnMemoryUtilization('BackendMemoryScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.minutes(5),
      scaleOutCooldown: cdk.Duration.minutes(2),
    });

    // Health Check設定
    backendService.targetGroup.configureHealthCheck({
      path: '/actuator/health',
      port: '8080',
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(10),
      interval: cdk.Duration.seconds(30),
    });

    // Backend URLを設定
    this.backendUrl = `http://${backendService.loadBalancer.loadBalancerDnsName}`;

    // 出力
    new cdk.CfnOutput(this, 'BackendServiceUrl', {
      value: this.backendUrl,
      description: 'Backend Service URL',
      exportName: 'BffStudy-BackendUrl',
    });

    new cdk.CfnOutput(this, 'BackendDatabaseEndpoint', {
      value: backendDb.clusterEndpoint.hostname,
      description: 'Backend Database Endpoint',
      exportName: 'BffStudy-BackendDbEndpoint',
    });

    new cdk.CfnOutput(this, 'EcsClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name',
      exportName: 'BffStudy-EcsClusterName',
    });
  }
}