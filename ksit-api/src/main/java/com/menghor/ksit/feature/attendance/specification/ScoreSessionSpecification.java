package com.menghor.ksit.feature.attendance.specification;

import com.menghor.ksit.enumations.SemesterEnum;
import com.menghor.ksit.enumations.SubmissionStatus;
import com.menghor.ksit.feature.attendance.models.ScoreSessionEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class ScoreSessionSpecification {

    public static Specification<ScoreSessionEntity> hasId(Long id) {
        return (root, query, criteriaBuilder) ->
                id != null ? criteriaBuilder.equal(root.get("id"), id) : null;
    }

    public static Specification<ScoreSessionEntity> hasScheduleId(Long scheduleId) {
        return (root, query, criteriaBuilder) ->
                scheduleId != null ? criteriaBuilder.equal(root.get("schedule").get("id"), scheduleId) : null;
    }

    public static Specification<ScoreSessionEntity> hasStatus(SubmissionStatus status) {
        return (root, query, criteriaBuilder) ->
                status != null ? criteriaBuilder.equal(root.get("status"), status) : null;
    }

    public static Specification<ScoreSessionEntity> hasTeacherId(Long teacherId) {
        return (root, query, criteriaBuilder) ->
                teacherId != null ? criteriaBuilder.equal(root.get("teacher").get("id"), teacherId) : null;
    }

    public static Specification<ScoreSessionEntity> hasClassId(Long classId) {
        return (root, query, criteriaBuilder) ->
                classId != null ? criteriaBuilder.equal(root.get("schedule").get("classes").get("id"), classId) : null;
    }

    public static Specification<ScoreSessionEntity> hasCourseId(Long courseId) {
        return (root, query, criteriaBuilder) ->
                courseId != null ? criteriaBuilder.equal(root.get("schedule").get("course").get("id"), courseId) : null;
    }

    public static Specification<ScoreSessionEntity> hasStudentId(Long studentId) {
        return (root, query, criteriaBuilder) -> {
            if (studentId == null) return null;
            Join<Object, Object> studentScores = root.join("studentScores", JoinType.LEFT);
            return criteriaBuilder.equal(studentScores.get("student").get("id"), studentId);
        };
    }

    /**
     * Filter by semester type (SEMESTER_1, SEMESTER_2)
     */
    public static Specification<ScoreSessionEntity> hasSemester(SemesterEnum semester) {
        return (root, query, criteriaBuilder) -> {
            if (semester == null) return null;
            Join<Object, Object> scheduleJoin = root.join("schedule", JoinType.INNER);
            Join<Object, Object> semesterJoin = scheduleJoin.join("semester", JoinType.INNER);
            return criteriaBuilder.equal(semesterJoin.get("semester"), semester);
        };
    }

    /**
     * Filter by academy year
     */
    public static Specification<ScoreSessionEntity> hasAcademyYear(Integer academyYear) {
        return (root, query, criteriaBuilder) -> {
            if (academyYear == null) return null;
            Join<Object, Object> scheduleJoin = root.join("schedule", JoinType.INNER);
            Join<Object, Object> semesterJoin = scheduleJoin.join("semester", JoinType.INNER);
            return criteriaBuilder.equal(semesterJoin.get("academyYear"), academyYear);
        };
    }

    public static Specification<ScoreSessionEntity> searchByNameOrCode(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isEmpty()) return null;
            String searchPattern = "%" + search.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("schedule").get("id").as(String.class)), searchPattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("teacher").get("id").as(String.class)), searchPattern)
            );
        };
    }
}