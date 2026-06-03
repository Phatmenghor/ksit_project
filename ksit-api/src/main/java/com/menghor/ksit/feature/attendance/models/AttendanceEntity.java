package com.menghor.ksit.feature.attendance.models;

import com.menghor.ksit.enumations.AttendanceFinalizationStatus;
import com.menghor.ksit.enumations.AttendanceStatus;
import com.menghor.ksit.enumations.AttendanceType;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendances", indexes = {
    @Index(name = "idx_attendance_student_id", columnList = "student_id"),
    @Index(name = "idx_attendance_session_id", columnList = "attendance_session_id"),
    @Index(name = "idx_attendance_status", columnList = "status"),
    @Index(name = "idx_attendance_type", columnList = "attendance_type"),
    @Index(name = "idx_attendance_finalization", columnList = "finalization_status"),
    @Index(name = "idx_attendance_student_session", columnList = "student_id, attendance_session_id"),
    @Index(name = "idx_attendance_session_status", columnList = "attendance_session_id, status")
})
@Getter
@Setter
public class AttendanceEntity extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttendanceStatus status = AttendanceStatus.ABSENT;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_type", nullable = false)
    private AttendanceType attendanceType = AttendanceType.NONE;
    
    @Column(name = "comment")
    private String comment;
    
    @Column(name = "recorded_time")
    private LocalDateTime recordedTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "finalization_status")
    private AttendanceFinalizationStatus finalizationStatus = AttendanceFinalizationStatus.DRAFT;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    private UserEntity student;
    
    @ManyToOne
    @JoinColumn(name = "attendance_session_id")
    private AttendanceSessionEntity attendanceSession;
}