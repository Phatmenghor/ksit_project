package com.menghor.ksit.feature.attendance.repository;

import com.menghor.ksit.enumations.AttendanceFinalizationStatus;
import com.menghor.ksit.enumations.AttendanceStatus;
import com.menghor.ksit.feature.attendance.models.AttendanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceEntity, Long>, JpaSpecificationExecutor<AttendanceEntity> {
    List<AttendanceEntity> findByAttendanceSessionId(Long sessionId);

    Optional<AttendanceEntity> findByAttendanceSessionIdAndStudentId(Long sessionId, Long studentId);

    @Query("SELECT a.attendanceSession.schedule.id AS scheduleId, a.student.id AS studentId, COUNT(a) AS total " +
            "FROM AttendanceEntity a " +
            "WHERE a.attendanceSession.schedule.id IN :scheduleIds AND a.student.id IN :studentIds " +
            "AND a.finalizationStatus = :finalizationStatus AND a.status = :status " +
            "GROUP BY a.attendanceSession.schedule.id, a.student.id")
    List<Object[]> countPresentGroupedByScheduleAndStudent(
            @Param("scheduleIds") List<Long> scheduleIds,
            @Param("studentIds") List<Long> studentIds,
            @Param("finalizationStatus") AttendanceFinalizationStatus finalizationStatus,
            @Param("status") AttendanceStatus status);

}