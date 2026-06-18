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
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.repository.UserRepository;
import com.menghor.ksit.feature.master.model.ClassEntity;
import com.menghor.ksit.feature.school.model.ScheduleEntity;
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

        // Check if current user is the teacher assigned to this schedule
        if (!schedule.getUser().getId().equals(currentUser.getId())) {
            log.warn("Access denied: User {} (ID: {}) is not the teacher assigned to schedule {} (Assigned teacher ID: {})",
                    currentUser.getUsername(), currentUser.getId(),
                    request.getScheduleId(), schedule.getUser().getId());

            throw new AccessDeniedException("You are not authorized to generate attendance sessions for this schedule. " +
                    "Only the assigned teacher can perform this action.");
        }

        // Get current date/time
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        // Check if an attendance session already exists for this schedule today
        List<AttendanceSessionEntity> todaySessions = findTodaySessionsForSchedule(schedule.getId(), today);

        // Check if there's a DRAFT session for today
        Optional<AttendanceSessionEntity> draftSession = todaySessions.stream()
                .filter(session -> session.getFinalizationStatus() == AttendanceFinalizationStatus.DRAFT)
                .findFirst();

        // If a draft session exists for today, return it (don't create a new one)
        if (draftSession.isPresent()) {
            log.info("Returning existing draft attendance session id={} for scheduleId={}",
                    draftSession.get().getId(), request.getScheduleId());
            // Sorting will be handled by the mapper
            return attendanceMapper.toDto(draftSession.get());
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
        session.setQrExpiryTime(now.plusMinutes(15)); // QR code valid for 15 minutes

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
        attendanceRepository.saveAll(attendances);

        // ✅ FIX: Fetch the session fresh from database to include attendances
        AttendanceSessionEntity refreshedSession = sessionRepository.findById(savedSession.getId())
                .orElseThrow(() -> new EntityNotFoundException("Session not found after creation"));

        log.info("Attendance session created successfully. id={}, studentCount={}", savedSession.getId(), students.size());
        // The sorting will be handled automatically in the mapper
        return attendanceMapper.toDto(refreshedSession);
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

        // Generate new QR code and reset expiry time (15 minutes from now)
        LocalDateTime now = LocalDateTime.now();
        session.setQrCode(UUID.randomUUID().toString());
        session.setQrExpiryTime(now.plusMinutes(15));

        session = sessionRepository.save(session);
        log.info("QR code regenerated successfully for sessionId={}", sessionId);
        return QrResponse.builder()
                .qrCode(session.getQrCode())
                .expiryTime(session.getQrExpiryTime().toString())
                .build();
    }

    @Override
    @Transactional
    public AttendanceSessionDto markAttendanceByQr(QrAttendanceRequest request) {
        log.info("Marking attendance by QR for studentId={}", request.getStudentId());
        // Find session by QR code
        AttendanceSessionEntity session = sessionRepository.findByQrCode(request.getQrCode())
                .orElseThrow(() -> {
                    log.warn("Invalid or expired QR code used by studentId={}", request.getStudentId());
                    return new EntityNotFoundException("Invalid or expired QR code");
                });

        // Check if QR code has expired
        if (LocalDateTime.now().isAfter(session.getQrExpiryTime())) {
            log.warn("Expired QR code used by studentId={} for sessionId={}", request.getStudentId(), session.getId());
            throw new IllegalStateException("QR code has expired");
        }

        // Find student's attendance record
        AttendanceEntity attendance = attendanceRepository
                .findByAttendanceSessionIdAndStudentId(session.getId(), request.getStudentId())
                .orElseThrow(() -> {
                    log.warn("Student id={} not found in attendance session id={}", request.getStudentId(), session.getId());
                    return new EntityNotFoundException("Student not found in this attendance session");
                });

        // Mark as present
        attendance.setStatus(AttendanceStatus.PRESENT);
        attendance.setRecordedTime(LocalDateTime.now());
        attendanceRepository.save(attendance);
        log.info("Attendance marked PRESENT for studentId={} in sessionId={}", request.getStudentId(), session.getId());
        return attendanceMapper.toDto(session);
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
        return attendanceMapper.toDto(session);
    }
}