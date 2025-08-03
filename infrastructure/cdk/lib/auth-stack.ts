import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class AuthStack extends cdk.Stack {
  public readonly keycloakUrl: string;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // KeyCloak用RDS PostgreSQL
    const keycloakDbSecret = new secretsmanager.Secret(this, 'KeycloakDbSecret', {
      description: 'KeyCloak Database credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'keycloak' }),
        generateStringKey: 'password',
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    const dbSubnetGroup = new rds.SubnetGroup(this, 'KeycloakDbSubnetGroup', {
      description: 'Subnet group for KeyCloak database',
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'KeycloakDbSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for KeyCloak database',
    });

    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from VPC'
    );

    const keycloakDb = new rds.DatabaseInstance(this, 'KeycloakDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromSecret(keycloakDbSecret),
      vpc: props.vpc,
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSecurityGroup],
      databaseName: 'keycloak',
      allocatedStorage: 20,
      storageEncrypted: true,
      deletionProtection: false, // 開発環境用
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: false,
    });

    // App Runner VPC Connector
    const vpcConnector = new apprunner.CfnVpcConnector(this, 'KeycloakVpcConnector', {
      subnets: props.vpc.privateSubnets.map(subnet => subnet.subnetId),
      securityGroups: [dbSecurityGroup.securityGroupId],
    });

    // App Runner IAM Role
    const instanceRole = new iam.Role(this, 'KeycloakInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonRDSDataFullAccess'),
      ],
    });

    keycloakDbSecret.grantRead(instanceRole);

    const accessRole = new iam.Role(this, 'KeycloakAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
      ],
    });

    // App Runner Service
    const keycloakService = new apprunner.CfnService(this, 'KeycloakService', {
      serviceName: 'bff-study-keycloak',
      sourceConfiguration: {
        autoDeploymentsEnabled: false,
        imageRepository: {
          imageIdentifier: 'quay.io/keycloak/keycloak:23.0',
          imageConfiguration: {
            port: '8080',
            runtimeEnvironmentVariables: [
              { name: 'KC_DB', value: 'postgres' },
              { name: 'KC_DB_URL', value: `jdbc:postgresql://${keycloakDb.instanceEndpoint.hostname}:5432/keycloak` },
              { name: 'KC_DB_USERNAME', value: keycloakDbSecret.secretValueFromJson('username').unsafeUnwrap() },
              { name: 'KC_DB_PASSWORD', value: keycloakDbSecret.secretValueFromJson('password').unsafeUnwrap() },
              { name: 'KC_HOSTNAME_STRICT', value: 'false' },
              { name: 'KC_HTTP_ENABLED', value: 'true' },
              { name: 'KC_HEALTH_ENABLED', value: 'true' },
              { name: 'KC_METRICS_ENABLED', value: 'true' },
              { name: 'KEYCLOAK_ADMIN', value: 'admin' },
              { name: 'KEYCLOAK_ADMIN_PASSWORD', value: 'admin' },
            ],
            startCommand: '/opt/keycloak/bin/kc.sh start --optimized',
          },
          imageRepositoryType: 'ECR_PUBLIC',
        },
      },
      instanceConfiguration: {
        cpu: '0.25 vCPU',
        memory: '0.5 GB',
        instanceRoleArn: instanceRole.roleArn,
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/health/ready',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
    });

    // KeyCloak URLを設定
    this.keycloakUrl = `https://${keycloakService.attrServiceUrl}`;

    // 出力
    new cdk.CfnOutput(this, 'KeycloakServiceUrl', {
      value: this.keycloakUrl,
      description: 'KeyCloak Service URL',
      exportName: 'BffStudy-KeycloakUrl',
    });

    new cdk.CfnOutput(this, 'KeycloakDatabaseEndpoint', {
      value: keycloakDb.instanceEndpoint.hostname,
      description: 'KeyCloak Database Endpoint',
      exportName: 'BffStudy-KeycloakDbEndpoint',
    });

    new cdk.CfnOutput(this, 'KeycloakAdminCredentials', {
      value: 'admin/admin',
      description: 'KeyCloak Admin Credentials (default)',
    });
  }
}