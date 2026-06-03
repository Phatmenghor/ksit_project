package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.feature.auth.models.StudentParentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentParentRepository extends JpaRepository<StudentParentEntity, Long> {
    List<StudentParentEntity> findByUserId(Long userId);
}