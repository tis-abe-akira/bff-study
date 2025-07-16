package com.example.backend.repository;

import com.example.backend.entity.TrainingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, Long> {
    
    List<TrainingPlan> findByUserId(String userId);
    
    Optional<TrainingPlan> findByIdAndUserId(Long id, String userId);
    
    void deleteByIdAndUserId(Long id, String userId);
    
    List<TrainingPlan> findByUserIdAndType(String userId, String type);
    
    List<TrainingPlan> findByUserIdAndDifficulty(String userId, String difficulty);
}