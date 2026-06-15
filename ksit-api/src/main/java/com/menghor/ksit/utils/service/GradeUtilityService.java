package com.menghor.ksit.utils.service;

import com.menghor.ksit.enumations.GradeLevel;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class GradeUtilityService {

    public String calculateGrade(double totalScore) {
        return GradeLevel.fromScore(totalScore).getGrade();
    }

    public String calculateGrade(BigDecimal totalScore) {
        if (totalScore == null) {
            return GradeLevel.F.getGrade();
        }
        return calculateGrade(totalScore.doubleValue());
    }

    public String getGradeDescription(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getDescriptionEn();
        }
        return GradeLevel.fromGradeString(grade).getDescriptionEn();
    }

    public String getGradeDescriptionKhmer(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getDescriptionKh();
        }
        return GradeLevel.fromGradeString(grade).getDescriptionKh();
    }

    public double getGradePoint(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getGradePoint();
        }
        return GradeLevel.fromGradeString(grade).getGradePoint();
    }

    public boolean isPassing(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return false;
        }
        return GradeLevel.fromGradeString(grade).isPassing();
    }

    public String getGradeRange(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return GradeLevel.F.getPercentageRange();
        }
        return GradeLevel.fromGradeString(grade).getPercentageRange();
    }

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

        return BigDecimal.valueOf(totalPoints / validGrades)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    public double calculateGPAFromPoints(List<Double> gradePoints) {
        if (gradePoints == null || gradePoints.isEmpty()) {
            return 0.0;
        }

        double total = gradePoints.stream().mapToDouble(Double::doubleValue).sum();
        return BigDecimal.valueOf(total / gradePoints.size())
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    public String getAcademicStanding(double gpa) {
        if (gpa >= 3.5) return "Dean's List";
        if (gpa >= 3.0) return "Honor Roll";
        if (gpa >= 2.5) return "Good Standing";
        if (gpa >= 2.0) return "Satisfactory";
        if (gpa >= 1.0) return "Probation";
        return "Academic Warning";
    }

    public String getAcademicStandingKhmer(double gpa) {
        if (gpa >= 3.5) return "បញ្ជីកិត្តិយស";
        if (gpa >= 3.0) return "កិត្តិយស";
        if (gpa >= 2.5) return "ល្អ";
        if (gpa >= 2.0) return "បង្គម";
        if (gpa >= 1.0) return "ការព្រមាន";
        return "ការព្រមានសិក្សា";
    }

    public boolean isHonorRoll(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return false;
        }
        return GradeLevel.fromGradeString(grade).isHonorRoll();
    }

    public boolean needsImprovement(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return true;
        }
        return GradeLevel.fromGradeString(grade).needsImprovement();
    }

    public String getLetterGradeFromGPA(double gpa) {
        if (gpa >= 3.85) return "A";
        if (gpa >= 3.3) return "B+";
        if (gpa >= 2.85) return "B";
        if (gpa >= 2.3) return "C+";
        if (gpa >= 1.85) return "C";
        if (gpa >= 1.3) return "D";
        if (gpa >= 0.85) return "E";
        return "F";
    }

    public boolean isValidScore(double score) {
        return score >= 0.0 && score <= 100.0;
    }

    public GradeLevel[] getAllGrades() {
        return GradeLevel.values();
    }

    public GradeLevel[] getPassingGrades() {
        return GradeLevel.getPassingGrades();
    }

    public GradeLevel[] getHonorRollGrades() {
        return GradeLevel.getHonorRollGrades();
    }

    public String formatScore(double score) {
        return BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP).toString();
    }

    public String formatGPA(double gpa) {
        return BigDecimal.valueOf(gpa).setScale(2, RoundingMode.HALF_UP).toString();
    }
}
