package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeacherFamilyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherFamilyRepository extends JpaRepository<TeacherFamilyEntity, Long> {
    List<TeacherFamilyEntity> findByUserId(Long userId);
}