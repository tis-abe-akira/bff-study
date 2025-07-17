package com.example.backend.service;

import com.example.backend.entity.Training;
import com.example.backend.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrainingService {

    @Autowired
    private TrainingRepository trainingRepository;

    // 全トレーニング取得（ユーザー別）
    public List<Training> getAllTrainings(String userId) {
        return trainingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // IDでトレーニング取得
    public Optional<Training> getTrainingById(Long id, String userId) {
        Optional<Training> training = trainingRepository.findById(id);
        // ユーザーのトレーニングかチェック
        if (training.isPresent() && !training.get().getUserId().equals(userId)) {
            return Optional.empty();
        }
        return training;
    }

    // トレーニング作成
    public Training createTraining(Training training) {
        return trainingRepository.save(training);
    }

    // トレーニング更新
    public Optional<Training> updateTraining(Long id, Training trainingDetails, String userId) {
        Optional<Training> trainingOpt = getTrainingById(id, userId);
        
        if (trainingOpt.isPresent()) {
            Training training = trainingOpt.get();
            training.setTitle(trainingDetails.getTitle());
            training.setDescription(trainingDetails.getDescription());
            training.setType(trainingDetails.getType());
            training.setDurationMinutes(trainingDetails.getDurationMinutes());
            training.setDifficulty(trainingDetails.getDifficulty());
            return Optional.of(trainingRepository.save(training));
        }
        
        return Optional.empty();
    }

    // トレーニング削除
    public boolean deleteTraining(Long id, String userId) {
        Optional<Training> training = getTrainingById(id, userId);
        if (training.isPresent()) {
            trainingRepository.delete(training.get());
            return true;
        }
        return false;
    }

    // タイプで検索
    public List<Training> getTrainingsByType(String userId, String type) {
        return trainingRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
    }

    // 難易度で検索
    public List<Training> getTrainingsByDifficulty(String userId, String difficulty) {
        return trainingRepository.findByUserIdAndDifficultyOrderByCreatedAtDesc(userId, difficulty);
    }

    // タイトル検索
    public List<Training> searchTrainingsByTitle(String userId, String title) {
        return trainingRepository.findByUserIdAndTitleContaining(userId, title);
    }

    // 期間で検索
    public List<Training> getTrainingsByDuration(String userId, Integer minDuration, Integer maxDuration) {
        return trainingRepository.findByUserIdAndDurationMinutesBetweenOrderByCreatedAtDesc(userId, minDuration, maxDuration);
    }
}