package com.menghor.ksit.feature.attendance.service.impl;

import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.attendance.dto.response.StudentScoreResponseDto;
import com.menghor.ksit.feature.attendance.dto.update.StudentScoreUpdateDto;
import com.menghor.ksit.feature.attendance.mapper.StudentScoreMapper;
import com.menghor.ksit.feature.attendance.models.ScoreConfigurationEntity;
import com.menghor.ksit.feature.attendance.models.StudentScoreEntity;
import com.menghor.ksit.feature.attendance.repository.StudentScoreRepository;
import com.menghor.ksit.feature.attendance.service.StudentScoreService;
import com.menghor.ksit.utils.service.GradeUtilityService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StudentScoreServiceImpl implements StudentScoreService {

    private final StudentScoreRepository studentScoreRepository;
    private final StudentScoreMapper studentScoreMapper;
    private final GradeUtilityService gradeUtilityService;

    @Override
    public StudentScoreResponseDto getStudentScoreById(Long id) {
        StudentScoreEntity studentScore = studentScoreRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Student score not found with ID: " + id));
        return studentScoreMapper.toDto(studentScore);
    }

    @Override
    @Transactional
    public StudentScoreResponseDto updateStudentScore(StudentScoreUpdateDto updateDto) {
        StudentScoreEntity studentScore = studentScoreRepository.findById(updateDto.getId())
                .orElseThrow(() -> new NotFoundException("Student score not found with ID: " + updateDto.getId()));

        ScoreConfigurationEntity config = studentScore.getScoreConfiguration();
        if (config == null) {
            throw new IllegalStateException("No score configuration found for this student score");
        }

        boolean hasUpdates = false;

        if (updateDto.getAttendanceScore() != null) {
            validateScoreLimit(updateDto.getAttendanceScore(), config.getAttendancePercentage(), "Attendance");
            studentScore.setAttendanceScore(BigDecimal.valueOf(updateDto.getAttendanceScore()));
            hasUpdates = true;
        }

        if (updateDto.getAssignmentScore() != null) {
            validateScoreLimit(updateDto.getAssignmentScore(), config.getAssignmentPercentage(), "Assignment");
            studentScore.setAssignmentScore(BigDecimal.valueOf(updateDto.getAssignmentScore()));
            hasUpdates = true;
        }

        if (updateDto.getMidtermScore() != null) {
            validateScoreLimit(updateDto.getMidtermScore(), config.getMidtermPercentage(), "Midterm");
            studentScore.setMidtermScore(BigDecimal.valueOf(updateDto.getMidtermScore()));
            hasUpdates = true;
        }

        if (updateDto.getFinalScore() != null) {
            validateScoreLimit(updateDto.getFinalScore(), config.getFinalPercentage(), "Final");
            studentScore.setFinalScore(BigDecimal.valueOf(updateDto.getFinalScore()));
            hasUpdates = true;
        }

        if (updateDto.getComments() != null) {
            studentScore.setComments(updateDto.getComments());
            hasUpdates = true;
        }

        if (!hasUpdates) {
            return studentScoreMapper.toDto(studentScore);
        }

        calculateTotalScoreAndGrade(studentScore);
        StudentScoreEntity updatedScore = studentScoreRepository.save(studentScore);
        return studentScoreMapper.toDto(updatedScore);
    }

    private void validateScoreLimit(Double score, Integer maxPercentage, String scoreType) {
        if (score == null) {
            throw new IllegalArgumentException(scoreType + " score cannot be null");
        }
        if (score < 0) {
            throw new IllegalArgumentException(
                    String.format("%s score cannot be negative. You entered: %.2f", scoreType, score));
        }
        if (score > maxPercentage) {
            throw new IllegalArgumentException(
                    String.format("%s score cannot exceed %d%% (current percentage limit). You entered: %.2f",
                            scoreType, maxPercentage, score));
        }
        if (!gradeUtilityService.isValidScore(score)) {
            throw new IllegalArgumentException(
                    String.format("%s score must be between 0 and 100. You entered: %.2f", scoreType, score));
        }
    }

    private void calculateTotalScoreAndGrade(StudentScoreEntity studentScore) {
        BigDecimal totalScore = safeAdd(studentScore.getAttendanceScore())
                .add(safeAdd(studentScore.getAssignmentScore()))
                .add(safeAdd(studentScore.getMidtermScore()))
                .add(safeAdd(studentScore.getFinalScore()));
        studentScore.setTotalScore(totalScore);
        studentScore.setGrade(gradeUtilityService.calculateGrade(totalScore));
    }

    private BigDecimal safeAdd(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
