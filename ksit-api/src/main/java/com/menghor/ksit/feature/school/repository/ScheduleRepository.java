package com.menghor.ksit.feature.school.repository;

import com.menghor.ksit.feature.school.model.ScheduleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long>, JpaSpecificationExecutor<ScheduleEntity> {

    @Query("SELECT s FROM ScheduleEntity s " +
            "LEFT JOIN FETCH s.classes c LEFT JOIN FETCH c.major m LEFT JOIN FETCH m.department " +
            "LEFT JOIN FETCH s.user LEFT JOIN FETCH s.course co LEFT JOIN FETCH co.department LEFT JOIN FETCH co.subject " +
            "LEFT JOIN FETCH s.room LEFT JOIN FETCH s.semester " +
            "WHERE s.id = :id")
    Optional<ScheduleEntity> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"classes", "classes.major", "user", "course", "course.department", "course.subject", "room", "semester"})
    Page<ScheduleEntity> findAll(Specification<ScheduleEntity> spec, Pageable pageable);

    /**
     * Find schedules for a specific student (based on class enrollment)
     */
    @Query(value = "SELECT DISTINCT s FROM ScheduleEntity s " +
            "LEFT JOIN FETCH s.classes c " +
            "LEFT JOIN FETCH s.user " +
            "LEFT JOIN FETCH s.course co " +
            "LEFT JOIN FETCH co.department " +
            "LEFT JOIN FETCH s.room " +
            "LEFT JOIN FETCH s.semester " +
            "JOIN c.students st " +
            "WHERE st.id = :studentId " +
            "ORDER BY s.day ASC, s.startTime ASC",
            countQuery = "SELECT COUNT(DISTINCT s.id) FROM ScheduleEntity s " +
            "JOIN s.classes c JOIN c.students st WHERE st.id = :studentId")
    Page<ScheduleEntity> findByStudentId(@Param("studentId") Long studentId, Pageable pageable);

    /**
     * Check if schedule exists and student is enrolled
     */
    @Query("SELECT COUNT(s) > 0 FROM ScheduleEntity s " +
            "JOIN s.classes c " +
            "JOIN c.students st " +
            "WHERE s.id = :scheduleId AND st.id = :studentId")
    boolean existsByIdAndClassesStudentsId(@Param("scheduleId") Long scheduleId, @Param("studentId") Long studentId);

    /**
     * Count students in a schedule
     */
    @Query("SELECT COUNT(DISTINCT st.id) FROM ScheduleEntity s " +
            "JOIN s.classes c " +
            "JOIN c.students st " +
            "WHERE s.id = :scheduleId")
    Integer countStudentsByScheduleId(@Param("scheduleId") Long scheduleId);

    /**
     * Count total students across all schedules
     */
    @Query("SELECT COUNT(DISTINCT st.id) FROM ScheduleEntity s " +
            "JOIN s.classes c " +
            "JOIN c.students st")
    Long countTotalStudents();

    /**
     * Find schedules by student ID
     */
    @Query("SELECT DISTINCT s FROM ScheduleEntity s " +
            "LEFT JOIN FETCH s.classes c " +
            "LEFT JOIN FETCH s.user " +
            "LEFT JOIN FETCH s.course co " +
            "LEFT JOIN FETCH co.department " +
            "LEFT JOIN FETCH s.room " +
            "LEFT JOIN FETCH s.semester " +
            "JOIN c.students st " +
            "WHERE st.id = :studentId " +
            "ORDER BY s.day, s.startTime")
    List<ScheduleEntity> findSchedulesByStudentId(@Param("studentId") Long studentId);
}