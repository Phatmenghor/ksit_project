package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeacherExperienceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherExperienceRepository extends JpaRepository<TeacherExperienceEntity, Long> {
    List<TeacherExperienceEntity> findByUserId(Long userId);
}