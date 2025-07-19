# BFF Study Project

## Architecture
- **Frontend**: Next.js (SSR対応Web UI)
- **BFF**: SpringBoot (認証管理・API Gateway)
- **Backend**: SpringBoot (ビジネスロジック・データ操作)
- **Auth**: KeyCloak (認証基盤)

## Directory Structure
```
bff-study/
├── frontend/          # Next.js アプリケーション
├── bff/              # SpringBoot BFF (認証・API Gateway)
├── backend/          # SpringBoot Backend (ビジネスロジック)
└── docker-compose.yml # KeyCloak + DB セットアップ
```

## Features
- サインイン（KeyCloak連携）
- トレーニングプラン登録・表示
- セッション管理（BFF側）
- API Gateway機能（BFF→Backend）

## Getting Started

### 1. KeyCloak起動

#### Docker環境の場合
```bash
docker-compose up -d
```

#### Windows（バイナリインストール）の場合
KeyCloakをバイナリでインストールしている場合は、以下のコマンドで起動：
```cmd
cd <KEYCLOAK/bin>
kc.bat start-dev --http-port=8180
```

### 2. KeyCloak設定
1. http://localhost:8180/admin にアクセス
2. admin/admin でログイン
3. training-app レルムを選択
4. Clients → training-app → Credentials タブ
5. Client secretをコピーしておく

### 3. BFF設定
1. `bff/src/main/resources/application.yml-EXAMPLE` を `application.yml` にコピー
   ```bash
   cd bff/src/main/resources
   cp application.yml-EXAMPLE application.yml
   ```
2. `application.yml` の `SECRET_HERE` 部分を、手順2でコピーしたClient secretに置き換える
   ```yaml
   client-secret: YOUR_ACTUAL_CLIENT_SECRET_HERE
   ```

### 4. アプリケーション起動
1. Backend起動: `cd backend && ./mvnw spring-boot:run`
2. BFF起動: `cd bff && ./mvnw spring-boot:run`
3. Frontend起動: `cd frontend && npm run dev`

### 5. アクセス
- Frontend: http://localhost:3000
- BFF: http://localhost:8080
- Backend: http://localhost:8081
- KeyCloak: http://localhost:8180
