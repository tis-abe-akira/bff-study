package com.example.apigateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
@RequestMapping("/api")
public class ProxyController {

    @Value("${backend.url}")
    private String backendUrl;

    private final WebClient webClient;

    public ProxyController() {
        this.webClient = WebClient.builder().build();
    }

    @GetMapping("/training-plans")
    public ResponseEntity<?> getTrainingPlans(@RequestHeader("X-User-ID") String userId) {
        return webClient.get()
            .uri(backendUrl + "/api/training-plans")
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PostMapping("/training-plans")
    public ResponseEntity<?> createTrainingPlan(@RequestHeader("X-User-ID") String userId,
                                               @RequestBody Object trainingPlan) {
        return webClient.post()
            .uri(backendUrl + "/api/training-plans")
            .header("X-User-ID", userId)
            .bodyValue(trainingPlan)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/training-plans/{id}")
    public ResponseEntity<?> getTrainingPlan(@RequestHeader("X-User-ID") String userId,
                                            @PathVariable String id) {
        return webClient.get()
            .uri(backendUrl + "/api/training-plans/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PutMapping("/training-plans/{id}")
    public ResponseEntity<?> updateTrainingPlan(@RequestHeader("X-User-ID") String userId,
                                               @PathVariable String id,
                                               @RequestBody Object trainingPlan) {
        return webClient.put()
            .uri(backendUrl + "/api/training-plans/" + id)
            .header("X-User-ID", userId)
            .bodyValue(trainingPlan)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @DeleteMapping("/training-plans/{id}")
    public ResponseEntity<?> deleteTrainingPlan(@RequestHeader("X-User-ID") String userId,
                                               @PathVariable String id) {
        return webClient.delete()
            .uri(backendUrl + "/api/training-plans/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }
}