package com.menghor.ksit.feature.attendance.controller;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.attendance.dto.request.AttendanceHistoryFilterDto;
import com.menghor.ksit.feature.attendance.dto.request.AttendanceSessionRequest;
import com.menghor.ksit.feature.attendance.dto.request.QrAttendanceRequest;
import com.menghor.ksit.feature.attendance.dto.response.AttendanceDto;
import com.menghor.ksit.feature.attendance.dto.response.AttendanceSessionDto;
import com.menghor.ksit.feature.attendance.dto.update.AttendanceUpdateRequest;
import com.menghor.ksit.feature.attendance.service.AttendanceService;
import com.menghor.ksit.feature.attendance.service.AttendanceSessionService;
import com.menghor.ksit.feature.auth.models.Role;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import com.menghor.ksit.utils.database.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Slf4j
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final AttendanceSessionService sessionService;
    private final SecurityUtils securityUtils;

    @GetMapping("/{id}")
    public ApiResponse<AttendanceDto> getAttendance(@PathVariable Long id) {
        log.info("Get attendance id={} request received", id);
        return new ApiResponse<>("success", "Attendance retrieved successfully", attendanceService.findById(id));
    }

    @PutMapping("/update")
    public ApiResponse<AttendanceDto> updateAttendance(@RequestBody AttendanceUpdateRequest request) {
        log.info("Update attendance id={} request received", request.getId());
        AttendanceDto result = attendanceService.updateAttendance(request);
        log.info("Attendance id={} updated successfully", request.getId());
        return new ApiResponse<>("success", "Attendance updated successfully", result);
    }

    @GetMapping("/session/{id}")
    public ApiResponse<AttendanceSessionDto> getAttendanceSession(
            @PathVariable @Positive Long id) {
        log.info("Get attendance session id={} request received", id);
        AttendanceSessionDto session = sessionService.findById(id);
        return new ApiResponse<>("success", "Attendance session retrieved successfully", session);
    }

    @PostMapping("/history")
    public ApiResponse<CustomPaginationResponseDto<AttendanceDto>> getAttendanceHistory(
            @RequestBody AttendanceHistoryFilterDto filterDto) {
        log.info("Get attendance history request received");
        CustomPaginationResponseDto<AttendanceDto> response = attendanceService.findAttendanceHistory(filterDto);
        return new ApiResponse<>("success", "Attendance history retrieved successfully", response);
    }

    @PostMapping("/history/all")
    public ApiResponse<List<AttendanceDto>> getAllAttendanceHistory(
            @RequestBody AttendanceHistoryFilterDto filterDto) {
        log.info("Get all attendance history request received");
        List<AttendanceDto> response = attendanceService.findAllAttendanceHistory(filterDto);
        return new ApiResponse<>("success", "All attendance history retrieved successfully", response);
    }

    @PostMapping("/history/count")
    public ApiResponse<Long> getAttendanceHistoryCount(
            @RequestBody AttendanceHistoryFilterDto filterDto) {
        log.info("Count attendance history request received");
        Long count = attendanceService.countAttendanceHistory(filterDto);
        return new ApiResponse<>("success", "Attendance history count retrieved successfully", count);
    }

    @PostMapping("/history/token")
    public ApiResponse<CustomPaginationResponseDto<AttendanceDto>> getMyAttendanceHistory(
            @RequestBody AttendanceHistoryFilterDto filterDto) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        log.info("Get my attendance history request received. userId={}", currentUser.getId());

        boolean isStudent = currentUser.getRoles().stream()
                .map(Role::getName)
                .anyMatch(role -> role == RoleEnum.STUDENT);

        if (!isStudent) {
            log.warn("Non-student user attempted to access student attendance history. userId={}", currentUser.getId());
            CustomPaginationResponseDto<AttendanceDto> emptyResponse = new CustomPaginationResponseDto<>(
                    Collections.emptyList(),
                    filterDto.getPageNo() != null ? filterDto.getPageNo() : 1,
                    filterDto.getPageSize() != null ? filterDto.getPageSize() : 10,
                    0L,
                    0,
                    true
            );
            return new ApiResponse<>("success", "Access restricted to students only", emptyResponse);
        }

        filterDto.setStudentId(currentUser.getId());
        CustomPaginationResponseDto<AttendanceDto> response = attendanceService.findAttendanceHistory(filterDto);
        return new ApiResponse<>("success", "My attendance history retrieved successfully", response);
    }

    @PostMapping("/initialize")
    public ApiResponse<AttendanceSessionDto> generateSession(
            @Valid @RequestBody AttendanceSessionRequest request) {
        log.info("Generate attendance session request received. scheduleId={}", request.getScheduleId());
        AttendanceSessionDto session = sessionService.generateAttendanceSession(request);
        log.info("Attendance session generated successfully. sessionId={}", session.getId());
        return new ApiResponse<>("success", "Attendance session generated successfully", session);
    }

    @PostMapping("/mark-by-qr")
    public ApiResponse<AttendanceSessionDto> markAttendanceByQr(
            @Valid @RequestBody QrAttendanceRequest request) {
        log.info("Mark attendance by QR request received. studentId={}", request.getStudentId());
        AttendanceSessionDto session = sessionService.markAttendanceByQr(request);
        log.info("Attendance marked successfully via QR");
        return new ApiResponse<>("success", "Attendance marked successfully", session);
    }

    @PostMapping("/token/mark-by-qr")
    public ApiResponse<AttendanceSessionDto> markTokenAttendanceByQr(
            @Valid @RequestBody QrAttendanceRequest request) {
        Long userId = securityUtils.getUserIdFromToken();
        log.info("Mark token attendance by QR request received. userId={}", userId);
        request.setStudentId(userId);
        AttendanceSessionDto session = sessionService.markAttendanceByQr(request);
        log.info("Token attendance marked successfully via QR. userId={}", userId);
        return new ApiResponse<>("success", "Attendance marked successfully", session);
    }

    @PostMapping("/submit/{sessionId}")
    public ApiResponse<AttendanceSessionDto> finalizeSession(
            @PathVariable @Positive Long sessionId) {
        log.info("Finalize attendance session id={} request received", sessionId);
        AttendanceSessionDto session = sessionService.finalizeAttendanceSession(sessionId);
        log.info("Attendance session id={} finalized successfully", sessionId);
        return new ApiResponse<>("success", "Attendance session finalized successfully", session);
    }

}