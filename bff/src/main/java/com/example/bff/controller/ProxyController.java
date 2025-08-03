package com.example.bff.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/proxy")
public class ProxyController {

    @Value("${api-gateway.url}")
    private String apiGatewayUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @RequestMapping("/**")
    public ResponseEntity<?> proxyRequest(
            @AuthenticationPrincipal OidcUser principal,
            HttpServletRequest request,
            @RequestBody(required = false) Object body) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // JWTトークンを取得
        String idToken = principal.getIdToken().getTokenValue();
        
        // プロキシ先のパスを構築
        String path = request.getRequestURI().substring("/api/proxy".length());
        String queryString = request.getQueryString();
        String targetUrl = apiGatewayUrl + "/api" + path;
        if (queryString != null) {
            targetUrl += "?" + queryString;
        }

        // ヘッダー設定
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + idToken);
        if (body != null) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }

        HttpEntity<Object> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                targetUrl,
                HttpMethod.valueOf(request.getMethod()),
                entity,
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Proxy request failed: " + e.getMessage()));
        }
    }
}