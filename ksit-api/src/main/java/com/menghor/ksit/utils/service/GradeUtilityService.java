package com.menghor.ksit.utils.service;

import com.menghor.ksit.enumations.GradeLevel;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Utility service for consistent grade calculations across the application
 * Uses the Cambodian grading system
 */
@Service
public class GradeUtilityService {

    /**
     * Calculate grade from total score
     */
    public String calculateGrade(double totalScore) {
        GradeLevel gradeLevel = GradeLevel.fromScore(totalScore);
        return gradeLevel.getGrade();
    }

    /**
     * Calculate grade from BigDecimal total score
     */
    public String calculateGrade(BigDecimal totalScore) {
        if (totalScore == null) {
            return GradeLevel.F.getGrade();
        }
        return calculateGrade(totalScore.doubleValue());
    }

    /**
     * Get grade description in English
     */
    public String getGradeDescription(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getDescriptionEn();
        }
        
        GradeLevel gradeLevel = GradeLevel.fromGradeString(grade);
        return gradeLevel.getDescriptionEn();
    }

    /**
     * Get grade description in Khmer
     */
    public String getGradeDescriptionKhmer(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getDescriptionKh();
        }
        
        GradeLevel gradeLevel = GradeLevel.fromGradeString(grade);
        return gradeLevel.getDescriptionKh();
    }

    /**
     * Get grade point for GPA calculation
     */
    public double getGradePoint(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getGradePoint();
        }
        
        GradeLevel gradeLevel = GradeLevel.fromGradeString(grade);
        return gradeLevel.getGradePoint();
    }

    /**
     * Check if grade is passing
     */
    public boolean isPassing(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return false;
        }
        
        GradeLevel gradeLevel = GradeLevel.fromGradeString(grade);
        return gradeLevel.isPassing();
    }

    /**
     * Get percentage range for grade
     */
    public String getGradeRange(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getPercentageRange();
        }
        
        GradeLevel gradeLevel = GradeLevel.fromGradeString(grade);
        return gradeLevel.getPercentageRange();
    }

    /**
     * Calculate GPA from multiple grades
     */
    public double calculateGPA(List<String> grades) {
        if (grades == null || grades.isEmpty()) {
            return 0.0;
        }

        double totalPoints = 0.0;
        int validGrades = 0;

        for (String grade : grades) {
            if (grade != null && !grade.trim().isEmpty()) {
                totalPoints += getGradePoint(grade);
                validGrades++;
            }
        }

        if (validGrades == 0) {
            return 0.0;
        }

        double gpa = totalPoints / validGrades;
        
        // Round to 2 decimal places
        BigDecimal roundedGpa = BigDecimal.valueOf(gpa)
                .setScale(2, RoundingMode.HALF_UP);
        
        
        return roundedGpa.doubleValue();
    }

    /**
     * Calculate GPA from grade points
     */
    public double calculateGPAFromPoints(List<Double> gradePoints) {
        if (gradePoints == null || gradePoints.isEmpty()) {
            return 0.0;
        }

        double totalPoints = gradePoints.stream()
                .mapToDouble(Double::doubleValue)
                .sum();

        double gpa = totalPoints / gradePoints.size();
        
        // Round to 2 decimal places
        BigDecimal roundedGpa = BigDecimal.valueOf(gpa)
                .setScale(2, RoundingMode.HALF_UP);
        
        return roundedGpa.doubleValue();
    }

    /**
     * Get academic standing based on GPA
     */
    public String getAcademicStanding(double gpa) {
        if (gpa >= 3.5) {
            return "Dean's List"; // Summa Cum Laude equivalent
        } else if (gpa >= 3.0) {
            return "Honor Roll"; // Magna Cum Laude equivalent
        } else if (gpa >= 2.5) {
            return "Good Standing"; // Cum Laude equivalent
        } else if (gpa >= 2.0) {
            return "Satisfactory";
        } else if (gpa >= 1.0) {
            return "Probation";
        } else {
            return "Academic Warning";
        }
    }

    /**
     * Get academic standing in Khmer
     */
    public String getAcademicStandingKhmer(double gpa) {
        if (gpa >= 3.5) {
            return "បញ្ជីកិត្តិយស";
        } else if (gpa >= 3.0) {
            return "កិត្តិយស";
        } else if (gpa >= 2.5) {
            return "ល្អ";
        } else if (gpa >= 2.0) {
            return "បង្គម";
        } else if (gpa >= 1.0) {
            return "ការព្រមាន";
        } else {
            return "ការព្រមានសិក្សា";
        }
    }

    /**
     * Check if grade qualifies for honor roll
     */
    public boolean isHonorRoll(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return false;
        }
        
        GradeLevel gradeLevel = GradeLevel.fromGradeString(grade);
        return gradeLevel.isHonorRoll();
    }

    /**
     * Check if grade needs improvement
     */
    public boolean needsImprovement(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return true;
        }
        
        GradeLevel gradeLevel = GradeLevel.fromGradeString(grade);
        return gradeLevel.needsImprovement();
    }

    /**
     * Get letter grade from GPA
     */
    public String getLetterGradeFromGPA(double gpa) {
        if (gpa >= 3.85) {
            return "A";
        } else if (gpa >= 3.3) {
            return "B+";
        } else if (gpa >= 2.85) {
            return "B";
        } else if (gpa >= 2.3) {
            return "C+";
        } else if (gpa >= 1.85) {
            return "C";
        } else if (gpa >= 1.3) {
            return "D";
        } else if (gpa >= 0.85) {
            return "E";
        } else {
            return "F";
        }
    }

    /**
     * Validate if score is within valid range (0-100)
     */
    public boolean isValidScore(double score) {
        return score >= 0.0 && score <= 100.0;
    }

    /**
     * Get all available grades
     */
    public GradeLevel[] getAllGrades() {
        return GradeLevel.values();
    }

    /**
     * Get passing grades only
     */
    public GradeLevel[] getPassingGrades() {
        return GradeLevel.getPassingGrades();
    }

    /**
     * Get honor roll grades only
     */
    public GradeLevel[] getHonorRollGrades() {
        return GradeLevel.getHonorRollGrades();
    }

    /**
     * Format score with appropriate decimal places
     */
    public String formatScore(double score) {
        BigDecimal formattedScore = BigDecimal.valueOf(score)
                .setScale(2, RoundingMode.HALF_UP);
        return formattedScore.toString();
    }

    /**
     * Format GPA with appropriate decimal places
     */
    public String formatGPA(double gpa) {
        BigDecimal formattedGPA = BigDecimal.valueOf(gpa)
                .setScale(2, RoundingMode.HALF_UP);
        return formattedGPA.toString();
    }
}