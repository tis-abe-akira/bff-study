package com.example.bff.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
@RequestMapping("/api")
public class TrainingApiController {

    @Value("${api-gateway.url}")
    private String apiGatewayUrl;

    private final WebClient webClient;

    public TrainingApiController() {
        this.webClient = WebClient.builder().build();
    }

    @GetMapping("/training-plans")
    public ResponseEntity<?> getTrainingPlans(@AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("sub");
        
        return webClient.get()
            .uri(apiGatewayUrl + "/api/training-plans")
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PostMapping("/training-plans")
    public ResponseEntity<?> createTrainingPlan(@AuthenticationPrincipal OAuth2User principal,
                                               @RequestBody Object trainingPlan) {
        String userId = principal.getAttribute("sub");
        
        return webClient.post()
            .uri(apiGatewayUrl + "/api/training-plans")
            .header("X-User-ID", userId)
            .bodyValue(trainingPlan)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/training-plans/{id}")
    public ResponseEntity<?> getTrainingPlan(@AuthenticationPrincipal OAuth2User principal,
                                            @PathVariable String id) {
        String userId = principal.getAttribute("sub");
        
        return webClient.get()
            .uri(apiGatewayUrl + "/api/training-plans/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PutMapping("/training-plans/{id}")
    public ResponseEntity<?> updateTrainingPlan(@AuthenticationPrincipal OAuth2User principal,
                                               @PathVariable String id,
                                               @RequestBody Object trainingPlan) {
        String userId = principal.getAttribute("sub");
        
        return webClient.put()
            .uri(apiGatewayUrl + "/api/training-plans/" + id)
            .header("X-User-ID", userId)
            .bodyValue(trainingPlan)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @DeleteMapping("/training-plans/{id}")
    public ResponseEntity<?> deleteTrainingPlan(@AuthenticationPrincipal OAuth2User principal,
                                               @PathVariable String id) {
        String userId = principal.getAttribute("sub");
        
        return webClient.delete()
            .uri(apiGatewayUrl + "/api/training-plans/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }
}