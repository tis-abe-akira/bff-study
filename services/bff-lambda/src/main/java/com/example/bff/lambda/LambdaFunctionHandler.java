package com.example.bff.lambda;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Lambda Function Handler
 * API Gateway → Lambda → Spring Cloud Function
 */
@Configuration
public class LambdaFunctionHandler {

    @Autowired
    private ProxyService proxyService;
    
    @Autowired
    private MockAuthService mockAuthService;

    /**
     * メインのAPI Gateway Proxy Integration Function
     */
    @Bean
    public Function<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> bffProxy() {
        return this::handleApiGatewayRequest;
    }

    /**
     * API Gateway Proxy Request処理
     */
    private APIGatewayProxyResponseEvent handleApiGatewayRequest(APIGatewayProxyRequestEvent request) {
        System.out.println("=== Lambda Function Called ===");
        System.out.println("Path: " + request.getPath());
        System.out.println("HTTP Method: " + request.getHttpMethod());
        System.out.println("Headers: " + request.getHeaders());
        
        try {
            // パス判定によるルーティング
            String path = request.getPath();
            String method = request.getHttpMethod();
            
            if (path.equals("/health") || path.equals("/api/health")) {
                return handleHealthCheck();
            }
            
            if (path.startsWith("/api/auth/")) {
                return handleAuthRequest(request);
            }
            
            if (path.startsWith("/api/proxy/")) {
                return handleProxyRequest(request);
            }
            
            // デフォルトレスポンス
            return createResponse(404, Map.of(
                "error", "Not found",
                "path", path,
                "availableEndpoints", Map.of(
                    "health", "/health",
                    "auth", "/api/auth/*",
                    "proxy", "/api/proxy/*"
                )
            ));

        } catch (Exception e) {
            System.err.println("Error handling request: " + e.getMessage());
            e.printStackTrace();
            
            return createResponse(500, Map.of(
                "error", "Internal server error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * ヘルスチェック処理
     */
    private APIGatewayProxyResponseEvent handleHealthCheck() {
        ResponseEntity<?> response = proxyService.healthCheck();
        return createResponse(response.getStatusCode().value(), response.getBody());
    }

    /**
     * 認証関連リクエスト処理
     */
    private APIGatewayProxyResponseEvent handleAuthRequest(APIGatewayProxyRequestEvent request) {
        String path = request.getPath();
        
        if (path.equals("/api/auth/mock-login")) {
            return handleMockLogin(request);
        }
        
        if (path.equals("/api/auth/status")) {
            return handleAuthStatus(request);
        }
        
        if (path.equals("/api/auth/logout")) {
            return handleLogout(request);
        }
        
        return createResponse(404, Map.of("error", "Auth endpoint not found", "path", path));
    }

    /**
     * モックログイン処理
     */
    private APIGatewayProxyResponseEvent handleMockLogin(APIGatewayProxyRequestEvent request) {
        try {
            // セッションID取得（Cookie or Header）
            String sessionId = extractSessionId(request);
            String userId = extractUserId(request);
            
            // モックユーザーでログイン
            MockAuthService.MockUser user = mockAuthService.mockLogin(userId);
            
            // Redisにセッション保存
            if (sessionId == null) {
                sessionId = "session-" + System.currentTimeMillis();
            }
            mockAuthService.saveUserToRedis(sessionId, user);
            
            Map<String, Object> responseBody = Map.of(
                "success", true,
                "user", Map.of(
                    "userId", user.getUserId(),
                    "username", user.getUsername(),
                    "email", user.getEmail()
                ),
                "sessionId", sessionId
            );
            
            APIGatewayProxyResponseEvent response = createResponse(200, responseBody);
            
            // セッションCookie設定
            Map<String, String> headers = new HashMap<>();
            headers.put("Set-Cookie", "JSESSIONID=" + sessionId + "; Path=/; HttpOnly; SameSite=Lax");
            response.setHeaders(headers);
            
            return response;
            
        } catch (Exception e) {
            System.err.println("Mock login failed: " + e.getMessage());
            return createResponse(500, Map.of("error", "Login failed", "message", e.getMessage()));
        }
    }

    /**
     * 認証状態確認
     */
    private APIGatewayProxyResponseEvent handleAuthStatus(APIGatewayProxyRequestEvent request) {
        String sessionId = extractSessionId(request);
        
        if (sessionId == null) {
            return createResponse(200, Map.of("authenticated", false));
        }
        
        MockAuthService.MockUser user = mockAuthService.getUserFromRedis(sessionId);
        
        if (user == null) {
            return createResponse(200, Map.of("authenticated", false));
        }
        
        return createResponse(200, Map.of(
            "authenticated", true,
            "user", Map.of(
                "userId", user.getUserId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "loginTime", user.getLoginTime().toString()
            )
        ));
    }

    /**
     * ログアウト処理
     */
    private APIGatewayProxyResponseEvent handleLogout(APIGatewayProxyRequestEvent request) {
        String sessionId = extractSessionId(request);
        
        if (sessionId != null) {
            mockAuthService.logout(null, sessionId);
        }
        
        return createResponse(200, Map.of("success", true, "message", "Logged out"));
    }

    /**
     * プロキシリクエスト処理
     */
    private APIGatewayProxyResponseEvent handleProxyRequest(APIGatewayProxyRequestEvent request) {
        String sessionId = extractSessionId(request);
        
        if (sessionId == null) {
            return createResponse(401, Map.of("error", "Session required"));
        }
        
        MockAuthService.MockUser user = mockAuthService.getUserFromRedis(sessionId);
        if (user == null) {
            return createResponse(401, Map.of("error", "Authentication required"));
        }
        
        // プロキシパス抽出
        String path = request.getPath().substring("/api/proxy".length());
        String method = request.getHttpMethod();
        String queryString = extractQueryString(request);
        
        // TODO: HttpSessionの代替実装が必要
        // 現在はRedisベースの認証のみ
        
        return createResponse(501, Map.of(
            "error", "Proxy functionality not yet implemented",
            "message", "HttpSession integration with Lambda needs implementation",
            "path", path,
            "method", method,
            "user", user.getUserId()
        ));
    }

    /**
     * セッションID抽出
     */
    private String extractSessionId(APIGatewayProxyRequestEvent request) {
        // Cookie から抽出
        Map<String, String> headers = request.getHeaders();
        if (headers != null) {
            String cookie = headers.get("Cookie");
            if (cookie != null && cookie.contains("JSESSIONID=")) {
                return cookie.split("JSESSIONID=")[1].split(";")[0];
            }
        }
        
        // Header から抽出（fallback）
        String sessionHeader = headers != null ? headers.get("X-Session-ID") : null;
        return sessionHeader;
    }

    /**
     * ユーザーID抽出
     */
    private String extractUserId(APIGatewayProxyRequestEvent request) {
        Map<String, String> queryParams = request.getQueryStringParameters();
        if (queryParams != null && queryParams.containsKey("userId")) {
            return queryParams.get("userId");
        }
        
        return "default-test-user";
    }

    /**
     * クエリ文字列抽出
     */
    private String extractQueryString(APIGatewayProxyRequestEvent request) {
        Map<String, String> queryParams = request.getQueryStringParameters();
        if (queryParams == null || queryParams.isEmpty()) {
            return null;
        }
        
        StringBuilder queryString = new StringBuilder();
        for (Map.Entry<String, String> entry : queryParams.entrySet()) {
            if (queryString.length() > 0) {
                queryString.append("&");
            }
            queryString.append(entry.getKey()).append("=").append(entry.getValue());
        }
        
        return queryString.toString();
    }

    /**
     * API Gateway Response作成
     */
    private APIGatewayProxyResponseEvent createResponse(int statusCode, Object body) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setBody(body instanceof String ? (String) body : body.toString());
        
        // CORS Headers
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.put("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        
        response.setHeaders(headers);
        return response;
    }
}