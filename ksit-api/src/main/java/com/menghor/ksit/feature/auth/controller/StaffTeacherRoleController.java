package com.menghor.ksit.feature.auth.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.auth.dto.resposne.UserRoleResponseDto;
import com.menghor.ksit.feature.auth.dto.update.UserRoleUpdateRequestDto;
import com.menghor.ksit.feature.auth.service.StaffTeacherRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff-teacher-roles")
@RequiredArgsConstructor
@Slf4j
public class StaffTeacherRoleController {

    private final StaffTeacherRoleService staffTeacherRoleService;

    @GetMapping("/users/{userId}")
    public ApiResponse<List<UserRoleResponseDto>> getUserRoles(@PathVariable Long userId) {
        log.info("Get roles for userId={} request received", userId);
        List<UserRoleResponseDto> roles = staffTeacherRoleService.getUserStaffTeacherRoles(userId);
        return ApiResponse.success("User roles retrieved successfully", roles);
    }

    @PutMapping("/users/{userId}/roles")
    public ApiResponse<List<UserRoleResponseDto>> updateUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequestDto updateDto) {
        log.info("Update roles for userId={} request received", userId);
        List<UserRoleResponseDto> updatedRoles = staffTeacherRoleService.updateUserStaffTeacherRoles(userId, updateDto);
        log.info("Roles updated successfully for userId={}", userId);
        return ApiResponse.success("User roles updated successfully", updatedRoles);
    }
}