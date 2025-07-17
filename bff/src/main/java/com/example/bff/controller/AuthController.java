package com.example.bff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> login() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Please authenticate with OAuth2");
        response.put("authUrl", "/oauth2/authorization/keycloak");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> response = new HashMap<>();
        
        if (principal != null) {
            response.put("authenticated", true);
            response.put("user", Map.of(
                "id", principal.getAttribute("sub"),
                "username", principal.getAttribute("preferred_username"),
                "email", principal.getAttribute("email"),
                "name", principal.getAttribute("name")
            ));
        } else {
            response.put("authenticated", false);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/success")
    public RedirectView loginSuccess() {
        // 認証成功後、フロントエンドのダッシュボードにリダイレクト
        return new RedirectView("http://localhost:3000/dashboard");
    }

    @GetMapping("/failure")
    public ResponseEntity<Map<String, String>> loginFailure() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Login failed");
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/logout")
    public void logoutGet(@AuthenticationPrincipal OAuth2User principal,
                         HttpServletRequest request, 
                         HttpServletResponse response) throws Exception {
        
        String keycloakLogoutUrl = "http://localhost:3000?logout=success";
        
        try {
            // 1. ID Tokenを取得してKeyCloakログアウトURL構築
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof OAuth2AuthenticationToken) {
                OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                
                // OidcUserの場合はID Tokenが取得可能
                if (principal instanceof OidcUser) {
                    OidcUser oidcUser = (OidcUser) principal;
                    String idToken = oidcUser.getIdToken().getTokenValue();
                    
                    // KeyCloak 26.x対応のログアウトURL構築
                    keycloakLogoutUrl = "http://localhost:8180/realms/training-app/protocol/openid-connect/logout" +
                        "?id_token_hint=" + idToken +
                        "&post_logout_redirect_uri=" + java.net.URLEncoder.encode("http://localhost:3000?logout=success", "UTF-8");
                } else {
                    // OidcUserでない場合はOAuth2AuthorizedClientからトークンを取得
                    OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                        oauthToken.getAuthorizedClientRegistrationId(), 
                        oauthToken.getName()
                    );
                    
                    if (authorizedClient != null) {
                        // KeyCloakログアウトURL（ID Token なし）
                        keycloakLogoutUrl = "http://localhost:8180/realms/training-app/protocol/openid-connect/logout" +
                            "?post_logout_redirect_uri=" + java.net.URLEncoder.encode("http://localhost:3000?logout=success", "UTF-8");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("KeyCloak logout URL construction error: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 2. Spring Security セッションを無効化
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        
        // 3. 認証をクリア
        SecurityContextHolder.clearContext();
        
        // 4. 全てのCookieを削除
        Cookie jsessionCookie = new Cookie("JSESSIONID", null);
        jsessionCookie.setMaxAge(0);
        jsessionCookie.setPath("/");
        response.addCookie(jsessionCookie);
        
        // OAuth2関連のCookieも削除
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                Cookie deleteCookie = new Cookie(cookie.getName(), null);
                deleteCookie.setMaxAge(0);
                deleteCookie.setPath("/");
                response.addCookie(deleteCookie);
            }
        }
        
        // 5. KeyCloakログアウトまたはフロントエンドにリダイレクト
        response.sendRedirect(keycloakLogoutUrl);
    }

    @GetMapping("/logout-success")
    public ResponseEntity<Map<String, String>> logoutSuccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout completed");
        return ResponseEntity.ok(response);
    }
}