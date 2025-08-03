package com.example.bff.lambda;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

/**
 * プロキシサービス
 * 既存のProxyControllerのロジックをLambda用に移植
 */
@Service
public class ProxyService {

    private final RestTemplate restTemplate;
    private final MockAuthService mockAuthService;

    @Value("${bff.lambda.backend.url:http://localhost:8081}")
    private String backendUrl;
    
    @Value("${bff.lambda.api-gateway.url:http://localhost:8082}")
    private String apiGatewayUrl;

    public ProxyService(RestTemplate restTemplate, MockAuthService mockAuthService) {
        this.restTemplate = restTemplate;
        this.mockAuthService = mockAuthService;
    }

    /**
     * API Gatewayへのプロキシリクエスト
     * 既存のProxyController.proxyRequestを移植
     */
    public ResponseEntity<?> proxyToApiGateway(String path, String method, String queryString, 
                                               Object body, HttpSession session) {
        
        System.out.println("Proxy request - Path: " + path + ", Method: " + method);
        
        // 認証チェック
        if (!mockAuthService.isSessionAuthenticated(session)) {
            System.out.println("Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required", "redirectTo", "/login"));
        }

        // ユーザー情報取得
        MockAuthService.MockUser user = mockAuthService.getUserFromSession(session);
        if (user == null || user.getMockJwt() == null) {
            System.out.println("User session invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid session"));
        }

        // プロキシ先URL構築
        String targetUrl = buildTargetUrl(path, queryString);
        System.out.println("Target URL: " + targetUrl);

        // ヘッダー設定
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + user.getMockJwt());
        headers.set("X-User-ID", user.getUserId());
        headers.set("X-Username", user.getUsername());
        
        if (body != null) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }

        HttpEntity<Object> entity = new HttpEntity<>(body, headers);

        try {
            // プロキシリクエスト実行
            ResponseEntity<Object> response = restTemplate.exchange(
                targetUrl,
                HttpMethod.valueOf(method.toUpperCase()),
                entity,
                Object.class
            );

            System.out.println("Proxy response status: " + response.getStatusCode());
            return response;

        } catch (Exception e) {
            System.err.println("Proxy request failed: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Proxy request failed",
                        "message", e.getMessage(),
                        "targetUrl", targetUrl
                    ));
        }
    }

    /**
     * バックエンドへの直接プロキシ（API Gateway使わない場合の検証用）
     */
    public ResponseEntity<?> proxyToBackend(String path, String method, String queryString,
                                           Object body, HttpSession session) {
        
        System.out.println("Direct backend proxy - Path: " + path + ", Method: " + method);
        
        // 認証チェック
        if (!mockAuthService.isSessionAuthenticated(session)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        MockAuthService.MockUser user = mockAuthService.getUserFromSession(session);
        
        // バックエンドURL構築
        String targetUrl = backendUrl + "/api" + path;
        if (queryString != null && !queryString.isEmpty()) {
            targetUrl += "?" + queryString;
        }

        System.out.println("Backend target URL: " + targetUrl);

        // ヘッダー設定
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-ID", user.getUserId());
        headers.set("X-Username", user.getUsername());
        
        if (body != null) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }

        HttpEntity<Object> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                targetUrl,
                HttpMethod.valueOf(method.toUpperCase()),
                entity,
                Object.class
            );

            System.out.println("Backend response status: " + response.getStatusCode());
            return response;

        } catch (Exception e) {
            System.err.println("Backend request failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Backend request failed",
                        "message", e.getMessage(),
                        "targetUrl", targetUrl
                    ));
        }
    }

    /**
     * ヘルスチェックエンドポイント
     */
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "bff-lambda",
            "timestamp", System.currentTimeMillis(),
            "backendUrl", backendUrl,
            "apiGatewayUrl", apiGatewayUrl,
            "environment", System.getenv().getOrDefault("AWS_LAMBDA_FUNCTION_NAME", "local")
        ));
    }

    /**
     * 認証状態確認
     */
    public ResponseEntity<?> checkAuthStatus(HttpSession session) {
        boolean authenticated = mockAuthService.isSessionAuthenticated(session);
        
        if (authenticated) {
            MockAuthService.MockUser user = mockAuthService.getUserFromSession(session);
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "user", Map.of(
                    "userId", user.getUserId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "loginTime", user.getLoginTime().toString()
                )
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "authenticated", false
            ));
        }
    }

    /**
     * プロキシ先URL構築
     */
    private String buildTargetUrl(String path, String queryString) {
        String targetUrl = apiGatewayUrl + "/api" + path;
        if (queryString != null && !queryString.isEmpty()) {
            targetUrl += "?" + queryString;
        }
        return targetUrl;
    }
}