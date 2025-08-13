# AWS移行マスタープラン

## 🚀 プロジェクト概要

このドキュメントは、現在のローカル開発環境からAWSクラウド環境への段階的移行を定義します。
特に**BFFのECS/Fargate化**を重点的に実装し、コンテナベースのマイクロサービスアーキテクチャを構築します。

## 📋 アーキテクチャ移行マップ

### 現在の構成
```
Frontend (Next.js:3000) ←→ BFF (SpringBoot:8080) ←→ API Gateway (SpringBoot:8082) ←→ Backend (SpringBoot:8081)
                                    ↑                                ↑
                             セッション管理                      JWT認証/プロキシ
                                    ↓
                            KeyCloak (8180)
```

### AWS移行後の構成
```
Frontend (Amplify) ←→ BFF (ECS/Fargate) ←→ API Gateway (8082) ←→ Backend (ECS Fargate)
                             ↑                    ↑
                      ALB + ElastiCache Redis   JWT認証/プロキシ
                             ↓
                    KeyCloak (App Runner)
```

## 🛠️ 技術スタック選定

| コンポーネント | 現在 | AWS移行後 | 理由 |
|---|---|---|---|
| **Frontend** | Next.js (port 3000) | **Amplify** | 楽なデプロイ、CI/CD標準対応 |
| **BFF** | SpringBoot (port 8080) | **ECS/Fargate + ALB** | 予測可能なコスト、運用の簡素化 |
| **API Gateway** | SpringBoot (port 8082) | **AWS API Gateway** | マネージドサービス、JWT Authorizer |
| **Backend** | SpringBoot (port 8081) | **ECS Fargate + RDS Aurora** | マイクロサービス独立性 |
| **Auth** | KeyCloak (port 8180) | **App Runner + RDS PostgreSQL** | 楽なコンテナデプロイ |
| **Session Store** | メモリ | **ElastiCache Redis** | 分散セッション管理 |
| **Infrastructure** | - | **AWS CDK (TypeScript)** | 型安全、プログラマブル |

## 📁 ディレクトリ構成設計

```
bff-study/
├── infrastructure/              # インフラコード
│   ├── cdk/                    # CDK設定
│   │   ├── lib/                # CDK Stack定義
│   │   │   ├── network-stack.ts       # VPC、サブネット
│   │   │   ├── auth-stack.ts          # KeyCloak App Runner
│   │   │   ├── backend-stack.ts       # ECS Fargate
│   │   │   ├── bff-ecs-stack.ts       # ECS/Fargate + ALB
│   │   │   └── frontend-stack.ts      # Amplify
│   │   ├── bin/                # CDK App
│   │   ├── environments/       # 環境別設定
│   │   └── package.json        # CDK依存関係
│   └── docker/                 # Docker設定
├── services/                   # アプリケーション
│   ├── bff/                   # ECS/Fargate対応BFF
│   │   ├── src/               # Spring Boot Application
│   │   ├── Dockerfile         # コンテナイメージ
│   │   └── pom.xml            # Spring Boot依存関係
│   ├── backend-ecs/           # ECS対応Backend
│   │   ├── src/               # 既存Backendコード
│   │   ├── Dockerfile         # ECS用コンテナ
│   │   └── pom.xml
│   ├── frontend-amplify/      # Amplify対応Frontend
│   │   ├── src/               # Next.jsコード
│   │   ├── amplify.yml        # Amplify設定
│   │   └── package.json
│   └── auth-apprunner/        # AppRunner対応KeyCloak
│       ├── Dockerfile         # KeyCloak設定
│       └── apprunner.yaml     # App Runner設定
├── docs/                      # ドキュメント
│   ├── AWS_MIGRATION_PLAN.md  # このファイル
│   └── TECHNICAL_VALIDATION.md # 技術検証結果
└── [既存ファイル...]          # 現在のローカル開発環境
```

## 🔧 AWS CDK技術スタック

### CDKの選択理由
- **型安全性**: TypeScriptによる強力な型チェック
- **IDE支援**: IntelliSense、自動補完
- **AWS統合**: AWSサービスとの密接な統合
- **学習曲線**: プログラミング経験者には親しみやすい
- **コンポーネント化**: 再利用可能なConstruct

### 主要CDK Construct例
```typescript
// BFF ECS/Fargate Stack
export class BffEcsStack extends Stack {
  constructor(scope: Construct, id: string, props: BffEcsStackProps) {
    super(scope, id, props);

    // ElastiCache Redis (Session Store)
    const sessionCache = new elasticache.CfnCacheCluster(this, 'SessionStore', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis'
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'BffCluster', {
      vpc: props.vpc,
      containerInsights: true
    });

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'BffAlb', {
      vpc: props.vpc,
      internetFacing: true
    });

    // ECS Service with Fargate
    const service = new ecs.FargateService(this, 'BffService', {
      cluster,
      taskDefinition: taskDefinition,
      desiredCount: 2
    });
  }
}
```

## ⚠️ 重要な技術検証ポイント

### 🎯 BFF ECS/Fargate化の利点と実装

#### 1. Spring Boot → ECS/Fargate移行
**利点**: 
- 既存のSpring Boot Webアプリケーションをそのまま活用
- OAuth2設定の継続利用
- セッション管理の外部化（ElastiCache Redis）

**実装**:
```xml
<!-- pom.xml追加 -->
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

#### 2. セッション管理の外部化
**課題**: Lambdaのステートレス性
**解決策**: ElastiCache Redis + Spring Session

```java
@Configuration
@EnableRedisHttpSession
public class RedisSessionConfig {
    @Bean
    public LettuceConnectionFactory connectionFactory() {
        return new LettuceConnectionFactory(
            System.getenv("REDIS_ENDPOINT"), 6379);
    }
}
```

#### 3. コンテナ最適化
**利点**: 一定のパフォーマンス
**実装**: 
- マルチステージDockerビルド
- JVM最適化設定
- ヘルスチェック機能

#### 4. OAuth2/OIDC設定調整
**課題**: KeyCloak連携の環境変数化
**解決策**:
```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: ${KEYCLOAK_CLIENT_ID}
            client-secret: ${KEYCLOAK_CLIENT_SECRET}
        provider:
          keycloak:
            issuer-uri: ${KEYCLOAK_URL}/realms/training-app
```

## 📅 実装済み状況と次ステップ

### ✅ 完了済み
- [x] **ECS基盤実装**: `infrastructure/cdk/lib/bff-ecs-stack.ts` 完成
- [x] **Redis セッション管理**: Spring Session設定完了
- [x] **Dockerコンテナ化**: マルチステージビルド対応
- [x] **ALB統合**: ロードバランサー・ターゲットグループ設定完了
- [x] **NetworkStack活用**: 既存VPC・セキュリティグループ活用完了

### 🔄 次期実装戦略: **ECS/Fargate デプロイ方式**

**基本方針**: 既存BFF (`bff/`) をコンテナ化してECS/Fargateにデプロイ

#### Step 1: ECS基盤のAWSデプロイ
- [x] BffEcsStackの作成・完了
- [ ] ECRリポジトリへのイメージプッシュ
- [ ] ECSサービスのデプロイ
- [ ] ALB経由での基本動作確認

#### Step 2: ElastiCache統合
- [x] Spring Session Redis設定完了
- [ ] セッション管理のクラウド化テスト
- [x] 接続設定の環境変数化完了

#### Step 3: KeyCloak統合
- [ ] モック認証 → KeyCloak OAuth2置換
- [ ] JWT発行・検証フローの実装
- [ ] 認証境界の確立

#### Step 4: 本番機能の完全統合
- [x] 既存BFFのProxyController活用
- [ ] JWT → API Gateway転送機能の動作確認
- [ ] エンドツーエンドテストの実行

### 🎯 移行完了後の構成
```
Frontend (Amplify) ←→ BFF (ECS/Fargate) ←→ API Gateway (8082) ←→ Backend (ECS)
                             ↑                    ↑
                      ALB + ElastiCache Redis   JWT認証/プロキシ
                             ↓
                    KeyCloak (App Runner)
```

## 🔐 セキュリティ考慮事項

### 実装済みセキュリティ対策（継続）
1. **JWT隠蔽**: JWTをフロントエンドに露出させない
2. **セッション管理**: HttpOnly Cookie + SameSite設定
3. **認証境界**: BFFが唯一の認証エントリーポイント
4. **トークン変換**: Session ↔ JWT変換をサーバーサイドで実行

### AWS移行での追加対策
1. **VPC設定**: プライベートサブネット、NAT Gateway
2. **セキュリティグループ**: 最小権限原則
3. **IAM Role**: サービス間通信の最小権限
4. **Secrets Manager**: 機密情報の安全な管理
5. **WAF**: API Gateway保護
6. **CloudTrail**: 監査ログ

## 💰 コスト最適化

### 予想コスト構造
- **ECS Fargate**: 継続稼働（予測可能・2タスク常時）
- **ALB**: 時間課金＋データ処理課金
- **ElastiCache**: 小規模Redis（t3.micro）
- **App Runner**: オートスケール（利用量ベース）
- **ECR**: ストレージ課金（最小限）

### 最適化ポイント
- ECS Auto Scaling設定（CPU/メモリベース）
- ALBターゲットグループのヘルスチェック最適化
- RDS Aurora Serverless v2 検討

## 🚦 成功指標

### 技術指標
- [ ] コンテナ起動時間 < 60秒
- [ ] 通常レスポンス時間 < 500ms
- [ ] セッション外部化の正常動作
- [ ] JWT認証フローの完全動作

### 運用指標
- [ ] 99.9% 可用性
- [ ] オートスケール動作確認
- [ ] モニタリング・アラート設定
- [ ] CI/CD 完全自動化

## 📚 参考リンク

- [Spring Cloud Function AWS Adapter](https://spring.io/projects/spring-cloud-function)
- [AWS CDK for TypeScript](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html)
- [Spring Session Redis](https://spring.io/projects/spring-session)
- [AWS Lambda Java Runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-java.html)

---

**最終更新**: 2025-08-13  
**責任者**: Development Team  
**移行方式**: Lambda → ECS/Fargate  
**レビュー周期**: 週次更新