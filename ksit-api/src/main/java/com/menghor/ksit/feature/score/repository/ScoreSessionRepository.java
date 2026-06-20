package com.menghor.ksit.feature.score.repository;

import com.menghor.ksit.feature.score.models.ScoreSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreSessionRepository extends JpaRepository<ScoreSessionEntity, Long>, JpaSpecificationExecutor<ScoreSessionEntity> {

    /**
     * Fetch entities by IDs with eager-loaded relations to avoid N+1 on the mapper.
     */
    @Query("SELECT DISTINCT s FROM ScoreSessionEntity s " +
           "LEFT JOIN FETCH s.schedule sc " +
           "LEFT JOIN FETCH sc.course " +
           "LEFT JOIN FETCH sc.classes " +
           "LEFT JOIN FETCH s.teacher " +
           "WHERE s.id IN :ids")
    List<ScoreSessionEntity> findByIdInWithDetails(List<Long> ids);
}