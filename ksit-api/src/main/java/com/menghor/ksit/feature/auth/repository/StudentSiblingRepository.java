package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.StudentSiblingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentSiblingRepository extends JpaRepository<StudentSiblingEntity, Long> {
    List<StudentSiblingEntity> findByUserId(Long userId);
}