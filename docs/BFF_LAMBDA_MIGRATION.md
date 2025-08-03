# BFF Lambda化技術検証計画

## 🎯 目的

現在のSpring BootベースのBFFをAWS Lambdaに移行し、スパイク耐性のあるサーバーレスアーキテクチャを実現する。

## 📋 現状分析

### 現在のBFF構成

#### 主要コンポーネント
- **フレームワーク**: Spring Boot 3.5.3 + Java 17
- **認証**: OAuth2 Client (KeyCloak連携)
- **セッション**: メモリ内（インメモリ）
- **プロキシ機能**: `/api/proxy/**` で汎用プロキシ
- **依存関係**: Spring Security, WebFlux, OAuth2

#### ファイル構造
```
bff/src/main/java/com/example/bff/
├── TrainingBffApplication.java     # メインアプリケーション
├── config/
│   └── SecurityConfig.java        # セキュリティ設定
└── controller/
    ├── AuthController.java        # 認証エンドポイント
    └── ProxyController.java       # プロキシ機能
```

#### 重要な技術要素
1. **OAuth2 OIDC**: KeyCloakからのIDトークン取得
2. **セッション管理**: Spring Security Session
3. **プロキシ機能**: RestTemplateによるAPI Gateway転送
4. **CORS設定**: フロントエンド連携

## ⚡ Lambda化の技術課題

### 1. Spring Boot → Spring Cloud Function移行

#### 課題
- Webサーバー前提の既存コードをFunction形式に変換
- Spring Bootのオートコンフィギュレーション依存
- HTTP リクエスト/レスポンス処理の変更

#### 解決策
```xml
<!-- 新しい依存関係 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-function-adapter-aws</artifactId>
    <version>4.0.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-function-web</artifactId>
    <version>4.0.0</version>
</dependency>
```

#### 実装パターン
```java
@Configuration
public class LambdaConfiguration {
    
    @Bean
    public Function<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> bffProxy() {
        return request -> {
            // 既存のプロキシロジックを移植
            return response;
        };
    }
}
```

### 2. セッション管理の外部化

#### 課題
- Lambdaのステートレス性
- セッション情報の永続化
- パフォーマンスへの影響

#### 解決策: ElastiCache Redis
```java
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600)
public class RedisSessionConfig {
    
    @Bean
    public LettuceConnectionFactory connectionFactory() {
        String redisHost = System.getenv("REDIS_ENDPOINT");
        int redisPort = Integer.parseInt(System.getenv("REDIS_PORT"));
        return new LettuceConnectionFactory(redisHost, redisPort);
    }
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory());
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

### 3. OAuth2/OIDC設定の調整

#### 課題
- 環境変数ベースの設定
- KeyCloak連携の維持
- トークン検証の最適化

#### 解決策
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
            scope: openid,profile,email
            authorization-grant-type: authorization_code
            redirect-uri: ${BFF_BASE_URL}/login/oauth2/code/keycloak
        provider:
          keycloak:
            issuer-uri: ${KEYCLOAK_URL}/realms/training-app
            user-name-attribute: preferred_username
```

### 4. コールドスタート対策

#### 課題と目標
- **現状**: 初回リクエスト時の遅延
- **目標**: 3秒以内のレスポンス
- **対策**: 複数アプローチの検討

#### 対策1: Provisioned Concurrency
```typescript
// CDK設定
const bffLambda = new lambda.Function(this, 'BffLambda', {
  // ... 他の設定
  reservedConcurrentExecutions: 10,
});

// Provisioned Concurrency設定
new lambda.ProvisionedConcurrencyConfiguration(this, 'BffProvisionedConcurrency', {
  function: bffLambda,
  provisionedConcurrentExecutions: 2
});
```

#### 対策2: メモリサイズ最適化
```typescript
// 検証予定のメモリサイズ
const memoryConfigs = [512, 1024, 1536, 2048]; // MB
```

#### 対策3: GraalVM Native Image（将来検討）
```xml
<!-- Native Image用プラグイン -->
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <version>0.9.28</version>
</plugin>
```

### 5. API Gateway統合

#### 課題
- 既存プロキシ機能の移行
- CORS設定の維持
- 認証フローの継続

#### 解決策: Lambda Proxy Integration
```typescript
// CDK設定
const api = new apigateway.RestApi(this, 'BffApi', {
  restApiName: 'BFF API',
  description: 'BFF Lambda API Gateway',
  defaultCorsPreflightOptions: {
    allowOrigins: ['http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowCredentials: true
  }
});

const lambdaIntegration = new apigateway.LambdaIntegration(bffLambda, {
  proxy: true,
  allowTestInvoke: true
});

api.root.addProxy({
  defaultIntegration: lambdaIntegration
});
```

## 📅 段階的移行計画

### Phase 1: 技術検証 (1週間)
- [ ] Spring Cloud Function基本動作確認
- [ ] Redis セッション外部化テスト
- [ ] OAuth2認証フローテスト
- [ ] パフォーマンステスト

### Phase 2: Lambda実装 (2週間)
- [ ] 既存コードのFunction化
- [ ] 環境変数設定
- [ ] エラーハンドリング実装
- [ ] ログ設定

### Phase 3: AWS統合 (1週間)
- [ ] Lambda デプロイ
- [ ] API Gateway設定
- [ ] ElastiCache構築
- [ ] セキュリティ設定

### Phase 4: 統合テスト (1週間)
- [ ] エンドツーエンドテスト
- [ ] 負荷テスト
- [ ] セキュリティテスト
- [ ] 本番リリース

## 🔬 検証項目とメトリクス

### パフォーマンス指標
- **コールドスタート**: < 3秒
- **ウォームアップ後**: < 500ms
- **メモリ使用量**: < 1GB
- **同時接続数**: 100 req/sec

### 機能検証項目
- [ ] OAuth2認証フロー正常動作
- [ ] セッション継続性
- [ ] プロキシ機能の完全移行
- [ ] CORS設定の動作確認
- [ ] エラーハンドリング

### セキュリティ検証
- [ ] JWT トークンの適切な処理
- [ ] セッションハイジャック対策
- [ ] 機密情報の適切な管理
- [ ] VPC内通信の暗号化

## 🚨 リスクと対策

### 高リスク
1. **コールドスタート性能**
   - 対策: Provisioned Concurrency
   - 代替案: ECS Fargate移行

2. **セッション外部化の複雑性**
   - 対策: Spring Session Redis実装
   - 代替案: JWT ステートレス化

### 中リスク
1. **Spring Framework互換性**
   - 対策: Spring Cloud Function活用
   - 代替案: 純粋なJava Lambda実装

2. **Lambda制限事項**
   - タイムアウト: 15分上限
   - ペイロードサイズ: 6MB上限
   - 対策: 適切な設計とエラーハンドリング

## 💡 成功の判断基準

### 必須要件
- [ ] 既存機能の100%移行完了
- [ ] パフォーマンス目標達成
- [ ] セキュリティレベル維持
- [ ] 運用コスト削減

### 追加価値
- [ ] オートスケーリング動作確認
- [ ] サーバーレス運用の簡素化
- [ ] 開発効率の向上

## 🛠️ 開発環境準備

### 必要ツール
```bash
# AWS CLI設定
aws configure

# SAM CLI (ローカルテスト用)
pip install aws-sam-cli

# Docker (ローカル環境)
docker --version

# Maven (ビルド)
mvn --version
```

### ローカル開発環境
```bash
# Lambda ローカル実行
sam local start-api

# Redis ローカル実行
docker run -d -p 6379:6379 redis:alpine

# KeyCloak 継続使用
docker-compose up keycloak
```

---

**最終更新**: 2025-08-03  
**担当**: Development Team  
**次回レビュー**: Phase 1完了後