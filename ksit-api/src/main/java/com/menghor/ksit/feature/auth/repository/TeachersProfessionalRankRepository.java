package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeachersProfessionalRankEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeachersProfessionalRankRepository extends JpaRepository<TeachersProfessionalRankEntity, Long> {
    List<TeachersProfessionalRankEntity> findByUserId(Long userId);
}