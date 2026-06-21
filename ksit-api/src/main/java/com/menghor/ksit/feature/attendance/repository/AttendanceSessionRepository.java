package com.menghor.ksit.feature.attendance.repository;

import com.menghor.ksit.enumations.AttendanceFinalizationStatus;
import com.menghor.ksit.feature.attendance.models.AttendanceSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSessionEntity, Long>, JpaSpecificationExecutor<AttendanceSessionEntity> {
    Optional<AttendanceSessionEntity> findByQrCode(String qrCode);

    @Query("SELECT COUNT(a) FROM AttendanceSessionEntity a WHERE a.schedule.id = :scheduleId")
    Long countByScheduleId(Long scheduleId);
    
    @Query("SELECT COUNT(a) FROM AttendanceSessionEntity a WHERE a.schedule.id = :scheduleId AND a.sessionDate BETWEEN :startDate AND :endDate")
    Long countByScheduleIdAndSessionDateBetween(Long scheduleId, LocalDateTime startDate, LocalDateTime endDate);

    List<AttendanceSessionEntity> findByScheduleIdAndSessionDateBetween(Long scheduleId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query("SELECT a.schedule.id AS scheduleId, COUNT(a) AS total FROM AttendanceSessionEntity a " +
            "WHERE a.schedule.id IN :scheduleIds AND a.finalizationStatus = :finalizationStatus " +
            "GROUP BY a.schedule.id")
    List<Object[]> countFinalizedGroupedByScheduleId(
            @Param("scheduleIds") List<Long> scheduleIds,
            @Param("finalizationStatus") AttendanceFinalizationStatus finalizationStatus);

    long countByScheduleIdAndFinalizationStatus(Long scheduleId, AttendanceFinalizationStatus finalizationStatus);
}