package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeacherEducationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherEducationRepository extends JpaRepository<TeacherEducationEntity, Long> {
    List<TeacherEducationEntity> findByUserId(Long userId);
}