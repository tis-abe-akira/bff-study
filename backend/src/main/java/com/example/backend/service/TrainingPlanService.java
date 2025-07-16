package com.example.backend.service;

import com.example.backend.entity.TrainingPlan;
import com.example.backend.repository.TrainingPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TrainingPlanService {

    @Autowired
    private TrainingPlanRepository trainingPlanRepository;

    public List<TrainingPlan> getAllTrainingPlans(String userId) {
        return trainingPlanRepository.findByUserId(userId);
    }

    public Optional<TrainingPlan> getTrainingPlanById(Long id, String userId) {
        return trainingPlanRepository.findByIdAndUserId(id, userId);
    }

    public TrainingPlan createTrainingPlan(TrainingPlan trainingPlan) {
        trainingPlan.setCreatedAt(LocalDateTime.now());
        trainingPlan.setUpdatedAt(LocalDateTime.now());
        return trainingPlanRepository.save(trainingPlan);
    }

    public Optional<TrainingPlan> updateTrainingPlan(Long id, String userId, TrainingPlan updatedPlan) {
        Optional<TrainingPlan> existingPlan = trainingPlanRepository.findByIdAndUserId(id, userId);
        
        if (existingPlan.isPresent()) {
            TrainingPlan plan = existingPlan.get();
            plan.setName(updatedPlan.getName());
            plan.setDescription(updatedPlan.getDescription());
            plan.setType(updatedPlan.getType());
            plan.setDuration(updatedPlan.getDuration());
            plan.setDifficulty(updatedPlan.getDifficulty());
            plan.setUpdatedAt(LocalDateTime.now());
            
            return Optional.of(trainingPlanRepository.save(plan));
        }
        
        return Optional.empty();
    }

    public boolean deleteTrainingPlan(Long id, String userId) {
        Optional<TrainingPlan> plan = trainingPlanRepository.findByIdAndUserId(id, userId);
        
        if (plan.isPresent()) {
            trainingPlanRepository.deleteByIdAndUserId(id, userId);
            return true;
        }
        
        return false;
    }

    public List<TrainingPlan> getTrainingPlansByType(String userId, String type) {
        return trainingPlanRepository.findByUserIdAndType(userId, type);
    }

    public List<TrainingPlan> getTrainingPlansByDifficulty(String userId, String difficulty) {
        return trainingPlanRepository.findByUserIdAndDifficulty(userId, difficulty);
    }
}