import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface FrontendStackProps extends cdk.StackProps {
  bffApiUrl: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly amplifyAppUrl: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // Amplify Service Role
    const amplifyRole = new iam.Role(this, 'AmplifyServiceRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify'),
      ],
    });

    // Amplify App
    const amplifyApp = new amplify.CfnApp(this, 'FrontendApp', {
      name: 'bff-study-frontend',
      description: 'BFF Study Frontend Application',
      platform: 'WEB',
      repository: 'https://github.com/YOUR_USERNAME/bff-study', // 実際のリポジトリに変更
      iamServiceRole: amplifyRole.roleArn,
      environmentVariables: [
        {
          name: 'NEXT_PUBLIC_BFF_API_URL',
          value: props.bffApiUrl,
        },
        {
          name: 'AMPLIFY_MONOREPO_APP_ROOT',
          value: 'frontend',
        },
        {
          name: 'NODE_VERSION',
          value: '18',
        },
      ],
      buildSpec: `
version: 1
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
      `,
      customRules: [
        {
          source: '/<*>',
          status: '404-200',
          target: '/index.html',
        },
      ],
    });

    // Main Branch
    const mainBranch = new amplify.CfnBranch(this, 'MainBranch', {
      appId: amplifyApp.attrAppId,
      branchName: 'main',
      enableAutoBuild: true,
      enablePerformanceMode: false,
      environmentVariables: [
        {
          name: 'NEXT_PUBLIC_BFF_API_URL',
          value: props.bffApiUrl,
        },
      ],
    });

    // Development Branch (optional)
    const devBranch = new amplify.CfnBranch(this, 'DevBranch', {
      appId: amplifyApp.attrAppId,
      branchName: 'develop',
      enableAutoBuild: true,
      enablePerformanceMode: false,
      environmentVariables: [
        {
          name: 'NEXT_PUBLIC_BFF_API_URL',
          value: props.bffApiUrl,
        },
        {
          name: 'NODE_ENV',
          value: 'development',
        },
      ],
    });

    // Custom Domain (optional - コメントアウト)
    // const domain = new amplify.CfnDomain(this, 'CustomDomain', {
    //   appId: amplifyApp.attrAppId,
    //   domainName: 'yourdomain.com',
    //   subDomainSettings: [
    //     {
    //       branchName: mainBranch.branchName,
    //       prefix: 'www',
    //     },
    //     {
    //       branchName: devBranch.branchName,
    //       prefix: 'dev',
    //     },
    //   ],
    // });

    // Amplify App URLを設定
    this.amplifyAppUrl = `https://main.${amplifyApp.attrAppId}.amplifyapp.com`;

    // 出力
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.attrAppId,
      description: 'Amplify App ID',
      exportName: 'BffStudy-AmplifyAppId',
    });

    new cdk.CfnOutput(this, 'AmplifyAppUrl', {
      value: this.amplifyAppUrl,
      description: 'Amplify App URL',
      exportName: 'BffStudy-AmplifyAppUrl',
    });

    new cdk.CfnOutput(this, 'MainBranchUrl', {
      value: `https://main.${amplifyApp.attrAppId}.amplifyapp.com`,
      description: 'Main Branch URL',
    });

    new cdk.CfnOutput(this, 'DevBranchUrl', {
      value: `https://develop.${amplifyApp.attrAppId}.amplifyapp.com`,
      description: 'Development Branch URL',
    });

    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://console.aws.amazon.com/amplify/home#/${amplifyApp.attrAppId}`,
      description: 'Amplify Console URL',
    });
  }
}