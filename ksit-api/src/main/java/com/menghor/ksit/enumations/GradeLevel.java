package com.menghor.ksit.enumations;

import lombok.Getter;

@Getter
public enum GradeLevel {
    // Cambodian Grading System
    A("A", 85.0, 100.0, "Excellent", "ល្អបំផុត", 4.0),
    B_PLUS("B+", 80.0, 84.99, "Very Good", "ល្អណាស់", 3.5),
    B("B", 70.0, 79.99, "Good", "ល្អ", 3.0),
    C_PLUS("C+", 65.0, 69.99, "Fairly Good", "ល្អបង្ខំ", 2.5),
    C("C", 50.0, 64.99, "Fair", "បង្គម", 2.0),
    D("D", 45.0, 49.99, "Poor", "ខ្សោយ", 1.5),
    E("E", 40.0, 44.99, "Very Poor", "ខ្សោយណាស់", 1.0),
    F("F", 0.0, 39.99, "Failure", "ធ្លាក់", 0.0);

    private final String grade;
    private final double minScore;
    private final double maxScore;
    private final String descriptionEn;
    private final String descriptionKh;
    private final double gradePoint;

    GradeLevel(String grade, double minScore, double maxScore, String descriptionEn, String descriptionKh, double gradePoint) {
        this.grade = grade;
        this.minScore = minScore;
        this.maxScore = maxScore;
        this.descriptionEn = descriptionEn;
        this.descriptionKh = descriptionKh;
        this.gradePoint = gradePoint;
    }

    /**
     * Get grade level from score using Cambodian grading system
     */
    public static GradeLevel fromScore(double score) {
        for (GradeLevel gradeLevel : GradeLevel.values()) {
            if (score >= gradeLevel.getMinScore() && score <= gradeLevel.getMaxScore()) {
                return gradeLevel;
            }
        }
        return F; // Default to F if no match found
    }

    /**
     * Get grade level from grade string
     */
    public static GradeLevel fromGradeString(String gradeString) {
        if (gradeString == null || gradeString.trim().isEmpty()) {
            return F;
        }
        
        for (GradeLevel gradeLevel : GradeLevel.values()) {
            if (gradeLevel.getGrade().equalsIgnoreCase(gradeString.trim())) {
                return gradeLevel;
            }
        }
        return F; // Default to F if no match found
    }

    /**
     * Check if the grade is passing (not F)
     */
    public boolean isPassing() {
        return this != F;
    }

    /**
     * Get percentage range as string
     */
    public String getPercentageRange() {
        if (this == F) {
            return "< 40%";
        }
        return String.format("%.0f%%-%.0f%%", minScore, maxScore);
    }

    /**
     * Get full description with grade and percentage
     */
    public String getFullDescription() {
        return String.format("%s (%s) - %s", grade, getPercentageRange(), descriptionEn);
    }

    /**
     * Get full description in Khmer
     */
    public String getFullDescriptionKhmer() {
        return String.format("%s (%s) - %s", grade, getPercentageRange(), descriptionKh);
    }

    /**
     * Calculate GPA from a list of grades
     */
    public static double calculateGPA(GradeLevel... grades) {
        if (grades == null || grades.length == 0) {
            return 0.0;
        }
        
        double totalPoints = 0.0;
        for (GradeLevel grade : grades) {
            totalPoints += grade.getGradePoint();
        }
        
        return totalPoints / grades.length;
    }

    /**
     * Get all passing grades
     */
    public static GradeLevel[] getPassingGrades() {
        return new GradeLevel[]{A, B_PLUS, B, C_PLUS, C, D, E};
    }

    /**
     * Get honor roll grades (B and above)
     */
    public static GradeLevel[] getHonorRollGrades() {
        return new GradeLevel[]{A, B_PLUS, B};
    }

    /**
     * Check if grade qualifies for honor roll
     */
    public boolean isHonorRoll() {
        return this == A || this == B_PLUS || this == B;
    }

    /**
     * Check if grade needs improvement (D, E, F)
     */
    public boolean needsImprovement() {
        return this == D || this == E || this == F;
    }

    @Override
    public String toString() {
        return getFullDescription();
    }
}