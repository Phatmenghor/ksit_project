package com.menghor.ksit.feature.score.specification;

import com.menghor.ksit.enumations.SemesterEnum;
import com.menghor.ksit.enumations.SubmissionStatus;
import com.menghor.ksit.feature.score.models.ScoreSessionEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class ScoreSessionSpecification {

    public static Specification<ScoreSessionEntity> hasId(Long id) {
        return (root, query, cb) ->
                id != null ? cb.equal(root.get("id"), id) : null;
    }

    public static Specification<ScoreSessionEntity> hasScheduleId(Long scheduleId) {
        return (root, query, cb) ->
                scheduleId != null ? cb.equal(root.get("schedule").get("id"), scheduleId) : null;
    }

    public static Specification<ScoreSessionEntity> hasStatus(SubmissionStatus status) {
        return (root, query, cb) ->
                status != null ? cb.equal(root.get("status"), status) : null;
    }

    public static Specification<ScoreSessionEntity> hasTeacherId(Long teacherId) {
        return (root, query, cb) ->
                teacherId != null ? cb.equal(root.get("teacher").get("id"), teacherId) : null;
    }

    public static Specification<ScoreSessionEntity> hasClassId(Long classId) {
        return (root, query, cb) ->
                classId != null ? cb.equal(root.get("schedule").get("classes").get("id"), classId) : null;
    }

    public static Specification<ScoreSessionEntity> hasCourseId(Long courseId) {
        return (root, query, cb) ->
                courseId != null ? cb.equal(root.get("schedule").get("course").get("id"), courseId) : null;
    }

    public static Specification<ScoreSessionEntity> hasStudentId(Long studentId) {
        return (root, query, cb) -> {
            if (studentId == null) return null;
            if (query != null) query.distinct(true);
            Join<Object, Object> studentScores = root.join("studentScores", JoinType.LEFT);
            return cb.equal(studentScores.get("student").get("id"), studentId);
        };
    }

    /**
     * Filter by semester type (SEMESTER_1, SEMESTER_2).
     * Reuses an existing schedule join when possible to avoid duplicate joins.
     */
    public static Specification<ScoreSessionEntity> hasSemester(SemesterEnum semester) {
        return (root, query, cb) -> {
            if (semester == null) return null;
            Join<Object, Object> scheduleJoin = root.join("schedule", JoinType.INNER);
            Join<Object, Object> semesterJoin = scheduleJoin.join("semester", JoinType.INNER);
            return cb.equal(semesterJoin.get("semester"), semester);
        };
    }

    /**
     * Filter by academy year.
     * Reuses an existing schedule join when possible to avoid duplicate joins.
     */
    public static Specification<ScoreSessionEntity> hasAcademyYear(Integer academyYear) {
        return (root, query, cb) -> {
            if (academyYear == null) return null;
            Join<Object, Object> scheduleJoin = root.join("schedule", JoinType.INNER);
            Join<Object, Object> semesterJoin = scheduleJoin.join("semester", JoinType.INNER);
            return cb.equal(semesterJoin.get("academyYear"), academyYear);
        };
    }

    /**
     * Combined semester + academyYear filter using a single join path.
     * Use this instead of hasSemester() + hasAcademyYear() together to avoid duplicate joins.
     */
    public static Specification<ScoreSessionEntity> hasSemesterAndYear(SemesterEnum semester, Integer academyYear) {
        return (root, query, cb) -> {
            if (semester == null && academyYear == null) return null;
            Join<Object, Object> scheduleJoin = root.join("schedule", JoinType.INNER);
            Join<Object, Object> semesterJoin = scheduleJoin.join("semester", JoinType.INNER);
            if (semester != null && academyYear != null) {
                return cb.and(
                        cb.equal(semesterJoin.get("semester"), semester),
                        cb.equal(semesterJoin.get("academyYear"), academyYear)
                );
            } else if (semester != null) {
                return cb.equal(semesterJoin.get("semester"), semester);
            } else {
                return cb.equal(semesterJoin.get("academyYear"), academyYear);
            }
        };
    }

    /**
     * Search by teacher name (English), course name/code, or class code.
     */
    public static Specification<ScoreSessionEntity> searchByNameOrCode(String search) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(search)) return null;
            if (query != null) query.distinct(true);
            String pattern = "%" + search.toLowerCase() + "%";
            Join<Object, Object> teacherJoin = root.join("teacher", JoinType.LEFT);
            Join<Object, Object> scheduleJoin = root.join("schedule", JoinType.LEFT);
            Join<Object, Object> courseJoin = scheduleJoin.join("course", JoinType.LEFT);
            Join<Object, Object> classJoin = scheduleJoin.join("classes", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(teacherJoin.get("englishFirstName")), pattern),
                    cb.like(cb.lower(teacherJoin.get("englishLastName")), pattern),
                    cb.like(cb.lower(courseJoin.get("nameEn")), pattern),
                    cb.like(cb.lower(courseJoin.get("code")), pattern),
                    cb.like(cb.lower(classJoin.get("code")), pattern)
            );
        };
    }
}
