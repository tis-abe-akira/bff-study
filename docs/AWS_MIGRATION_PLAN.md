# AWS移行マスタープラン

## 🚀 プロジェクト概要

このドキュメントは、現在のローカル開発環境からAWSクラウド環境への段階的移行を定義します。
特に**BFFのLambda化**を重点的に検証し、スパイク耐性のあるマイクロサービスアーキテクチャを構築します。

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
Frontend (Amplify) ←→ BFF (Lambda) ←→ AWS API Gateway ←→ Backend (ECS Fargate)
                             ↑              ↑
                      ElastiCache Redis   JWT Authorizer
                             ↓
                    KeyCloak (App Runner)
```

## 🛠️ 技術スタック選定

| コンポーネント | 現在 | AWS移行後 | 理由 |
|---|---|---|---|
| **Frontend** | Next.js (port 3000) | **Amplify** | 楽なデプロイ、CI/CD標準対応 |
| **BFF** | SpringBoot (port 8080) | **Lambda + Spring Cloud Function** | スパイク耐性、コスト効率 |
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
│   │   │   ├── bff-stack.ts           # Lambda + API Gateway
│   │   │   └── frontend-stack.ts      # Amplify
│   │   ├── bin/                # CDK App
│   │   ├── environments/       # 環境別設定
│   │   └── package.json        # CDK依存関係
│   └── docker/                 # Docker設定
├── services/                   # アプリケーション
│   ├── bff-lambda/            # Lambda対応BFF
│   │   ├── src/               # Spring Cloud Function
│   │   ├── pom.xml            # Lambda依存関係
│   │   └── serverless.yml     # SAM設定(オプション)
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
// BFF Lambda Stack
export class BffStack extends Stack {
  constructor(scope: Construct, id: string, props: BffStackProps) {
    super(scope, id, props);

    // ElastiCache Redis (Session Store)
    const sessionCache = new elasticache.CfnCacheCluster(this, 'SessionStore', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis'
    });

    // BFF Lambda Function
    const bffLambda = new lambda.Function(this, 'BffLambda', {
      runtime: lambda.Runtime.JAVA_17,
      handler: 'com.example.bff.StreamLambdaHandler::handleRequest',
      code: lambda.Code.fromAsset('../services/bff-lambda/target/bff-lambda.jar'),
      timeout: Duration.seconds(30),
      memorySize: 1024,
      environment: {
        REDIS_ENDPOINT: sessionCache.attrRedisEndpointAddress,
        KEYCLOAK_URL: props.keycloakUrl
      }
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'BffApi', {
      restApiName: 'BFF API',
      description: 'API Gateway for BFF Lambda'
    });

    // Lambda Integration
    const lambdaIntegration = new apigateway.LambdaIntegration(bffLambda);
    api.root.addProxy({ defaultIntegration: lambdaIntegration });
  }
}
```

## ⚠️ 重要な技術検証ポイント

### 🎯 BFF Lambda化の課題と解決策

#### 1. Spring Boot → Spring Cloud Function移行
**課題**: 
- 既存のSpring Boot WebアプリケーションをLambdaに対応
- OAuth2設定の互換性
- セッション管理の外部化

**解決策**:
```xml
<!-- pom.xml更新 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-function-adapter-aws</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
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

#### 3. コールドスタート対策
**課題**: 初回リクエストの遅延
**解決策**: 
- Provisioned Concurrency
- Native Image (GraalVM) 検討
- 適切なメモリサイズ設定

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

## 📅 段階的移行戦略

### Phase 1: インフラ基盤構築
- [ ] CDKプロジェクト初期化
- [ ] NetworkStack (VPC、セキュリティグループ)
- [ ] 基本的なCI/CD設定

### Phase 2: 認証・バックエンド移行
- [ ] AuthStack (KeyCloak App Runner)
- [ ] BackendStack (ECS Fargate)
- [ ] RDS Aurora設定

### Phase 3: BFF Lambda化 ⭐ **最重要**
- [ ] Spring Cloud Function移行
- [ ] ElastiCache Redis設定
- [ ] セッション外部化実装
- [ ] Lambda関数デプロイ
- [ ] コールドスタート対策

### Phase 4: API Gateway設定
- [ ] AWS API Gateway構築
- [ ] JWT Authorizer設定
- [ ] CORS、レート制限設定
- [ ] 既存API Gateway機能移行

### Phase 5: フロントエンド移行
- [ ] Amplify設定
- [ ] カスタムドメイン設定
- [ ] CI/CD設定

### Phase 6: 全統合テスト
- [ ] エンドツーエンドテスト
- [ ] パフォーマンステスト
- [ ] セキュリティテスト
- [ ] 本番リリース

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
- **Lambda**: リクエスト課金（コスト効率良）
- **ECS Fargate**: 継続稼働（予測可能）
- **ElastiCache**: 小規模Redis（t3.micro）
- **App Runner**: オートスケール（利用量ベース）
- **API Gateway**: リクエスト課金

### 最適化ポイント
- Lambda Provisioned Concurrency は必要時のみ
- ECS Task サイズの最適化
- RDS Aurora Serverless v2 検討

## 🚦 成功指標

### 技術指標
- [ ] コールドスタート時間 < 3秒
- [ ] 通常レスポンス時間 < 500ms
- [ ] セッション外部化の正常動作
- [ ] JWT認証フローの完全移行

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

**最終更新**: 2025-08-03  
**責任者**: Development Team  
**レビュー周期**: 週次更新