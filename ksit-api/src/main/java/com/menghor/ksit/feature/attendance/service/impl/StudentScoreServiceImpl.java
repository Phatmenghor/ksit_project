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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentScoreServiceImpl implements StudentScoreService {

    private final StudentScoreRepository studentScoreRepository;
    private final StudentScoreMapper studentScoreMapper;
    private final GradeUtilityService gradeUtilityService;

    @Override
    public StudentScoreResponseDto getStudentScoreById(Long id) {
        log.info("Retrieving student score studentScoreId={}", id);

        StudentScoreEntity studentScore = studentScoreRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Student score not found with ID: " + id));

        log.info("Successfully retrieved student score studentScoreId={} for studentId={} in sessionId={}",
                id, studentScore.getStudent().getId(), studentScore.getScoreSession().getId());

        return studentScoreMapper.toDto(studentScore);
    }

    @Override
    @Transactional
    public StudentScoreResponseDto updateStudentScore(StudentScoreUpdateDto updateDto) {
        log.info("Starting update for student score studentScoreId={}", updateDto.getId());

        StudentScoreEntity studentScore = studentScoreRepository.findById(updateDto.getId())
                .orElseThrow(() -> new NotFoundException("Student score not found with ID: " + updateDto.getId()));

        log.info("Found student score for studentId={} in sessionId={} - Current total score: {}",
                studentScore.getStudent().getId(), 
                studentScore.getScoreSession().getId(),
                studentScore.getTotalScore());

        // Get score configuration for validation
        ScoreConfigurationEntity config = studentScore.getScoreConfiguration();
        if (config == null) {
            throw new IllegalStateException("No score configuration found for this student score");
        }

        log.info("Score configuration limits - Attendance: {}%, Assignment: {}%, Midterm: {}%, Final: {}%",
                config.getAttendancePercentage(), config.getAssignmentPercentage(),
                config.getMidtermPercentage(), config.getFinalPercentage());

        // Track what was updated for logging
        boolean hasUpdates = false;

        // Validate and update scores with percentage limits
        if (updateDto.getAssignmentScore() != null) {
            validateScoreLimit(updateDto.getAssignmentScore(), config.getAssignmentPercentage(), "Assignment");
            studentScore.setAssignmentScore(BigDecimal.valueOf(updateDto.getAssignmentScore()));
            log.info("Assignment score updated to {} for studentScoreId={}",
                    updateDto.getAssignmentScore(), updateDto.getId());
            hasUpdates = true;
        }

        if (updateDto.getMidtermScore() != null) {
            validateScoreLimit(updateDto.getMidtermScore(), config.getMidtermPercentage(), "Midterm");
            studentScore.setMidtermScore(BigDecimal.valueOf(updateDto.getMidtermScore()));
            log.info("Midterm score updated to {} for studentScoreId={}",
                    updateDto.getMidtermScore(), updateDto.getId());
            hasUpdates = true;
        }

        if (updateDto.getFinalScore() != null) {
            validateScoreLimit(updateDto.getFinalScore(), config.getFinalPercentage(), "Final");
            studentScore.setFinalScore(BigDecimal.valueOf(updateDto.getFinalScore()));
            log.info("Final score updated to {} for studentScoreId={}",
                    updateDto.getFinalScore(), updateDto.getId());
            hasUpdates = true;
        }

        if (updateDto.getComments() != null) {
            studentScore.setComments(updateDto.getComments());
            log.info("Comments updated for studentScoreId={}", updateDto.getId());
            hasUpdates = true;
        }

        if (!hasUpdates) {
            log.info("No score updates provided for studentScoreId={}", updateDto.getId());
            return studentScoreMapper.toDto(studentScore);
        }

        // Calculate total score and grade using Cambodian system
        calculateTotalScoreAndGrade(studentScore);

        // Save the updated score
        StudentScoreEntity updatedScore = studentScoreRepository.save(studentScore);

        log.info("Student score update completed for studentScoreId={} - Final scores: Assignment={}, Midterm={}, Final={}, Attendance={}, Total={}, Grade={}",
                updateDto.getId(),
                updatedScore.getAssignmentScore(),
                updatedScore.getMidtermScore(),
                updatedScore.getFinalScore(),
                updatedScore.getAttendanceScore(),
                updatedScore.getTotalScore(),
                updatedScore.getGrade());

        // Log grade details
        String gradeDescription = gradeUtilityService.getGradeDescription(updatedScore.getGrade());
        String gradeRange = gradeUtilityService.getGradeRange(updatedScore.getGrade());
        boolean isPassing = gradeUtilityService.isPassing(updatedScore.getGrade());
        
        log.info("Grade details for studentScoreId={}: {} ({}) - Range: {}, Passing: {}",
                updateDto.getId(), updatedScore.getGrade(), gradeDescription, gradeRange, isPassing);

        return studentScoreMapper.toDto(updatedScore);
    }

    /**
     * Validate score is within the allowed percentage limit for the score type
     */
    private void validateScoreLimit(Double score, Integer maxPercentage, String scoreType) {
        // Validate score is not null
        if (score == null) {
            throw new IllegalArgumentException(scoreType + " score cannot be null");
        }

        // Validate score is within 0-maxPercentage range
        if (score < 0) {
            throw new IllegalArgumentException(
                    String.format("%s score cannot be negative. You entered: %.2f", scoreType, score)
            );
        }

        if (score > maxPercentage) {
            throw new IllegalArgumentException(
                    String.format("%s score cannot exceed %d%% (current percentage limit). You entered: %.2f",
                            scoreType, maxPercentage, score)
            );
        }

        // Validate score is a reasonable number (not too many decimal places)
        if (!gradeUtilityService.isValidScore(score)) {
            throw new IllegalArgumentException(
                    String.format("%s score must be between 0 and 100. You entered: %.2f", scoreType, score)
            );
        }

        log.debug("Score validation passed: {} score {} is within limit of {}%", scoreType, score, maxPercentage);
    }

    /**
     * Calculate total score and grade using the Cambodian grading system
     */
    private void calculateTotalScoreAndGrade(StudentScoreEntity studentScore) {
        // Calculate total score (simple addition since scores are already in their final weighted form)
        BigDecimal totalScore = safeAdd(studentScore.getAttendanceScore())
                .add(safeAdd(studentScore.getAssignmentScore()))
                .add(safeAdd(studentScore.getMidtermScore()))
                .add(safeAdd(studentScore.getFinalScore()));

        studentScore.setTotalScore(totalScore);

        // Calculate grade using the Cambodian grading system
        String calculatedGrade = gradeUtilityService.calculateGrade(totalScore);
        studentScore.setGrade(calculatedGrade);

        log.info("Score calculation completed: Assignment={}, Midterm={}, Final={}, Attendance={}, Total={}, Grade={}",
                studentScore.getAssignmentScore(),
                studentScore.getMidtermScore(),
                studentScore.getFinalScore(),
                studentScore.getAttendanceScore(),
                totalScore,
                calculatedGrade);

        // Log additional grade information
        String gradeDescription = gradeUtilityService.getGradeDescription(calculatedGrade);
        String gradeDescriptionKhmer = gradeUtilityService.getGradeDescriptionKhmer(calculatedGrade);
        double gradePoint = gradeUtilityService.getGradePoint(calculatedGrade);
        
        log.info("Grade details: {} - {} / {} - Grade Point: {}",
                calculatedGrade, gradeDescription, gradeDescriptionKhmer, gradePoint);
    }

    /**
     * Safely add BigDecimal values, treating null as zero
     */
    private BigDecimal safeAdd(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}