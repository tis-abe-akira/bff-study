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
    public ResponseEntity<?> getTrainingPlans(@RequestHeader(value = "Authorization", required = true) String authorization,
                                             @RequestParam(required = false) String type,
                                             @RequestParam(required = false) String difficulty,
                                             @RequestParam(required = false) String search,
                                             @RequestParam(required = false) Integer minDuration,
                                             @RequestParam(required = false) Integer maxDuration) {
        // Query parameters construction
        StringBuilder queryParams = new StringBuilder();
        if (type != null) queryParams.append("&type=").append(type);
        if (difficulty != null) queryParams.append("&difficulty=").append(difficulty);
        if (search != null) queryParams.append("&search=").append(search);
        if (minDuration != null) queryParams.append("&minDuration=").append(minDuration);
        if (maxDuration != null) queryParams.append("&maxDuration=").append(maxDuration);
        
        String query = queryParams.length() > 0 ? "?" + queryParams.substring(1) : "";
        
        return webClient.get()
            .uri(backendUrl + "/api/trainings" + query)
            .header("Authorization", authorization)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PostMapping("/training-plans")
    public ResponseEntity<?> createTrainingPlan(@RequestHeader(value = "Authorization", required = true) String authorization,
                                               @RequestBody Object trainingPlan) {
        return webClient.post()
            .uri(backendUrl + "/api/trainings")
            .header("Authorization", authorization)
            .bodyValue(trainingPlan)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/training-plans/{id}")
    public ResponseEntity<?> getTrainingPlan(@RequestHeader(value = "Authorization", required = true) String authorization,
                                            @PathVariable String id) {
        return webClient.get()
            .uri(backendUrl + "/api/trainings/" + id)
            .header("Authorization", authorization)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PutMapping("/training-plans/{id}")
    public ResponseEntity<?> updateTrainingPlan(@RequestHeader(value = "Authorization", required = true) String authorization,
                                               @PathVariable String id,
                                               @RequestBody Object trainingPlan) {
        return webClient.put()
            .uri(backendUrl + "/api/trainings/" + id)
            .header("Authorization", authorization)
            .bodyValue(trainingPlan)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @DeleteMapping("/training-plans/{id}")
    public ResponseEntity<?> deleteTrainingPlan(@RequestHeader(value = "Authorization", required = true) String authorization,
                                               @PathVariable String id) {
        return webClient.delete()
            .uri(backendUrl + "/api/trainings/" + id)
            .header("Authorization", authorization)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/training-plans/types")
    public ResponseEntity<?> getTrainingTypes(@RequestHeader(value = "Authorization", required = true) String authorization) {
        return webClient.get()
            .uri(backendUrl + "/api/trainings/types")
            .header("Authorization", authorization)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/training-plans/difficulties")
    public ResponseEntity<?> getTrainingDifficulties(@RequestHeader(value = "Authorization", required = true) String authorization) {
        return webClient.get()
            .uri(backendUrl + "/api/trainings/difficulties")
            .header("Authorization", authorization)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }
}