package com.menghor.ksit.feature.auth.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.auth.dto.resposne.UserRoleResponseDto;
import com.menghor.ksit.feature.auth.dto.update.UserRoleUpdateRequestDto;
import com.menghor.ksit.feature.auth.service.StaffTeacherRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff-teacher-roles")
@RequiredArgsConstructor
public class StaffTeacherRoleController {

    private final StaffTeacherRoleService staffTeacherRoleService;

    @GetMapping("/users/{userId}")
    public ApiResponse<List<UserRoleResponseDto>> getUserRoles(@PathVariable Long userId) {
        List<UserRoleResponseDto> roles = staffTeacherRoleService.getUserStaffTeacherRoles(userId);
        return ApiResponse.success("User roles retrieved successfully", roles);
    }

    @PutMapping("/users/{userId}/roles")
    public ApiResponse<List<UserRoleResponseDto>> updateUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequestDto updateDto) {
        List<UserRoleResponseDto> updatedRoles = staffTeacherRoleService.updateUserStaffTeacherRoles(userId, updateDto);
        return ApiResponse.success("User roles updated successfully", updatedRoles);
    }
}