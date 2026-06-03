package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.StudentStudiesHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentStudiesHistoryRepository extends JpaRepository<StudentStudiesHistoryEntity, Long> {
    List<StudentStudiesHistoryEntity> findByUserId(Long userId);
}