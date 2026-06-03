package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeacherLanguageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherLanguageRepository extends JpaRepository<TeacherLanguageEntity, Long> {
    List<TeacherLanguageEntity> findByUserId(Long userId);
}