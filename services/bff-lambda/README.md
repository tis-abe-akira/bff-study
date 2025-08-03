
# bff-lambdaサービス

このサービスは、BFF（Backend for Frontend）パターンを実装するAWS Lambda関数です。主な役割は、フロントエンドからのリクエストを受け取り、認証処理やバックエンドサービスへのプロキシを行います。

## ファイル構成と役割

### `src/main/java/com/example/bff/lambda/`

*   **`BffLambdaApplication.java`**
    *   Spring Bootアプリケーションのメインエントリーポイントです。
    *   `@SpringBootApplication`アノテーションを持ち、アプリケーションを起動します。

*   **`LambdaFunctionHandler.java`**
    *   AWS Lambda関数のメインハンドラです。
    *   `bffProxy`という名前の`Function`を定義しており、これがLambdaから呼び出されるコアロジックです。
    *   リクエストのパスに応じて、`ProxyService`や`MockAuthService`に処理を振り分けるルーターの役割を担います。

*   **`LocalTestController.java`**
    *   ローカル環境でLambdaの動作をシミュレートするためのテスト用コントローラです。
    *   `local`プロファイルが有効な場合にのみアクティブになります。
    *   HTTPリクエストを`APIGatewayProxyRequestEvent`に変換し、`LambdaFunctionHandler`を呼び出すことで、API Gateway経由の呼び出しを模倣します。

    **注:** このコントローラは`@Profile("local")`アノテーションが付与されているため、実行環境にデプロイする必要はありません。`local`プロファイルが有効な場合にのみ有効化され、本番環境などの他のプロファイルでは無視されます。

*   **`MockAuthService.java`**
    *   モックの認証機能を提供するサービスです。
    *   ユーザーのログイン、ログアウト、認証状態の確認といった認証関連のロジックを実装しています。
    *   セッション情報はRedisを使用して管理します。

*   **`ProxyService.java`**
    *   バックエンドサービスへのリクエストをプロキシ（代理中継）するサービスです。
    *   フロントエンドから受け取ったリクエストを、適切なバックエンドサービスに転送する役割を持ちます。
    *   ヘルスチェック用のエンドポイントも提供しています。

### `src/main/java/com/example/bff/lambda/config/`

*   **`LambdaConfig.java`**
    *   アプリケーション全体の設定を定義するクラスです。
    *   `RestTemplate`のような、他のクラスで共通して使用されるBean（部品）の生成などを行います。
