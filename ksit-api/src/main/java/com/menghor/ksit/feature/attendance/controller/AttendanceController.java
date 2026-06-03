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
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final AttendanceSessionService sessionService;
    private final SecurityUtils securityUtils;

    @GetMapping("/{id}")
    public ApiResponse<AttendanceDto> getAttendance(@PathVariable Long id) {
        return new ApiResponse<>(
                "success",
                "Attendance retrieved successfully",
                attendanceService.findById(id)
        );
    }

    @PutMapping("/update")
    public ApiResponse<AttendanceDto> updateAttendance(@RequestBody AttendanceUpdateRequest request) {
        return new ApiResponse<>(
                "success",
                "Attendance updated retrieved successfully",
                attendanceService.updateAttendance(request)
        );
    }

    @GetMapping("/session/{id}")
    public ApiResponse<AttendanceSessionDto> getAttendanceSession(
            @PathVariable @Positive Long id) {

        UserEntity currentUser = securityUtils.getCurrentUser();

        AttendanceSessionDto session = sessionService.findById(id);

        return new ApiResponse<>(
                "success",
                "Attendance session retrieved successfully",
                session
        );
    }

    @PostMapping("/history")
    public ApiResponse<CustomPaginationResponseDto<AttendanceDto>> getAttendanceHistory(
            @RequestBody AttendanceHistoryFilterDto filterDto) {
        CustomPaginationResponseDto<AttendanceDto> response =
                attendanceService.findAttendanceHistory(filterDto);
        return new ApiResponse<>(
                "success",
                "Attendance history retrieved successfully",
                response
        );
    }

    @PostMapping("/history/all")
    public ApiResponse<List<AttendanceDto>> getAllAttendanceHistory(
            @RequestBody AttendanceHistoryFilterDto filterDto) {
        List<AttendanceDto> response = attendanceService.findAllAttendanceHistory(filterDto);
        return new ApiResponse<>(
                "success",
                "All attendance history retrieved successfully",
                response
        );
    }

    @PostMapping("/history/count")
    public ApiResponse<Long> getAttendanceHistoryCount(
            @RequestBody AttendanceHistoryFilterDto filterDto) {
        Long count = attendanceService.countAttendanceHistory(filterDto);
        return new ApiResponse<>(
                "success",
                "Attendance history count retrieved successfully",
                count
        );
    }

    @PostMapping("/history/token")
    public ApiResponse<CustomPaginationResponseDto<AttendanceDto>> getMyAttendanceHistory(
            @RequestBody AttendanceHistoryFilterDto filterDto) {

        UserEntity currentUser = securityUtils.getCurrentUser();

        // Check if user has STUDENT role
        boolean isStudent = currentUser.getRoles().stream()
                .map(Role::getName)
                .anyMatch(role -> role == RoleEnum.STUDENT);

        if (!isStudent) {
            CustomPaginationResponseDto<AttendanceDto> emptyResponse = new CustomPaginationResponseDto<>(
                    Collections.emptyList(),
                    filterDto.getPageNo() != null ? filterDto.getPageNo() : 1,
                    filterDto.getPageSize() != null ? filterDto.getPageSize() : 10,
                    0L,
                    0,
                    true
            );
            return new ApiResponse<>(
                    "success",
                    "Access restricted to students only",
                    emptyResponse
            );
        }

        // Set the current user's ID as student ID in the filter
        filterDto.setStudentId(currentUser.getId());

        CustomPaginationResponseDto<AttendanceDto> response =
                attendanceService.findAttendanceHistory(filterDto);

        if (!response.getContent().isEmpty()) {
            AttendanceDto sample = response.getContent().get(0);
        }

        return new ApiResponse<>(
                "success",
                "My attendance history retrieved successfully with complete course and schedule details",
                response
        );
    }

    @PostMapping("/initialize")
    public ApiResponse<AttendanceSessionDto> generateSession(
            @Valid @RequestBody AttendanceSessionRequest request) {

        AttendanceSessionDto session = sessionService.generateAttendanceSession(request);

        return new ApiResponse<>(
                "success",
                "Attendance session generated successfully",
                session
        );
    }

    @PostMapping("/mark-by-qr")
    public ApiResponse<AttendanceSessionDto> markAttendanceByQr(
            @Valid @RequestBody QrAttendanceRequest request) {

        UserEntity currentUser = securityUtils.getCurrentUser();

        AttendanceSessionDto session = sessionService.markAttendanceByQr(request);

        return new ApiResponse<>(
                "success",
                "Attendance marked successfully",
                session
        );
    }

    @PostMapping("/token/mark-by-qr")
    public ApiResponse<AttendanceSessionDto> markTokenAttendanceByQr(
            @Valid @RequestBody QrAttendanceRequest request) {

        UserEntity currentUser = securityUtils.getCurrentUser();

        request.setStudentId(securityUtils.getUserIdFromToken());

        AttendanceSessionDto session = sessionService.markAttendanceByQr(request);

        return new ApiResponse<>(
                "success",
                "Attendance marked successfully",
                session
        );
    }

    @PostMapping("/submit/{sessionId}")
    public ApiResponse<AttendanceSessionDto> finalizeSession(
            @PathVariable @Positive Long sessionId) {

        AttendanceSessionDto session = sessionService.finalizeAttendanceSession(sessionId);

        return new ApiResponse<>(
                "success",
                "Attendance session finalized successfully",
                session
        );
    }

}