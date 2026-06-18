package com.menghor.ksit.feature.master.repository;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.master.model.ClassEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long>, JpaSpecificationExecutor<ClassEntity> {
    boolean existsByCodeAndStatus(String code, Status status);

    boolean existsByCodeAndStatusAndIdNot(String code, Status status, Long id);

    long countByStatus(Status status);

    @Query("SELECT c FROM ClassEntity c LEFT JOIN FETCH c.major m LEFT JOIN FETCH m.department WHERE c.id = :id")
    Optional<ClassEntity> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"major", "major.department"})
    Page<ClassEntity> findAll(Specification<ClassEntity> spec, Pageable pageable);
}