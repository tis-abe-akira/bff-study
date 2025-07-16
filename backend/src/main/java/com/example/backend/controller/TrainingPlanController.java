package com.example.backend.controller;

import com.example.backend.entity.TrainingPlan;
import com.example.backend.service.TrainingPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/training-plans")
@CrossOrigin(origins = "http://localhost:8080")
public class TrainingPlanController {

    @Autowired
    private TrainingPlanService trainingPlanService;

    @GetMapping
    public ResponseEntity<List<TrainingPlan>> getAllTrainingPlans(@RequestHeader("X-User-ID") String userId) {
        List<TrainingPlan> plans = trainingPlanService.getAllTrainingPlans(userId);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingPlan> getTrainingPlan(@PathVariable Long id, @RequestHeader("X-User-ID") String userId) {
        Optional<TrainingPlan> plan = trainingPlanService.getTrainingPlanById(id, userId);
        
        if (plan.isPresent()) {
            return ResponseEntity.ok(plan.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<TrainingPlan> createTrainingPlan(@RequestBody TrainingPlan trainingPlan, @RequestHeader("X-User-ID") String userId) {
        trainingPlan.setUserId(userId);
        TrainingPlan savedPlan = trainingPlanService.createTrainingPlan(trainingPlan);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingPlan> updateTrainingPlan(@PathVariable Long id, @RequestBody TrainingPlan trainingPlan, @RequestHeader("X-User-ID") String userId) {
        Optional<TrainingPlan> updatedPlan = trainingPlanService.updateTrainingPlan(id, userId, trainingPlan);
        
        if (updatedPlan.isPresent()) {
            return ResponseEntity.ok(updatedPlan.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrainingPlan(@PathVariable Long id, @RequestHeader("X-User-ID") String userId) {
        boolean deleted = trainingPlanService.deleteTrainingPlan(id, userId);
        
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<TrainingPlan>> getTrainingPlansByType(@PathVariable String type, @RequestHeader("X-User-ID") String userId) {
        List<TrainingPlan> plans = trainingPlanService.getTrainingPlansByType(userId, type);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<TrainingPlan>> getTrainingPlansByDifficulty(@PathVariable String difficulty, @RequestHeader("X-User-ID") String userId) {
        List<TrainingPlan> plans = trainingPlanService.getTrainingPlansByDifficulty(userId, difficulty);
        return ResponseEntity.ok(plans);
    }
}