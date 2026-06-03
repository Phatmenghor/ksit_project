package com.menghor.ksit.feature.attendance.models;

import com.menghor.ksit.enumations.GradeLevel;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "student_scores", indexes = {
    @Index(name = "idx_student_score_session_id", columnList = "score_session_id"),
    @Index(name = "idx_student_score_student_id", columnList = "student_id"),
    @Index(name = "idx_student_score_config_id", columnList = "score_configuration_id"),
    @Index(name = "idx_student_score_grade", columnList = "grade"),
    @Index(name = "idx_student_score_total", columnList = "total_score"),
    @Index(name = "idx_student_score_student_session", columnList = "student_id, score_session_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class StudentScoreEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "score_session_id", nullable = false)
    private ScoreSessionEntity scoreSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private UserEntity student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "score_configuration_id")
    private ScoreConfigurationEntity scoreConfiguration;

    // Final scores (teachers enter scores directly within percentage limits)
    @Column(name = "attendance_score", precision = 5, scale = 2)
    private BigDecimal attendanceScore = BigDecimal.ZERO;

    @Column(name = "assignment_score", precision = 5, scale = 2)
    private BigDecimal assignmentScore = BigDecimal.ZERO;

    @Column(name = "midterm_score", precision = 5, scale = 2)
    private BigDecimal midtermScore = BigDecimal.ZERO;

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore = BigDecimal.ZERO;

    @Column(name = "total_score", precision = 5, scale = 2)
    private BigDecimal totalScore = BigDecimal.ZERO;

    @Column(name = "grade", length = 2)
    private String grade;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    /**
     * FIXED: Calculate total score and grade using proper Cambodian grading system
     */
    @PostLoad
    @PostPersist
    @PostUpdate
    public void calculateTotalScoreAndGrade() {
        // Calculate total score first
        BigDecimal calculatedTotal = calculateTotalScore();

        // Update total score if it's null or different
        if (totalScore == null || totalScore.compareTo(calculatedTotal) != 0) {
            this.totalScore = calculatedTotal;
        }

        // Calculate grade using the updated total score
        if (totalScore != null) {
            double score = totalScore.doubleValue();

            // Use the GradeLevel enum for consistent grading
            com.menghor.ksit.enumations.GradeLevel gradeLevel =
                    com.menghor.ksit.enumations.GradeLevel.fromScore(score);

            this.grade = gradeLevel.getGrade();
        }
    }

    /**
     * NEW: Helper method to calculate total score from individual components
     */
    private BigDecimal calculateTotalScore() {
        BigDecimal total = BigDecimal.ZERO;

        if (attendanceScore != null) {
            total = total.add(attendanceScore);
        }
        if (assignmentScore != null) {
            total = total.add(assignmentScore);
        }
        if (midtermScore != null) {
            total = total.add(midtermScore);
        }
        if (finalScore != null) {
            total = total.add(finalScore);
        }

        return total.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * PUBLIC: Method to manually trigger calculation (for use in services)
     */
    public void recalculateTotalAndGrade() {
        calculateTotalScoreAndGrade();
    }

    /**
     * Get grade description in English using the GradeLevel enum
     */
    public String getGradeDescription() {
        if (grade == null) return null;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.getDescriptionEn();
    }

    /**
     * Get grade description in Khmer using the GradeLevel enum
     */
    public String getGradeDescriptionKhmer() {
        if (grade == null) return null;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.getDescriptionKh();
    }

    /**
     * Get grade point value (for GPA calculation) using the GradeLevel enum
     */
    public double getGradePoint() {
        if (grade == null) return 0.0;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.getGradePoint();
    }

    /**
     * Check if the grade is passing using the GradeLevel enum
     */
    public boolean isPassing() {
        if (grade == null) return false;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.isPassing();
    }

    /**
     * Get percentage range for the current grade using the GradeLevel enum
     */
    public String getGradeRange() {
        if (grade == null) return null;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.getPercentageRange();
    }

    /**
     * Get full grade description with percentage range
     */
    public String getFullGradeDescription() {
        if (grade == null) return null;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.getFullDescription();
    }

    /**
     * Check if grade qualifies for honor roll
     */
    public boolean isHonorRoll() {
        if (grade == null) return false;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.isHonorRoll();
    }

    /**
     * Check if grade needs improvement
     */
    public boolean needsImprovement() {
        if (grade == null) return true;

        GradeLevel gradeLevel =
                GradeLevel.fromGradeString(grade);

        return gradeLevel.needsImprovement();
    }
}