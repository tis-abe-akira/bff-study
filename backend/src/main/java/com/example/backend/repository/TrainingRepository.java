package com.example.backend.repository;

import com.example.backend.entity.Training;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {
    
    // ユーザーIDでトレーニングを検索
    List<Training> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // トレーニングタイプで検索
    List<Training> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, String type);
    
    // 難易度で検索
    List<Training> findByUserIdAndDifficultyOrderByCreatedAtDesc(String userId, String difficulty);
    
    // タイトル検索（部分一致）
    @Query("SELECT t FROM Training t WHERE t.userId = :userId AND t.title LIKE %:title% ORDER BY t.createdAt DESC")
    List<Training> findByUserIdAndTitleContaining(@Param("userId") String userId, @Param("title") String title);
    
    // 期間で検索
    List<Training> findByUserIdAndDurationMinutesBetweenOrderByCreatedAtDesc(String userId, Integer minDuration, Integer maxDuration);
}