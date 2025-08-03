package com.example.backend.controller;

import com.example.backend.entity.Training;
import com.example.backend.service.TrainingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.auth0.jwt.JWT;
import com.auth0.jwt.exceptions.JWTDecodeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trainings")
@Tag(name = "Training", description = "Training management API")
public class TrainingController {

    private static final Logger logger = LoggerFactory.getLogger(TrainingController.class);

    @Autowired
    private TrainingService trainingService;

    @GetMapping
    @Operation(summary = "Get all trainings for user", description = "Retrieve all trainings for a specific user")
    public ResponseEntity<List<Training>> getAllTrainings(
            @Parameter(description = "Authorization Bearer token") @RequestHeader("Authorization") String authorization,
            @Parameter(description = "Filter by training type") @RequestParam(required = false) String type,
            @Parameter(description = "Filter by difficulty") @RequestParam(required = false) String difficulty,
            @Parameter(description = "Search by title") @RequestParam(required = false) String search,
            @Parameter(description = "Minimum duration in minutes") @RequestParam(required = false) Integer minDuration,
            @Parameter(description = "Maximum duration in minutes") @RequestParam(required = false) Integer maxDuration) {
        
        String userId = extractUserIdFromJWT(authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Training> trainings;
        
        if (search != null && !search.trim().isEmpty()) {
            trainings = trainingService.searchTrainingsByTitle(userId, search.trim());
        } else if (type != null && !type.trim().isEmpty()) {
            trainings = trainingService.getTrainingsByType(userId, type);
        } else if (difficulty != null && !difficulty.trim().isEmpty()) {
            trainings = trainingService.getTrainingsByDifficulty(userId, difficulty);
        } else if (minDuration != null && maxDuration != null) {
            trainings = trainingService.getTrainingsByDuration(userId, minDuration, maxDuration);
        } else {
            trainings = trainingService.getAllTrainings(userId);
        }
        
        return ResponseEntity.ok(trainings);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get training by ID", description = "Retrieve a specific training by ID")
    public ResponseEntity<Training> getTrainingById(
            @Parameter(description = "Training ID") @PathVariable Long id,
            @Parameter(description = "Authorization Bearer token") @RequestHeader("Authorization") String authorization) {
        
        String userId = extractUserIdFromJWT(authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Training> training = trainingService.getTrainingById(id, userId);
        
        if (training.isPresent()) {
            return ResponseEntity.ok(training.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create new training", description = "Create a new training session")
    public ResponseEntity<Training> createTraining(
            @Parameter(description = "Authorization Bearer token") @RequestHeader("Authorization") String authorization,
            @RequestBody Training training) {
        
        String userId = extractUserIdFromJWT(authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // ユーザーIDを設定
        training.setUserId(userId);
        
        Training createdTraining = trainingService.createTraining(training);
        return ResponseEntity.ok(createdTraining);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update training", description = "Update an existing training session")
    public ResponseEntity<Training> updateTraining(
            @Parameter(description = "Training ID") @PathVariable Long id,
            @Parameter(description = "Authorization Bearer token") @RequestHeader("Authorization") String authorization,
            @RequestBody Training trainingDetails) {
        
        String userId = extractUserIdFromJWT(authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Training> updatedTraining = trainingService.updateTraining(id, trainingDetails, userId);
        
        if (updatedTraining.isPresent()) {
            return ResponseEntity.ok(updatedTraining.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete training", description = "Delete a training session")
    public ResponseEntity<Void> deleteTraining(
            @Parameter(description = "Training ID") @PathVariable Long id,
            @Parameter(description = "Authorization Bearer token") @RequestHeader("Authorization") String authorization) {
        
        String userId = extractUserIdFromJWT(authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        boolean deleted = trainingService.deleteTraining(id, userId);
        
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/types")
    @Operation(summary = "Get available training types", description = "Get list of available training types")
    public ResponseEntity<List<String>> getTrainingTypes(@Parameter(description = "Authorization Bearer token") @RequestHeader("Authorization") String authorization) {
        String userId = extractUserIdFromJWT(authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<String> types = List.of("strength", "cardio", "flexibility", "core");
        return ResponseEntity.ok(types);
    }

    @GetMapping("/difficulties")
    @Operation(summary = "Get available difficulties", description = "Get list of available difficulty levels")
    public ResponseEntity<List<String>> getDifficulties(@Parameter(description = "Authorization Bearer token") @RequestHeader("Authorization") String authorization) {
        String userId = extractUserIdFromJWT(authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<String> difficulties = List.of("beginner", "intermediate", "advanced");
        return ResponseEntity.ok(difficulties);
    }

    private String extractUserIdFromJWT(String authorization) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                logger.error("Invalid Authorization header format");
                return null;
            }
            
            String token = authorization.substring(7); // "Bearer " を除去
            var decodedJWT = JWT.decode(token);
            String userId = decodedJWT.getSubject();
            
            logger.info("JWT認証成功 - ユーザーID: {}", userId);
            return userId;
            
        } catch (JWTDecodeException e) {
            logger.error("JWT解析エラー: {}", e.getMessage());
            return null;
        }
    }
}