package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeacherShortCourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherShortCourseRepository extends JpaRepository<TeacherShortCourseEntity, Long> {
    List<TeacherShortCourseEntity> findByUserId(Long userId);
}