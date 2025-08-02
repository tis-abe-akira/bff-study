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

    @GetMapping("/trainings")
    public ResponseEntity<?> getTrainings(@AuthenticationPrincipal OAuth2User principal,
                                         @RequestParam(required = false) String type,
                                         @RequestParam(required = false) String difficulty,
                                         @RequestParam(required = false) String search,
                                         @RequestParam(required = false) Integer minDuration,
                                         @RequestParam(required = false) Integer maxDuration) {
        String userId = principal.getAttribute("sub");
        
        // Query parameters construction
        StringBuilder queryParams = new StringBuilder();
        if (type != null) queryParams.append("&type=").append(type);
        if (difficulty != null) queryParams.append("&difficulty=").append(difficulty);
        if (search != null) queryParams.append("&search=").append(search);
        if (minDuration != null) queryParams.append("&minDuration=").append(minDuration);
        if (maxDuration != null) queryParams.append("&maxDuration=").append(maxDuration);
        
        String query = queryParams.length() > 0 ? "?" + queryParams.substring(1) : "";
        
        return webClient.get()
            .uri(apiGatewayUrl + "/api/trainings" + query)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PostMapping("/trainings")
    public ResponseEntity<?> createTraining(@AuthenticationPrincipal OAuth2User principal,
                                           @RequestBody Object training) {
        String userId = principal.getAttribute("sub");
        
        return webClient.post()
            .uri(apiGatewayUrl + "/api/trainings")
            .header("X-User-ID", userId)
            .bodyValue(training)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/trainings/{id}")
    public ResponseEntity<?> getTraining(@AuthenticationPrincipal OAuth2User principal,
                                        @PathVariable String id) {
        String userId = principal.getAttribute("sub");
        
        return webClient.get()
            .uri(apiGatewayUrl + "/api/trainings/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PutMapping("/trainings/{id}")
    public ResponseEntity<?> updateTraining(@AuthenticationPrincipal OAuth2User principal,
                                           @PathVariable String id,
                                           @RequestBody Object training) {
        String userId = principal.getAttribute("sub");
        
        return webClient.put()
            .uri(apiGatewayUrl + "/api/trainings/" + id)
            .header("X-User-ID", userId)
            .bodyValue(training)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @DeleteMapping("/trainings/{id}")
    public ResponseEntity<?> deleteTraining(@AuthenticationPrincipal OAuth2User principal,
                                           @PathVariable String id) {
        String userId = principal.getAttribute("sub");
        
        return webClient.delete()
            .uri(apiGatewayUrl + "/api/trainings/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/trainings/types")
    public ResponseEntity<?> getTrainingTypes(@AuthenticationPrincipal OAuth2User principal) {
        return webClient.get()
            .uri(apiGatewayUrl + "/api/trainings/types")
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/trainings/difficulties")
    public ResponseEntity<?> getDifficulties(@AuthenticationPrincipal OAuth2User principal) {
        return webClient.get()
            .uri(apiGatewayUrl + "/api/trainings/difficulties")
            .retrieve()
            .toEntity(Object.class)
            .block();
    }
}