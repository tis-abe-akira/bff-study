package com.example.bff.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

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

    @GetMapping("/logout-success")
    public ResponseEntity<Map<String, String>> logoutSuccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout completed");
        return ResponseEntity.ok(response);
    }
}