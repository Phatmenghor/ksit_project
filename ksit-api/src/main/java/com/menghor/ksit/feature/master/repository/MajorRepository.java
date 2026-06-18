package com.menghor.ksit.feature.master.repository;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.master.model.MajorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MajorRepository extends JpaRepository<MajorEntity, Long>, JpaSpecificationExecutor<MajorEntity> {
    boolean existsByCodeAndStatus(String code, Status status);

    boolean existsByCodeAndStatusAndIdNot(String code, Status status, Long id);

    long countByStatus(Status status);

    @Query("SELECT m FROM MajorEntity m LEFT JOIN FETCH m.department WHERE m.id = :id")
    Optional<MajorEntity> findByIdWithDetails(@Param("id") Long id);
}