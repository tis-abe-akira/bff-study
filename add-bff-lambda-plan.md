# BFF Lambda移行プラン

## 概要

現在のSpringBootベースのBFFを段階的にPython Lambda版に移行するプランです。最終的にはAWSのAPI GatewayとLambdaを利用して、瞬時のSpikeに対応できるサーバーレスアーキテクチャに移行します。

## 移行の背景

- **現状**: SpringBootベースのBFF → AWSではFargateにデプロイ予定
- **課題**: Fargateでは瞬時のSpike対応が困難
- **解決策**: API Gateway + Lambda構成でサーバーレス化

## 段階的移行プラン

### 1. APIGateway機能の分離
現状BFFに埋もれているAPIGateway機能をパッケージ独立させて専用のPortで動かします。これは将来的にはAWSのAPIGatewayに置き換えます。

**実装内容**:
- 現在の`ApiGatewayController`機能を独立したサービスとして分離
- 専用ポート（例: 8082）で動作させる
- BFF → API Gateway → Backend の通信フローを確立

### 2. 動作確認
この段階で動作確認を行い、APIGateway分離が正常に機能することを確認します。

**確認項目**:
- Frontend → BFF → API Gateway → Backend の通信フロー
- 認証フローの正常動作
- セッション管理の継続性

### 3. FastAPIでBFFを実装
SpringBootベースのBFFをPython FastAPIで再実装します。ここが今回のハイライトです。

**実装内容**:
- KeyCloak OAuth2認証の実装
- セッション管理（Redis等の外部ストレージも考慮）
- API Gateway への通信処理
- CORS設定

### 4. フロントエンド接続先の変更
フロントエンドの呼び出し先を現BFFからFastAPI版BFFに置き換えます。

**実装内容**:
- フロントエンドのAPI エンドポイント設定変更
- 認証フローの調整（必要に応じて）

### 5. 最終動作確認
全体の動作確認を改めて行います。

**確認項目**:
- 全体のアーキテクチャフローの動作確認
- 性能確認
- 認証・認可の動作確認

## 最終アーキテクチャ（ローカル環境）

```
Frontend (3000) → FastAPI BFF (8080) → API Gateway (8082) → Backend (8081)
                                    ↑
                            KeyCloak (8180)
```

## 今後のAWS移行時の対応

ローカルでの動作確認後、以下の移行を実施：

1. API Gateway (8082) → AWS API Gateway
2. FastAPI BFF → AWS Lambda + API Gateway
3. セッション管理 → ElastiCache for Redis

## 技術スタック

- **現BFF**: SpringBoot + OAuth2 Client
- **新BFF**: Python + FastAPI + OAuth2
- **API Gateway**: SpringBoot → AWS API Gateway
- **認証**: KeyCloak (変更なし)
- **セッション**: 将来的にRedis対応

## 詳細TODO-List

### Phase 1: APIGateway機能の分離 ✅ **完了**

#### 1.1 新しいAPI Gatewayプロジェクトの作成 ✅
- [x] `api-gateway`ディレクトリを作成
- [x] SpringBootプロジェクトの初期化
- [x] 必要な依存関係を追加（Web, WebClient等）
- [x] `application.yml`でポート8082を設定

#### 1.2 現在のBFFからAPIGateway機能を移行 ✅
- [x] `bff/src/main/java/com/example/bff/controller/ApiGatewayController.java`を分析
- [x] API Gateway専用の新しいControllerを作成（ProxyController）
- [x] プロキシ機能の実装（Backend APIへの転送）
- [x] ヘッダー転送機能（`X-User-ID`等）の実装
- [x] **パス修正**: `/api/training-plans` → `/api/trainings` でフロントエンドと統一

#### 1.3 BFFの修正 ✅
- [x] BFFからAPIGateway機能を削除（旧ApiGatewayController削除）
- [x] BFFがAPI Gateway（8082）を呼び出すように修正（TrainingApiController作成）
- [x] 設定ファイルでAPI Gatewayのエンドポイントを定義
- [x] **重複コントローラー対応**: 旧TrainingControllerをバックアップ化

#### 1.4 動作確認 ✅
- [x] 各サービスの起動順序確認（KeyCloak → Backend → API Gateway → BFF → Frontend）
- [x] Frontend → BFF → API Gateway → Backend の通信フローテスト
- [x] 認証フローの動作確認
- [x] エラーハンドリングの確認

**🎉 Phase 1完了！新しいアーキテクチャ**: `Frontend (3000) → BFF (8080) → API Gateway (8082) → Backend (8081)`

---

### Phase 2: FastAPI BFFの実装

#### 2.1 開発環境のセットアップ
- [ ] `bff-fastapi`ディレクトリを作成
- [ ] Python仮想環境の作成
- [ ] 必要なライブラリのインストール（FastAPI, uvicorn, httpx, python-multipart等）
- [ ] `requirements.txt`の作成

#### 2.2 基本的なFastAPIアプリケーションの作成
- [ ] `main.py`でFastAPIアプリの初期化
- [ ] CORS設定の追加
- [ ] ヘルスチェックエンドポイントの実装
- [ ] ポート8080での起動設定

#### 2.3 OAuth2認証の実装
- [ ] KeyCloak OAuth2設定の移行
- [ ] セッション管理の実装（Redis使用を検討）
- [ ] 認証ミドルウェアの実装
- [ ] ログイン/ログアウトエンドポイントの実装
- [ ] 認証済みユーザー情報の取得機能

#### 2.4 API Gateway通信の実装
- [ ] httpxクライアントの設定
- [ ] API Gateway（8082）への通信機能
- [ ] ヘッダー転送機能（`X-User-ID`等）
- [ ] エラーハンドリングとレスポンス変換

#### 2.5 エンドポイントの実装
- [ ] `/api/training-plans`エンドポイント
- [ ] `/api/auth/*`エンドポイント群
- [ ] その他必要なエンドポイントの実装

---

### Phase 3: フロントエンド接続先の変更

#### 3.1 設定の変更
- [ ] フロントエンドのAPI設定確認（現在のBFFエンドポイント）
- [ ] 必要に応じて設定ファイルを修正
- [ ] 環境変数での切り替え可能性を検討

#### 3.2 動作確認
- [ ] 新旧BFFでの動作比較
- [ ] 認証フローの互換性確認
- [ ] セッション管理の動作確認
- [ ] エラーハンドリングの確認

---

### Phase 4: 最終動作確認・性能テスト

#### 4.1 全体フローの確認
- [ ] Frontend → FastAPI BFF → API Gateway → Backend の完全フロー
- [ ] 認証・認可のエンドツーエンドテスト
- [ ] 各種エラーケースの動作確認

#### 4.2 性能・安定性確認
- [ ] 負荷テスト（複数ユーザーでの同時アクセス）
- [ ] メモリ使用量・応答時間の測定
- [ ] ログ出力の確認

#### 4.3 ドキュメント更新
- [ ] `CLAUDE.md`の開発コマンド更新
- [ ] 起動順序の更新
- [ ] 新しいアーキテクチャ図の追加

---

### Phase 5: クリーンアップ

#### 5.1 不要ファイルの整理
- [ ] 旧SpringBoot BFFの整理（移行完了後）
- [ ] 使用しなくなったファイルの削除
- [ ] gitignoreの更新

#### 5.2 最終確認
- [ ] 全体のコードレビュー
- [ ] セキュリティチェック
- [ ] 本番移行準備の確認

## 注意事項

- 各段階で動作確認を必ず実施
- 認証フローの互換性を重視
- セッション管理の外部化も並行して検討
- FastAPI版では非同期処理を活用してパフォーマンス向上を図る
- 各PhaseでGitコミットを作成し、ロールバック可能性を確保