package com.example.bff.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public void logoutGet(HttpServletRequest request, HttpServletResponse response) throws Exception {
        // 1. Spring Security セッションを無効化
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        
        // 2. 認証をクリア
        SecurityContextHolder.clearContext();
        
        // 3. 全てのCookieを削除
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
        
        // 4. シンプルにフロントエンドにリダイレクト
        response.sendRedirect("http://localhost:3000?logout=success");
    }

    @GetMapping("/logout-success")
    public ResponseEntity<Map<String, String>> logoutSuccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout completed");
        return ResponseEntity.ok(response);
    }
}