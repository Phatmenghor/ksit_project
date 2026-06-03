package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.TeacherPraiseOrCriticismEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherPraiseOrCriticismRepository extends JpaRepository<TeacherPraiseOrCriticismEntity, Long> {
    List<TeacherPraiseOrCriticismEntity> findByUserId(Long userId);
}