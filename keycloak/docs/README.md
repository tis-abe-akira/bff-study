# Keycloak Setup Guide

新しい`realm`と`クライアント`を作成するための手順を以下に示します。

  ---
  ステップ1: Keycloakの起動とログイン

ブラウザで http://localhost:8180/admin にアクセスしてください。

  ログイン画面が表示されるので：
  - Username: admin
  - Password: admin

  でログインしてください。

  ---
  ステップ2: trainingレルムの作成

  ログイン後、以下の手順で進めてください：

  2-1. 新しいレルムを作成

  1. 左上の "Master" ドロップダウンをクリック
  2. "Create Realm" をクリック
  3. Realm name: training と入力
  4. "Create" ボタンをクリック

  2-2. 基本設定確認

  - Display name: Training Realm (任意)
  - Enabled: ON (デフォルト)
  - "Save" をクリック

  ---
  ステップ3: クライアントの作成

  3-1. クライアント作成

  1. 左サイドバーで "Clients" をクリック
  2. "Create client" をクリック
  3. Client type: OpenID Connect (デフォルト)
  4. Client ID: training-app
  5. "Next" をクリック

  3-2. 認証設定

  1. Client authentication: ON (重要!)
  2. Authorization: OFF (デフォルト)
  3. Authentication flow:
    - ✅ Standard flow (Authorization Code Flow)
    - ✅ Direct access grants (Resource Owner Password Flow)
  4. "Next" をクリック

  3-3. ログイン設定

  1. Root URL: http://localhost:3000
  2. Home URL: http://localhost:3000
  3. Valid redirect URIs:
    - http://localhost:8080/login/oauth2/code/keycloak
    - http://localhost:3000/*
  4. Valid post logout redirect URIs:
    - http://localhost:3000/*
    - http://localhost:3000
  5. Web origins:
    - http://localhost:8080
    - http://localhost:3000
  6. "Save" をクリック

  ---
  ステップ4: クライアントシークレットの確認

  1. 作成した training-app クライアントをクリック
  2. "Credentials" タブをクリック
  3. Client secret をコピー（後で使用）

  ---
  ステップ5: テストユーザーの作成

  KeyCloak管理画面で、テスト用のユーザーを作成しましょう：

  5-1. ユーザー作成

  1. 左サイドバーで "Users" をクリック
  2. "Add user" をクリック
  3. Reaured user actionsは空欄のまま
  4. Username: testuser
  5. Email: test@example.com
  6. First name: Test
  7. Last name: User
  8. Email verified: ON
  9.  Enabled: ON
  10. "Create" をクリック

  5-2. パスワード設定

  1. 作成したユーザーをクリック
  2. "Credentials" タブをクリック
  3. "Set password" をクリック
  4. Password: password123
  5. Password confirmation: password123
  6. Temporary: OFF (重要!)
  7. "Save" をクリック

  ---
  ステップ6: ログアウト機能の設定

  完全なログアウト（BFF + KeyCloak SSO）を実現するため、以下の設定が必要です：

  6-1. Valid Post Logout Redirect URIsの設定

  1. training-app クライアントの設定画面で "Settings" タブを確認
  2. "Valid post logout redirect URIs" に以下の順番で設定されていることを確認：
    - http://localhost:3000 (具体的URLを最優先)
    - http://localhost:3000/* (ワイルドカードを次に)
  3. 設定されていない場合は追加、順番が間違っている場合は並び替えて "Save" をクリック
  
  重要: 順番はKeyCloakのマッチング動作に影響します。具体的URLを必ず上位に配置してください。

  6-2. ログアウトフローのテスト

  1. ダッシュボードで "Sign Out" ボタンをクリック
  2. KeyCloakのログアウトページが表示される
  3. 自動的にフロントエンド (http://localhost:3000) にリダイレクト
  4. 再度 "Authenticate" ボタンを押すとKeyCloakログイン画面が表示される

  注意: Valid Post Logout Redirect URIsが設定されていないと "Invalid parameter: redirect_uri" エラーが発生します。

  ---
  ステップ7: BFFアプリケーションの起動テスト
