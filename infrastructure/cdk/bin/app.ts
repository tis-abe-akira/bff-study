#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
// import { AuthStack } from '../lib/auth-stack';
// import { BackendStack } from '../lib/backend-stack';
import { BffEcsStack } from '../lib/bff-ecs-stack';
// import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// 環境設定
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1'
};

// タグ設定
const commonTags = {
  Project: 'bff-study',
  Environment: 'dev',
  Owner: 'development-team'
};

// ネットワーク基盤
const networkStack = new NetworkStack(app, 'BffStudyNetworkStack', {
  env,
  tags: commonTags,
  description: 'Network infrastructure for BFF Study project'
});

// TODO: Phase 1では NetworkStack のみデプロイ
// 認証サービス (KeyCloak)
// const authStack = new AuthStack(app, 'BffStudyAuthStack', {
//   env,
//   tags: commonTags,
//   description: 'Authentication service using KeyCloak on App Runner',
//   vpc: networkStack.vpc
// });

// バックエンドサービス (ECS Fargate)
// const backendStack = new BackendStack(app, 'BffStudyBackendStack', {
//   env,
//   tags: commonTags,
//   description: 'Backend service on ECS Fargate with RDS Aurora',
//   vpc: networkStack.vpc,
//   keycloakUrl: authStack.keycloakUrl
// });

// BFFサービス (ECS/Fargate) - Lambda から移行
const bffEcsStack = new BffEcsStack(app, 'BffStudyEcsStack', {
  env,
  tags: commonTags,
  description: 'BFF service on ECS/Fargate with ALB - Migrated from Lambda',
  vpc: networkStack.vpc,
  keycloakUrl: 'http://localhost:8180', // 暫定的にローカルKeyCloakを指定
  backendUrl: 'http://localhost:8081'   // 暫定的にローカルBackendを指定
});

// フロントエンドサービス (Amplify)
// const frontendStack = new FrontendStack(app, 'BffStudyFrontendStack', {
//   env,
//   tags: commonTags,
//   description: 'Frontend service on Amplify',
//   bffApiUrl: `http://${bffEcsStack.alb.loadBalancerDnsName}`
// });

// スタック間依存関係
// authStack.addDependency(networkStack);
// backendStack.addDependency(authStack);
bffEcsStack.addDependency(networkStack);
// frontendStack.addDependency(bffEcsStack);