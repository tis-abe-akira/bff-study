package com.example.bff.lambda;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * モック認証サービス
 * KeyCloak認証の代替として使用
 */
@Service
@ConditionalOnProperty(name = "bff.lambda.mock-auth.enabled", havingValue = "true", matchIfMissing = true)
public class MockAuthService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    public MockAuthService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * モックユーザーでログイン
     */
    public MockUser mockLogin(String userId) {
        MockUser user = new MockUser();
        user.setUserId(userId != null ? userId : "test-user");
        user.setUsername(user.getUserId());
        user.setEmail(user.getUserId() + "@example.com");
        user.setDisplayName("Test User " + user.getUserId());
        user.setLoginTime(LocalDateTime.now());
        
        // モックJWTトークン生成
        String mockJwt = createMockJWT(user);
        user.setMockJwt(mockJwt);
        
        System.out.println("Mock login successful for user: " + user.getUserId());
        return user;
    }

    /**
     * セッションベース認証（従来のBFF方式）
     */
    public boolean isSessionAuthenticated(HttpSession session) {
        if (session == null) {
            return false;
        }
        
        String userId = (String) session.getAttribute("userId");
        return userId != null;
    }

    /**
     * セッションにユーザー情報を保存
     */
    public void saveUserToSession(HttpSession session, MockUser user) {
        session.setAttribute("userId", user.getUserId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("email", user.getEmail());
        session.setAttribute("mockJwt", user.getMockJwt());
        session.setAttribute("loginTime", user.getLoginTime().toString());
        
        System.out.println("User saved to session: " + user.getUserId());
    }

    /**
     * セッションからユーザー情報を取得
     */
    public MockUser getUserFromSession(HttpSession session) {
        if (session == null) {
            return null;
        }
        
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            return null;
        }
        
        MockUser user = new MockUser();
        user.setUserId(userId);
        user.setUsername((String) session.getAttribute("username"));
        user.setEmail((String) session.getAttribute("email"));
        user.setMockJwt((String) session.getAttribute("mockJwt"));
        
        String loginTimeStr = (String) session.getAttribute("loginTime");
        if (loginTimeStr != null) {
            user.setLoginTime(LocalDateTime.parse(loginTimeStr));
        }
        
        return user;
    }

    /**
     * Redisを使用したセッション管理（分散セッション検証）
     */
    public void saveUserToRedis(String sessionId, MockUser user) {
        String key = "session:" + sessionId;
        Map<String, Object> userMap = Map.of(
            "userId", user.getUserId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "mockJwt", user.getMockJwt(),
            "loginTime", user.getLoginTime().toString()
        );
        
        redisTemplate.opsForHash().putAll(key, userMap);
        redisTemplate.expire(key, 30, TimeUnit.MINUTES);
        
        System.out.println("User saved to Redis with session: " + sessionId);
    }

    /**
     * RedisからユーザーセッションOK取得
     */
    public MockUser getUserFromRedis(String sessionId) {
        String key = "session:" + sessionId;
        Map<Object, Object> userMap = redisTemplate.opsForHash().entries(key);
        
        if (userMap.isEmpty()) {
            return null;
        }
        
        MockUser user = new MockUser();
        user.setUserId((String) userMap.get("userId"));
        user.setUsername((String) userMap.get("username"));
        user.setEmail((String) userMap.get("email"));
        user.setMockJwt((String) userMap.get("mockJwt"));
        
        String loginTimeStr = (String) userMap.get("loginTime");
        if (loginTimeStr != null) {
            user.setLoginTime(LocalDateTime.parse(loginTimeStr));
        }
        
        System.out.println("User loaded from Redis: " + user.getUserId());
        return user;
    }

    /**
     * モックJWTトークン生成
     */
    private String createMockJWT(MockUser user) {
        // 実際のJWTではなく、検証用のモックトークン
        String header = "mock-jwt-header";
        String payload = String.format("{\"sub\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"iat\":%d}",
                user.getUserId(), user.getDisplayName(), user.getEmail(), 
                System.currentTimeMillis() / 1000);
        String signature = "mock-signature-" + UUID.randomUUID().toString().substring(0, 8);
        
        return header + "." + payload + "." + signature;
    }

    /**
     * モックJWTトークン検証
     */
    public boolean validateMockJWT(String token) {
        if (token == null || !token.startsWith("mock-jwt-header.")) {
            return false;
        }
        
        // 簡易検証：形式チェックのみ
        String[] parts = token.split("\\.");
        return parts.length == 3;
    }

    /**
     * ログアウト処理
     */
    public void logout(HttpSession session, String sessionId) {
        if (session != null) {
            session.invalidate();
        }
        
        if (sessionId != null) {
            String key = "session:" + sessionId;
            redisTemplate.delete(key);
            System.out.println("Session deleted from Redis: " + sessionId);
        }
    }

    /**
     * モックユーザー情報クラス
     */
    public static class MockUser {
        private String userId;
        private String username;
        private String email;
        private String displayName;
        private LocalDateTime loginTime;
        private String mockJwt;

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }

        public LocalDateTime getLoginTime() { return loginTime; }
        public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }

        public String getMockJwt() { return mockJwt; }
        public void setMockJwt(String mockJwt) { this.mockJwt = mockJwt; }

        @Override
        public String toString() {
            return String.format("MockUser{userId='%s', username='%s', email='%s', loginTime=%s}", 
                    userId, username, email, loginTime);
        }
    }
}