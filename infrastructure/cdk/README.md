# BFF Study - AWS CDK Infrastructure

このディレクトリには、BFF StudyプロジェクトのAWS環境を構築するためのCDKコードが含まれています。

## 🏗️ アーキテクチャ概要

```
Frontend (Amplify) ←→ BFF (Lambda) ←→ AWS API Gateway ←→ Backend (ECS Fargate)
                             ↑              ↑
                      ElastiCache Redis   JWT Authorizer
                             ↓
                    KeyCloak (App Runner)
```

## 📁 ディレクトリ構成

```
infrastructure/cdk/
├── bin/
│   └── app.ts              # CDK アプリケーションエントリーポイント
├── lib/
│   ├── network-stack.ts    # VPC, セキュリティグループ
│   ├── auth-stack.ts       # KeyCloak App Runner
│   ├── backend-stack.ts    # ECS Fargate + RDS Aurora
│   ├── bff-stack.ts        # Lambda + API Gateway + Redis
│   └── frontend-stack.ts   # Amplify
├── environments/           # 環境別設定
├── package.json
├── tsconfig.json
├── cdk.json
└── README.md              # このファイル
```

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- AWS CLI設定済み
- AWS CDK CLI インストール済み

```bash
npm install -g aws-cdk
```

### 初期設定

```bash
# 依存関係インストール
cd infrastructure/cdk
npm install

# CDK Bootstrap (初回のみ)
cdk bootstrap

# 設定確認
cdk ls
```

## 💻 開発コマンド

### ビルドと検証

```bash
# TypeScriptコンパイル
npm run build

# CDK diff（変更差分確認）
npm run diff

# CDK synthesize（CloudFormationテンプレート生成）
npm run synth
```

### デプロイ

```bash
# 全スタックデプロイ
npm run deploy

# 個別スタックデプロイ
cdk deploy BffStudyNetworkStack
cdk deploy BffStudyAuthStack
cdk deploy BffStudyBackendStack
cdk deploy BffStudyBffStack
cdk deploy BffStudyFrontendStack
```

### 削除

```bash
# 全スタック削除
npm run destroy

# 個別スタック削除（依存関係逆順）
cdk destroy BffStudyFrontendStack
cdk destroy BffStudyBffStack
cdk destroy BffStudyBackendStack
cdk destroy BffStudyAuthStack
cdk destroy BffStudyNetworkStack
```

## 🔧 スタック詳細

### NetworkStack
- **目的**: ネットワーク基盤の構築
- **リソース**: VPC, サブネット, セキュリティグループ, VPCエンドポイント
- **依存関係**: なし

### AuthStack
- **目的**: 認証サービス（KeyCloak）
- **リソース**: App Runner, RDS PostgreSQL
- **依存関係**: NetworkStack

### BackendStack
- **目的**: バックエンドサービス
- **リソース**: ECS Fargate, ALB, RDS Aurora
- **依存関係**: AuthStack

### BffStack ⭐ 重要
- **目的**: BFFサービス（Lambda化）
- **リソース**: Lambda, API Gateway, ElastiCache Redis
- **依存関係**: BackendStack

### FrontendStack
- **目的**: フロントエンドサービス
- **リソース**: Amplify
- **依存関係**: BffStack

## ⚙️ 環境設定

### 環境変数

```bash
# 必要な環境変数
export CDK_DEFAULT_ACCOUNT="123456789012"
export CDK_DEFAULT_REGION="ap-northeast-1"

# 任意の環境変数
export DOMAIN_NAME="example.com"
export CERTIFICATE_ARN="arn:aws:acm:..."
```

### Context設定

`cdk.json`で環境固有の設定を管理：

```json
{
  "context": {
    "@aws-cdk/core:enableStackNameDuplicates": false,
    "@aws-cdk/core:stackRelativeExports": true
  }
}
```

## 📊 リソース一覧

### 作成される主要リソース

| サービス | リソース | 用途 |
|---|---|---|
| **EC2** | VPC, Subnets, Security Groups | ネットワーク基盤 |
| **ECS** | Fargate Cluster, Service, Task | Backend実行環境 |
| **Lambda** | Function, Layer | BFF実行環境 |
| **API Gateway** | REST API, Resources, Methods | APIエンドポイント |
| **ElastiCache** | Redis Cluster | セッションストア |
| **RDS** | Aurora PostgreSQL | データベース |
| **App Runner** | Service | KeyCloak実行環境 |
| **Amplify** | App, Branch | Frontend配信 |

### 概算コスト（月額）

| サービス | 設定 | 概算コスト（USD） |
|---|---|---|
| ECS Fargate | 0.25 vCPU, 0.5GB | $10-20 |
| Lambda | 1GB, 1M requests | $5-10 |
| ElastiCache | t3.micro | $15-25 |
| RDS Aurora | t3.small | $25-40 |
| App Runner | 0.25 vCPU, 0.5GB | $10-20 |
| その他 | NAT Gateway, ALB等 | $30-50 |
| **合計** | | **$95-165** |

## 🔐 セキュリティ

### IAM ベストプラクティス
- 最小権限の原則
- サービス間通信はIAMロール
- クロスアカウントアクセス制御

### ネットワークセキュリティ
- プライベートサブネット配置
- セキュリティグループによる通信制御
- VPCエンドポイント使用

### 機密情報管理
- AWS Secrets Manager使用
- 環境変数による設定注入
- CloudFormation出力での機密情報回避

## 📈 モニタリング

### CloudWatch設定
- Lambda メトリクス監視
- ECS クラスター監視
- API Gateway ログ記録
- カスタムメトリクス設定

### アラート設定
- エラー率閾値
- レスポンス時間監視
- リソース使用率監視

## 🚨 トラブルシューティング

### 一般的な問題

1. **デプロイエラー**
   ```bash
   # ロールバック
   cdk deploy --rollback
   
   # 詳細ログ
   cdk deploy --verbose
   ```

2. **リソース削除エラー**
   ```bash
   # 強制削除（注意して使用）
   cdk destroy --force
   ```

3. **Bootstrap問題**
   ```bash
   # 再Bootstrap
   cdk bootstrap --force
   ```

### よくある設定ミス
- VPC CIDR重複
- セキュリティグループ設定
- IAMロール権限不足
- 環境変数未設定

## 📚 参考リンク

- [AWS CDK v2 Developer Guide](https://docs.aws.amazon.com/cdk/v2/guide/)
- [CDK TypeScript API Reference](https://docs.aws.amazon.com/cdk/api/v2/typescript/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Spring Cloud Function AWS](https://spring.io/projects/spring-cloud-function)

---

**最終更新**: 2025-08-03  
**メンテナー**: Development Team