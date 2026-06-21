package com.menghor.ksit.feature.attendance.service.impl;

import com.menghor.ksit.enumations.AttendanceFinalizationStatus;
import com.menghor.ksit.enumations.AttendanceStatus;
import com.menghor.ksit.enumations.AttendanceType;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.attendance.dto.request.AttendanceSessionRequest;
import com.menghor.ksit.feature.attendance.dto.request.QrAttendanceRequest;
import com.menghor.ksit.feature.attendance.dto.response.AttendanceSessionDto;
import com.menghor.ksit.feature.attendance.dto.response.QrResponse;
import com.menghor.ksit.feature.attendance.mapper.AttendanceMapper;
import com.menghor.ksit.feature.attendance.models.AttendanceEntity;
import com.menghor.ksit.feature.attendance.models.AttendanceSessionEntity;
import com.menghor.ksit.feature.attendance.repository.AttendanceRepository;
import com.menghor.ksit.feature.attendance.repository.AttendanceSessionRepository;
import com.menghor.ksit.feature.attendance.service.AttendanceSessionService;
import com.menghor.ksit.feature.attendance.websocket.AttendanceWebSocketHandler;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.repository.UserRepository;
import com.menghor.ksit.feature.master.model.ClassEntity;
import com.menghor.ksit.feature.school.model.ScheduleEntity;
import com.menghor.ksit.feature.score.service.StudentScoreService;
import com.menghor.ksit.feature.school.repository.ScheduleRepository;
import com.menghor.ksit.utils.database.SecurityUtils;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceSessionServiceImpl implements AttendanceSessionService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final AttendanceMapper attendanceMapper;
    private final SecurityUtils securityUtils;
    private final AttendanceWebSocketHandler webSocketHandler;
    private final StudentScoreService studentScoreService;

    @Override
    public AttendanceSessionDto findById(Long id) {
        log.info("Fetching attendance session id={}", id);
        AttendanceSessionEntity session = sessionRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Attendance session not found with id={}", id);
                    return new EntityNotFoundException("Attendance session not found with id: " + id);
                });
        return attendanceMapper.toDto(session);
    }

    @Override
    @Transactional
    public AttendanceSessionDto generateAttendanceSession(AttendanceSessionRequest request) {
        log.info("Generating attendance session for scheduleId={}", request.getScheduleId());

        // Get current authenticated user
        UserEntity currentUser = securityUtils.getCurrentUser();

        // Validate schedule exists
        ScheduleEntity schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + request.getScheduleId()));

        // Get current date/time
        LocalDateTime now = LocalDateTime.now();
        java.time.LocalDate today = now.toLocalDate();

        // Check if a still-open (not yet submitted/finalized) session already exists for today.
        // A FINAL session must not be reused — once submitted, the next check-in for this
        // schedule today should start a fresh session rather than reopen the finalized one.
        List<AttendanceSessionEntity> todaySessions = findTodaySessionsForSchedule(schedule.getId(), today);
        AttendanceSessionEntity existingDraftSession = todaySessions.stream()
                .filter(s -> s.getFinalizationStatus() != AttendanceFinalizationStatus.FINAL)
                .findFirst()
                .orElse(null);

        if (existingDraftSession != null) {
            log.info("Found existing open attendance session for scheduleId={} today. Reusing session id={}", schedule.getId(), existingDraftSession.getId());
            return attendanceMapper.toDto(existingDraftSession);
        }

        if (!todaySessions.isEmpty()) {
            log.info("All existing attendance sessions for scheduleId={} today are already finalized. Creating a new session.", schedule.getId());
        }

        // Create new attendance session
        AttendanceSessionEntity session = new AttendanceSessionEntity();
        session.setSessionDate(now);
        session.setSchedule(schedule);
        session.setStatus(Status.ACTIVE);
        session.setFinalizationStatus(AttendanceFinalizationStatus.DRAFT);
        session.setTeacher(currentUser); // Use the authenticated user as the teacher

        // Generate QR code
        session.setQrCode(UUID.randomUUID().toString());

        // Save session first to generate ID
        AttendanceSessionEntity savedSession = sessionRepository.save(session);

        // Create attendance records for all students in the class
        ClassEntity classEntity = schedule.getClasses();
        List<UserEntity> students = userRepository.findByClassesId(classEntity.getId());

        List<AttendanceEntity> attendances = new ArrayList<>();
        for (UserEntity student : students) {
            AttendanceEntity attendance = new AttendanceEntity();
            attendance.setStudent(student);
            attendance.setAttendanceSession(savedSession);
            attendance.setAttendanceType(AttendanceType.NONE); // No type yet
            attendance.setStatus(AttendanceStatus.ABSENT); // Not marked yet
            attendance.setRecordedTime(now); // Not recorded yet
            attendance.setFinalizationStatus(AttendanceFinalizationStatus.DRAFT);
            attendances.add(attendance);
        }

        // Save all attendance records
        List<AttendanceEntity> savedAttendances = attendanceRepository.saveAll(attendances);

        // Keep the in-memory session entity in sync with what was just persisted.
        // Re-querying by ID here would NOT pick up these rows — within the same
        // transaction, findById hits Hibernate's identity map and returns this
        // same managed instance, whose attendances collection was never touched
        // by the saveAll() above (that went through a different repository).
        // Without this, the very first response after creating a session would
        // report zero students until a later, separate request re-reads it fresh.
        savedSession.setAttendances(savedAttendances);

        log.info("Attendance session created successfully. id={}, studentCount={}", savedSession.getId(), students.size());

        AttendanceSessionDto refreshedSessionDto = attendanceMapper.toDto(savedSession);

        // Broadcast session creation in real-time
        try {
            webSocketHandler.broadcastSessionCreated(schedule.getId(), refreshedSessionDto);
        } catch (Exception e) {
            log.error("Failed to broadcast session creation WebSocket event", e);
        }

        return refreshedSessionDto;
    }

    /**
     * Find all attendance sessions for a schedule on a specific date
     */
    private List<AttendanceSessionEntity> findTodaySessionsForSchedule(Long scheduleId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return sessionRepository.findByScheduleIdAndSessionDateBetween(scheduleId, startOfDay, endOfDay);
    }

    @Override
    @Transactional
    public QrResponse regenerateQrCode(Long sessionId) {
        log.info("Regenerating QR code for sessionId={}", sessionId);
        AttendanceSessionEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("Attendance session not found with id={}", sessionId);
                    return new EntityNotFoundException("Attendance session not found with id: " + sessionId);
                });

        // Only allow regeneration if session is in DRAFT status
        if (session.getFinalizationStatus() != AttendanceFinalizationStatus.DRAFT) {
            log.warn("Cannot regenerate QR code for finalized sessionId={}", sessionId);
            throw new IllegalStateException("Cannot regenerate QR code for finalized session");
        }

        // Generate new QR code
        session.setQrCode(UUID.randomUUID().toString());

        session = sessionRepository.save(session);
        log.info("QR code regenerated successfully for sessionId={}", sessionId);
        
        QrResponse response = QrResponse.builder()
                .qrCode(session.getQrCode())
                .build();

        // Broadcast session update when QR is regenerated
        try {
            AttendanceSessionDto sessionDto = attendanceMapper.toDto(session);
            webSocketHandler.broadcastAttendanceUpdated(sessionId, sessionDto);
        } catch (Exception e) {
            log.error("Failed to broadcast QR code regeneration WebSocket event", e);
        }

        return response;
    }

    @Override
    @Transactional
    public QrResponse getQrCode(Long sessionId) {
        log.info("Fetching QR code for sessionId={}", sessionId);
        AttendanceSessionEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("Attendance session not found with id={}", sessionId);
                    return new EntityNotFoundException("Attendance session not found with id: " + sessionId);
                });

        // Generate QR code if missing or empty
        if (session.getQrCode() == null || session.getQrCode().isEmpty()) {
            session.setQrCode(UUID.randomUUID().toString());
            session = sessionRepository.save(session);
            log.info("Generated default QR code for sessionId={}", sessionId);
        }

        return QrResponse.builder()
                .qrCode(session.getQrCode())
                .build();
    }

    @Override
    @Transactional
    public AttendanceSessionDto markAttendanceByQr(QrAttendanceRequest request) {
        log.info("Marking attendance by QR for studentId={}", request.getStudentId());
        // Find session by QR code
        AttendanceSessionEntity session = sessionRepository.findByQrCode(request.getQrCode())
                .orElseThrow(() -> {
                    log.warn("Invalid QR code used by studentId={}", request.getStudentId());
                    return new EntityNotFoundException("Invalid QR code");
                });

        // Validate session is not finalized
        if (session.getFinalizationStatus() == AttendanceFinalizationStatus.FINAL) {
            log.warn("Attempt to mark attendance for finalized session id={} by studentId={}", session.getId(), request.getStudentId());
            throw new IllegalStateException("This attendance session has already been finalized and closed");
        }

        // Validate session is active
        if (session.getStatus() != Status.ACTIVE) {
            log.warn("Attempt to mark attendance for inactive session id={} by studentId={}", session.getId(), request.getStudentId());
            throw new IllegalStateException("This attendance session is inactive");
        }

        // Find student's attendance record
        AttendanceEntity attendance = attendanceRepository
                .findByAttendanceSessionIdAndStudentId(session.getId(), request.getStudentId())
                .orElseThrow(() -> {
                    log.warn("Student id={} not found in attendance session id={}", request.getStudentId(), session.getId());
                    return new EntityNotFoundException("Student not found in this attendance session");
                });

        // Prevent duplicate attendance scans
        if (attendance.getStatus() == AttendanceStatus.PRESENT) {
            log.warn("Attendance already marked present for studentId={} in sessionId={}", request.getStudentId(), session.getId());
            throw new IllegalStateException("Attendance has already been marked as PRESENT");
        }

        // Mark as present
        attendance.setStatus(AttendanceStatus.PRESENT);
        attendance.setRecordedTime(LocalDateTime.now());
        attendanceRepository.save(attendance);
        log.info("Attendance marked PRESENT for studentId={} in sessionId={}", request.getStudentId(), session.getId());

        // Fetch refreshed session and broadcast updates to listening teacher and admin clients
        AttendanceSessionEntity refreshedSession = sessionRepository.findById(session.getId()).orElse(session);
        AttendanceSessionDto sessionDto = attendanceMapper.toDto(refreshedSession);

        // Attach the student's current persisted score so the check-in response shows where they stand
        try {
            sessionDto.setStudentScore(studentScoreService.recalculateAttendanceScoreForStudent(
                    session.getSchedule().getId(), request.getStudentId()));
        } catch (Exception e) {
            log.error("Failed to load student score for studentId={} after attendance check-in", request.getStudentId(), e);
        }

        try {
            webSocketHandler.broadcastAttendanceUpdated(session.getId(), sessionDto);
        } catch (Exception e) {
            log.error("Failed to broadcast attendance update WebSocket event", e);
        }

        return sessionDto;
    }

    @Override
    @Transactional
    public AttendanceSessionDto finalizeAttendanceSession(Long sessionId) {
        log.info("Finalizing attendance session id={}", sessionId);
        AttendanceSessionEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("Attendance session not found with id={}", sessionId);
                    return new EntityNotFoundException("Attendance session not found with id: " + sessionId);
                });

        if (session.getFinalizationStatus() == AttendanceFinalizationStatus.FINAL) {
            log.info("Attendance session id={} is already finalized", sessionId);
            return attendanceMapper.toDto(session);
        }

        // Set status to final
        session.setFinalizationStatus(AttendanceFinalizationStatus.FINAL);

        // Process all attendance records
        List<AttendanceEntity> attendances = attendanceRepository.findByAttendanceSessionId(sessionId);
        for (AttendanceEntity attendance : attendances) {
            attendance.setFinalizationStatus(AttendanceFinalizationStatus.FINAL);
        }

        // Save both the attendances and session
        attendanceRepository.saveAll(attendances);
        session = sessionRepository.save(session);
        log.info("Attendance session id={} finalized successfully. recordsProcessed={}", sessionId, attendances.size());

        AttendanceSessionDto sessionDto = attendanceMapper.toDto(session);

        // Broadcast session finalization to WebSocket clients (students, teachers, admins)
        try {
            webSocketHandler.broadcastSessionFinalized(sessionId, sessionDto);
        } catch (Exception e) {
            log.error("Failed to broadcast session finalization WebSocket event", e);
        }

        // Recalculate attendance scores for student score session
        try {
            studentScoreService.recalculateAttendanceScores(session.getSchedule().getId());
        } catch (Exception e) {
            log.error("Failed to recalculate student attendance scores upon session finalization", e);
        }

        return sessionDto;
    }
}