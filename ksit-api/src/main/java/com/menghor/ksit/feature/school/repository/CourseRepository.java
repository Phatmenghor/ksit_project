package com.menghor.ksit.feature.school.repository;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.school.model.CourseEntity;
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
public interface CourseRepository extends JpaRepository<CourseEntity, Long>, JpaSpecificationExecutor<CourseEntity> {
    long countByStatus(Status status);

    @Query("SELECT c FROM CourseEntity c LEFT JOIN FETCH c.department LEFT JOIN FETCH c.subject LEFT JOIN FETCH c.user WHERE c.id = :id")
    Optional<CourseEntity> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"department", "subject", "user"})
    Page<CourseEntity> findAll(Specification<CourseEntity> spec, Pageable pageable);
}
