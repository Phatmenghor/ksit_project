package com.menghor.ksit.feature.score.repository;

import com.menghor.ksit.feature.score.models.StudentScoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentScoreRepository extends JpaRepository<StudentScoreEntity, Long>, JpaSpecificationExecutor<StudentScoreEntity> {
    List<StudentScoreEntity> findByScoreSessionScheduleId(Long scheduleId);
    Optional<StudentScoreEntity> findByScoreSessionScheduleIdAndStudentId(Long scheduleId, Long studentId);
}