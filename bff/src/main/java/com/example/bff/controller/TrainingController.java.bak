package com.example.bff.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/trainings")
public class TrainingController {

    @Value("${backend.url}")
    private String backendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping
    public ResponseEntity<?> getAllTrainings(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getAttribute("sub");
        
        // Query parameters construction
        StringBuilder queryParams = new StringBuilder();
        if (type != null) queryParams.append("&type=").append(type);
        if (difficulty != null) queryParams.append("&difficulty=").append(difficulty);
        if (search != null) queryParams.append("&search=").append(search);
        if (minDuration != null) queryParams.append("&minDuration=").append(minDuration);
        if (maxDuration != null) queryParams.append("&maxDuration=").append(maxDuration);
        
        String query = queryParams.length() > 0 ? "?" + queryParams.substring(1) : "";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-ID", userId);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                backendUrl + "/api/trainings" + query,
                HttpMethod.GET,
                entity,
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch trainings: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTrainingById(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long id) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getAttribute("sub");

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-ID", userId);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                backendUrl + "/api/trainings/" + id,
                HttpMethod.GET,
                entity,
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch training: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTraining(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, Object> training) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getAttribute("sub");

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-ID", userId);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(training, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                backendUrl + "/api/trainings",
                HttpMethod.POST,
                entity,
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create training: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTraining(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> training) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getAttribute("sub");

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-ID", userId);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(training, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                backendUrl + "/api/trainings/" + id,
                HttpMethod.PUT,
                entity,
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update training: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTraining(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long id) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getAttribute("sub");

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-ID", userId);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                backendUrl + "/api/trainings/" + id,
                HttpMethod.DELETE,
                entity,
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete training: " + e.getMessage()));
        }
    }

    @GetMapping("/types")
    public ResponseEntity<?> getTrainingTypes(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(
                backendUrl + "/api/trainings/types",
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch training types: " + e.getMessage()));
        }
    }

    @GetMapping("/difficulties")
    public ResponseEntity<?> getDifficulties(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(
                backendUrl + "/api/trainings/difficulties",
                Object.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch difficulties: " + e.getMessage()));
        }
    }
}