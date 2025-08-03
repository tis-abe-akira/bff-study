import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface BffStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  keycloakUrl: string;
  backendUrl: string;
}

export class BffStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: BffStackProps) {
    super(scope, id, props);

    // ElastiCache Redis (Session Store)
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for Redis cluster',
      subnetIds: props.vpc.privateSubnets.map(subnet => subnet.subnetId),
    });

    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Redis cluster',
    });

    redisSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(6379),
      'Allow Redis access from VPC'
    );

    const redisCluster = new elasticache.CfnCacheCluster(this, 'SessionStore', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      port: 6379,
    });

    // Lambda用セキュリティグループ
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for BFF Lambda function',
      allowAllOutbound: true,
    });

    // Redisアクセス許可
    redisSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(6379),
      'Allow Redis access from Lambda'
    );

    // Lambda IAM Role
    const lambdaRole = new iam.Role(this, 'BffLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
      ],
    });

    // CloudWatch Logs権限
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    // Lambda Log Group
    const lambdaLogGroup = new logs.LogGroup(this, 'BffLambdaLogGroup', {
      logGroupName: '/aws/lambda/bff-study-bff',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // BFF Lambda Function
    const bffLambda = new lambda.Function(this, 'BffLambda', {
      functionName: 'bff-study-bff',
      runtime: lambda.Runtime.JAVA_17,
      handler: 'com.example.bff.StreamLambdaHandler::handleRequest',
      code: lambda.Code.fromAsset('../../services/bff-lambda/target/bff-lambda.jar'),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        REDIS_ENDPOINT: redisCluster.attrRedisEndpointAddress,
        REDIS_PORT: '6379',
        KEYCLOAK_URL: props.keycloakUrl,
        BACKEND_URL: props.backendUrl,
        SPRING_PROFILES_ACTIVE: 'aws',
      },
      role: lambdaRole,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      logGroup: lambdaLogGroup,
      tracing: lambda.Tracing.ACTIVE,
    });

    // Lambda Version for Provisioned Concurrency
    const version = new lambda.Version(this, 'BffLambdaVersion', {
      lambda: bffLambda,
    });

    // Alias for Provisioned Concurrency
    const alias = new lambda.Alias(this, 'BffLambdaAlias', {
      aliasName: 'live',
      version: version,
    });

    // Provisioned Concurrency (コールドスタート対策)
    const provisionedConcurrency = new cdk.CfnResource(this, 'BffProvisionedConcurrency', {
      type: 'AWS::Lambda::ProvisionedConcurrencyConfig',
      properties: {
        FunctionName: bffLambda.functionName,
        Qualifier: alias.aliasName,
        ProvisionedConcurrentExecutions: 2,
      },
    });

    provisionedConcurrency.addDependency(alias.node.defaultChild as cdk.CfnResource);

    // API Gateway
    const api = new apigateway.RestApi(this, 'BffApi', {
      restApiName: 'bff-study-api',
      description: 'BFF API Gateway for Lambda',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000', 'https://*.amplifyapp.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        allowCredentials: true,
      },
      binaryMediaTypes: ['*/*'],
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    // Lambda Integration
    const lambdaIntegration = new apigateway.LambdaIntegration(bffLambda, {
      proxy: true,
      allowTestInvoke: true,
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
            'method.response.header.Access-Control-Allow-Credentials': "'true'",
          },
        },
      ],
    });

    // API Resources
    const apiResource = api.root.addResource('api');
    apiResource.addProxy({
      defaultIntegration: lambdaIntegration,
      anyMethod: true,
    });

    // API Gateway ログ設定
    const apiLogGroup = new logs.LogGroup(this, 'ApiGatewayLogGroup', {
      logGroupName: `/aws/apigateway/${api.restApiName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const deployment = new apigateway.Deployment(this, 'BffApiDeployment', {
      api,
    });

    const stage = new apigateway.Stage(this, 'BffApiStage', {
      deployment,
      stageName: 'dev',
      accessLogDestination: new apigateway.LogGroupLogDestination(apiLogGroup),
      accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
      tracingEnabled: true,
      metricsEnabled: true,
      dataTraceEnabled: true,
      loggingLevel: apigateway.MethodLoggingLevel.INFO,
    });

    // API URLを設定
    this.apiUrl = `${api.url}api`;

    // 出力
    new cdk.CfnOutput(this, 'BffApiUrl', {
      value: this.apiUrl,
      description: 'BFF API Gateway URL',
      exportName: 'BffStudy-BffApiUrl',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: bffLambda.functionName,
      description: 'BFF Lambda Function Name',
      exportName: 'BffStudy-LambdaFunctionName',
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisCluster.attrRedisEndpointAddress,
      description: 'Redis Cluster Endpoint',
      exportName: 'BffStudy-RedisEndpoint',
    });

    new cdk.CfnOutput(this, 'ApiGatewayId', {
      value: api.restApiId,
      description: 'API Gateway ID',
      exportName: 'BffStudy-ApiGatewayId',
    });
  }
}