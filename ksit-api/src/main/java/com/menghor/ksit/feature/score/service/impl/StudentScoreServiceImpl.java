package com.menghor.ksit.feature.score.service.impl;

import com.menghor.ksit.enumations.AttendanceFinalizationStatus;
import com.menghor.ksit.enumations.AttendanceStatus;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.attendance.repository.AttendanceRepository;
import com.menghor.ksit.feature.attendance.repository.AttendanceSessionRepository;
import com.menghor.ksit.feature.score.dto.response.StudentScoreResponseDto;
import com.menghor.ksit.feature.score.dto.update.StudentScoreUpdateDto;
import com.menghor.ksit.feature.score.mapper.StudentScoreMapper;
import com.menghor.ksit.feature.score.models.ScoreConfigurationEntity;
import com.menghor.ksit.feature.score.models.StudentScoreEntity;
import com.menghor.ksit.feature.score.repository.ScoreConfigurationRepository;
import com.menghor.ksit.feature.score.repository.StudentScoreRepository;
import com.menghor.ksit.feature.score.service.StudentScoreService;
import com.menghor.ksit.utils.service.GradeUtilityService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentScoreServiceImpl implements StudentScoreService {

    private final StudentScoreRepository studentScoreRepository;
    private final StudentScoreMapper studentScoreMapper;
    private final GradeUtilityService gradeUtilityService;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final ScoreConfigurationRepository scoreConfigurationRepository;

    @Override
    public StudentScoreResponseDto getStudentScoreById(Long id) {
        log.info("Fetching student score id={}", id);
        StudentScoreEntity studentScore = studentScoreRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Student score not found with ID: {}", id);
                    return new NotFoundException("Student score not found with ID: " + id);
                });
        return studentScoreMapper.toDto(studentScore);
    }

    @Override
    @Transactional
    public StudentScoreResponseDto updateStudentScore(StudentScoreUpdateDto updateDto) {
        log.info("Updating student score id={}", updateDto.getId());
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
        log.info("Student score id={} updated successfully. totalScore={}", updateDto.getId(), updatedScore.getTotalScore());
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

    @Override
    @Transactional
    public void recalculateAttendanceScores(Long scheduleId) {
        log.info("Recalculating attendance scores for scheduleId={}", scheduleId);

        List<StudentScoreEntity> studentScores = studentScoreRepository.findByScoreSessionScheduleId(scheduleId);
        if (studentScores.isEmpty()) {
            log.info("No student scores found for scheduleId={}, skipping recalculation", scheduleId);
            return;
        }

        long totalFinalizedSessions = attendanceSessionRepository.countByScheduleIdAndFinalizationStatus(
                scheduleId, AttendanceFinalizationStatus.FINAL
        );

        log.info("Total finalized attendance sessions for scheduleId={}: {}", scheduleId, totalFinalizedSessions);

        for (StudentScoreEntity studentScore : studentScores) {
            applyAttendanceScore(studentScore, scheduleId, totalFinalizedSessions);
        }

        studentScoreRepository.saveAll(studentScores);
        log.info("Successfully recalculated attendance scores for {} students under scheduleId={}",
                studentScores.size(), scheduleId);
    }

    @Override
    @Transactional
    public StudentScoreResponseDto recalculateAttendanceScoreForStudent(Long scheduleId, Long studentId) {
        log.info("Recalculating attendance score for studentId={} under scheduleId={}", studentId, scheduleId);

        StudentScoreEntity studentScore = studentScoreRepository
                .findByScoreSessionScheduleIdAndStudentId(scheduleId, studentId)
                .orElse(null);
        if (studentScore == null) {
            log.info("No student score found for studentId={} under scheduleId={}, skipping recalculation", studentId, scheduleId);
            return null;
        }

        long totalFinalizedSessions = attendanceSessionRepository.countByScheduleIdAndFinalizationStatus(
                scheduleId, AttendanceFinalizationStatus.FINAL
        );

        applyAttendanceScore(studentScore, scheduleId, totalFinalizedSessions);
        studentScoreRepository.save(studentScore);

        return studentScoreMapper.toDto(studentScore);
    }

    private void applyAttendanceScore(StudentScoreEntity studentScore, Long scheduleId, long totalFinalizedSessions) {
        Long studentId = studentScore.getStudent().getId();

        long sessionsPresent = attendanceRepository.countByStudentIdAndAttendanceSessionScheduleIdAndStatusAndFinalizationStatus(
                studentId, scheduleId, AttendanceStatus.PRESENT, AttendanceFinalizationStatus.FINAL
        );

        BigDecimal percentage;
        if (totalFinalizedSessions > 0) {
            percentage = BigDecimal.valueOf(sessionsPresent)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalFinalizedSessions), 2, RoundingMode.HALF_UP);
        } else {
            // If there are no sessions, default to 100% attendance
            percentage = BigDecimal.valueOf(100);
        }

        ScoreConfigurationEntity config = studentScore.getScoreConfiguration();
        if (config == null) {
            config = scoreConfigurationRepository.findByStatus(Status.ACTIVE).orElse(null);
        }

        BigDecimal attendanceScore = BigDecimal.ZERO;
        if (config != null) {
            Integer maxScore = config.getAttendancePercentage();
            attendanceScore = percentage
                    .multiply(BigDecimal.valueOf(maxScore))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        studentScore.setAttendanceScore(attendanceScore);
        studentScore.calculateTotalScoreAndGrade();
        log.debug("Recalculated studentId={} score: percentage={}, points={}, grade={}",
                studentId, percentage, attendanceScore, studentScore.getGrade());
    }
}
