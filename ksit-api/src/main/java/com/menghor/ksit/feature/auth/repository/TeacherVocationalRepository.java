package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeacherVocationalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherVocationalRepository extends JpaRepository<TeacherVocationalEntity, Long> {
    List<TeacherVocationalEntity> findByUserId(Long userId);
}