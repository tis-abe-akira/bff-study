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
1. KeyCloak起動: `docker-compose up -d`
2. Backend起動: `cd backend && ./mvnw spring-boot:run`
3. BFF起動: `cd bff && ./mvnw spring-boot:run`
4. Frontend起動: `cd frontend && npm run dev`