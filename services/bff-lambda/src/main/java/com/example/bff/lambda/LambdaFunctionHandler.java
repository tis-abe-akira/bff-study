package com.example.bff.lambda;

import org.springframework.messaging.Message;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Configuration
public class LambdaFunctionHandler {

    @Autowired
    private ProxyService proxyService;
    
    @Autowired
    private MockAuthService mockAuthService;

    @Bean
    public Function<Message<String>, APIGatewayProxyResponseEvent> bffProxy() {
        return message -> {
            APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
            
            // HTTP method from headers
            String httpMethod = (String) message.getHeaders().get("http_request_method");
            request.setHttpMethod(httpMethod);

            // Path from headers
            Object pathObject = message.getHeaders().get("http_request_uri");
            if (pathObject == null) {
                pathObject = message.getHeaders().get("uri");
            }

            String path = null;
            if (pathObject != null) {
                path = pathObject.toString();
            }

            if (path != null) {
                // Remove query params from path
                if (path.contains("?")) {
                    path = path.substring(0, path.indexOf("?"));
                }
                request.setPath(path);
            }
            
            // Query params from headers
            Map<String, String> queryParams = new HashMap<>();
            Object rawParams = message.getHeaders().get("http_request_param");
            if (rawParams instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> params = (Map<String, Object>) rawParams;
                for (Map.Entry<String, Object> entry : params.entrySet()) {
                    Object value = entry.getValue();
                    if (value instanceof String[]) {
                        String[] values = (String[]) value;
                        if (values.length > 0) {
                            queryParams.put(entry.getKey(), values[0]);
                        }
                    } else if (value != null) {
                        queryParams.put(entry.getKey(), value.toString());
                    }
                }
            }
            request.setQueryStringParameters(queryParams);

            // Copy headers
            Map<String, String> headers = new HashMap<>();
            message.getHeaders().forEach((key, value) -> {
                if (value != null) {
                    headers.put(key, value.toString());
                }
            });
            request.setHeaders(headers);
            
            // Set body
            request.setBody(message.getPayload());

            return handleApiGatewayRequest(request);
        };
    }

    public APIGatewayProxyResponseEvent handleApiGatewayRequest(APIGatewayProxyRequestEvent request) {
        System.out.println("=== Lambda Function Called ===");
        System.out.println("Path: " + request.getPath());
        System.out.println("HTTP Method: " + request.getHttpMethod());
        System.out.println("Headers: " + request.getHeaders());
        System.out.println("Query Params: " + request.getQueryStringParameters());
        
        try {
            String path = request.getPath();
            
            if (path == null) {
                return createResponse(400, Map.of("error", "Bad request", "message", "Path is missing"));
            }
            
            if (path.equals("/health") || path.equals("/api/health")) {
                return handleHealthCheck();
            }
            
            if (path.startsWith("/api/auth/")) {
                return handleAuthRequest(request);
            }
            
            if (path.startsWith("/api/proxy/")) {
                return handleProxyRequest(request);
            }
            
            return createResponse(404, Map.of(
                "error", "Not found",
                "path", path
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

    private APIGatewayProxyResponseEvent handleHealthCheck() {
        ResponseEntity<?> response = proxyService.healthCheck();
        return createResponse(response.getStatusCode().value(), response.getBody());
    }

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

    private APIGatewayProxyResponseEvent handleMockLogin(APIGatewayProxyRequestEvent request) {
        try {
            String sessionId = extractSessionId(request);
            String userId = extractUserId(request);
            
            MockAuthService.MockUser user = mockAuthService.mockLogin(userId);
            
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
            
            Map<String, String> headers = new HashMap<>();
            headers.put("Set-Cookie", "JSESSIONID=" + sessionId + "; Path=/; HttpOnly; SameSite=Lax");
            response.setHeaders(headers);
            
            return response;
            
        } catch (Exception e) {
            System.err.println("Mock login failed: " + e.getMessage());
            return createResponse(500, Map.of("error", "Login failed", "message", e.getMessage()));
        }
    }

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

    private APIGatewayProxyResponseEvent handleLogout(APIGatewayProxyRequestEvent request) {
        String sessionId = extractSessionId(request);
        
        if (sessionId != null) {
            mockAuthService.logout(null, sessionId);
        }
        
        return createResponse(200, Map.of("success", true, "message", "Logged out"));
    }

    private APIGatewayProxyResponseEvent handleProxyRequest(APIGatewayProxyRequestEvent request) {
        String sessionId = extractSessionId(request);
        
        if (sessionId == null) {
            return createResponse(401, Map.of("error", "Session required"));
        }
        
        MockAuthService.MockUser user = mockAuthService.getUserFromRedis(sessionId);
        if (user == null) {
            return createResponse(401, Map.of("error", "Authentication required"));
        }
        
        String path = request.getPath().substring("/api/proxy".length());
        String method = request.getHttpMethod();
        String queryString = extractQueryString(request);
        
        return createResponse(501, Map.of(
            "error", "Proxy functionality not yet implemented",
            "message", "HttpSession integration with Lambda needs implementation",
            "path", path,
            "method", method,
            "user", user.getUserId()
        ));
    }

    private String extractSessionId(APIGatewayProxyRequestEvent request) {
        Map<String, String> headers = request.getHeaders();
        if (headers != null) {
            String cookie = headers.get("Cookie");
            if (cookie != null && cookie.contains("JSESSIONID=")) {
                String[] parts = cookie.split("JSESSIONID=");
                if (parts.length > 1) {
                    return parts[1].split(";")[0].trim();
                }
            }
            // Fallback for lowercase header
            cookie = headers.get("cookie");
             if (cookie != null && cookie.contains("JSESSIONID=")) {
                String[] parts = cookie.split("JSESSIONID=");
                if (parts.length > 1) {
                    return parts[1].split(";")[0].trim();
                }
            }
        }
        
        String sessionHeader = headers != null ? headers.get("X-Session-ID") : null;
        if (sessionHeader == null && headers != null) {
             sessionHeader = headers.get("x-session-id");
        }
        return sessionHeader;
    }

    private String extractUserId(APIGatewayProxyRequestEvent request) {
        Map<String, String> queryParams = request.getQueryStringParameters();
        if (queryParams != null && queryParams.containsKey("userId")) {
            return queryParams.get("userId");
        }
        
        return "default-test-user";
    }

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

    private APIGatewayProxyResponseEvent createResponse(int statusCode, Object body) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setBody(body instanceof String ? (String) body : body.toString());
        
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.put("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        
        response.setHeaders(headers);
        return response;
    }
}