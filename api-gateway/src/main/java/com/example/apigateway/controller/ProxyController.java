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

    @GetMapping("/trainings")
    public ResponseEntity<?> getTrainings(@RequestHeader("X-User-ID") String userId,
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
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PostMapping("/trainings")
    public ResponseEntity<?> createTraining(@RequestHeader("X-User-ID") String userId,
                                           @RequestBody Object training) {
        return webClient.post()
            .uri(backendUrl + "/api/trainings")
            .header("X-User-ID", userId)
            .bodyValue(training)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/trainings/{id}")
    public ResponseEntity<?> getTraining(@RequestHeader("X-User-ID") String userId,
                                        @PathVariable String id) {
        return webClient.get()
            .uri(backendUrl + "/api/trainings/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @PutMapping("/trainings/{id}")
    public ResponseEntity<?> updateTraining(@RequestHeader("X-User-ID") String userId,
                                           @PathVariable String id,
                                           @RequestBody Object training) {
        return webClient.put()
            .uri(backendUrl + "/api/trainings/" + id)
            .header("X-User-ID", userId)
            .bodyValue(training)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @DeleteMapping("/trainings/{id}")
    public ResponseEntity<?> deleteTraining(@RequestHeader("X-User-ID") String userId,
                                           @PathVariable String id) {
        return webClient.delete()
            .uri(backendUrl + "/api/trainings/" + id)
            .header("X-User-ID", userId)
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/trainings/types")
    public ResponseEntity<?> getTrainingTypes() {
        return webClient.get()
            .uri(backendUrl + "/api/trainings/types")
            .retrieve()
            .toEntity(Object.class)
            .block();
    }

    @GetMapping("/trainings/difficulties")
    public ResponseEntity<?> getDifficulties() {
        return webClient.get()
            .uri(backendUrl + "/api/trainings/difficulties")
            .retrieve()
            .toEntity(Object.class)
            .block();
    }
}