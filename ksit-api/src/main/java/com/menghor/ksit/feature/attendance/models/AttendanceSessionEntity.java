package com.menghor.ksit.feature.attendance.models;

import com.menghor.ksit.enumations.AttendanceFinalizationStatus;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.school.model.ScheduleEntity;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "attendance_sessions", indexes = {
    @Index(name = "idx_att_session_schedule_id", columnList = "schedule_id"),
    @Index(name = "idx_att_session_teacher_id", columnList = "teacher_id"),
    @Index(name = "idx_att_session_qr_code", columnList = "qr_code"),
    @Index(name = "idx_att_session_status", columnList = "status"),
    @Index(name = "idx_att_session_finalization", columnList = "finalization_status"),
    @Index(name = "idx_att_session_date", columnList = "session_date"),
    @Index(name = "idx_att_session_schedule_date", columnList = "schedule_id, session_date")
})
@Getter
@Setter
public class AttendanceSessionEntity extends BaseEntity {
    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;
    
    @Column(name = "qr_code", nullable = false)
    private String qrCode;
    
    @Column(name = "qr_expiry_time", nullable = false)
    private LocalDateTime qrExpiryTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "finalization_status")
    private AttendanceFinalizationStatus finalizationStatus = AttendanceFinalizationStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.ACTIVE;
    
    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private ScheduleEntity schedule;
    
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private UserEntity teacher;
    
    @OneToMany(mappedBy = "attendanceSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttendanceEntity> attendances = new ArrayList<>();
    
    @PrePersist
    public void generateQrCode() {
        this.qrCode = UUID.randomUUID().toString();
        this.qrExpiryTime = this.sessionDate.plusMinutes(15);
    }
}