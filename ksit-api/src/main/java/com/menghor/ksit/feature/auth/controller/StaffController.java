package com.menghor.ksit.feature.auth.controller;

import com.menghor.ksit.constants.SuccessMessages;
import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.auth.dto.request.StaffCreateRequestDto;
import com.menghor.ksit.feature.auth.dto.request.StaffUpdateRequestDto;
import com.menghor.ksit.feature.auth.dto.filter.StaffUserFilterRequestDto;
import com.menghor.ksit.feature.auth.dto.resposne.StaffUserAllResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StaffUserResponseDto;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.service.StaffService;
import com.menghor.ksit.utils.database.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@Slf4j
public class StaffController {

    private final StaffService staffService;
    private final SecurityUtils securityUtils;

    @PostMapping("/register")
    public ApiResponse<StaffUserResponseDto> registerStaff(@Valid @RequestBody StaffCreateRequestDto requestDto) {
        log.info("Register staff request received");
        StaffUserResponseDto registeredUser = staffService.registerStaff(requestDto);
        log.info("Staff registered successfully. id={}", registeredUser.getId());
        return new ApiResponse<>("success", "Staff registered successfully", registeredUser);
    }

    @PostMapping("/all")
    public ApiResponse<StaffUserAllResponseDto> getAllStaffUsers(@RequestBody StaffUserFilterRequestDto filterDto) {
        log.info("Get all staff users request received");
        StaffUserAllResponseDto users = staffService.getAllStaffUsers(filterDto);
        return new ApiResponse<>("success", "Staff users retrieved successfully", users);
    }

    @GetMapping("/{id}")
    public ApiResponse<StaffUserResponseDto> getStaffUserById(@PathVariable Long id) {
        log.info("Get staff by id={} request received", id);
        StaffUserResponseDto user = staffService.getStaffUserById(id);
        return new ApiResponse<>("success", "Staff user fetched successfully", user);
    }

    @PutMapping("/{id}")
    public ApiResponse<StaffUserResponseDto> updateStaffUser(@PathVariable Long id, @Valid @RequestBody StaffUpdateRequestDto updateDto) {
        log.info("Update staff id={} request received", id);
        StaffUserResponseDto updatedUser = staffService.updateStaffUser(id, updateDto);
        log.info("Staff id={} updated successfully", id);
        return new ApiResponse<>("success", "Staff user updated successfully", updatedUser);
    }

    @PutMapping("token")
    public ApiResponse<StaffUserResponseDto> updateStaffByTokenUser(@Valid @RequestBody StaffUpdateRequestDto updateDto) {
        final UserEntity currentEntity = securityUtils.getCurrentUser();
        log.info("Update staff by token request received. userId={}", currentEntity.getId());
        StaffUserResponseDto updatedUser = staffService.updateStaffUser(currentEntity.getId(), updateDto);
        return new ApiResponse<>("success", "Staff user updated successfully", updatedUser);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<StaffUserResponseDto> deleteStaffUser(@PathVariable Long id) {
        log.info("Delete staff id={} request received", id);
        StaffUserResponseDto user = staffService.deleteStaffUser(id);
        log.info("Staff id={} deactivated successfully", id);
        return new ApiResponse<>("success", "Staff user deactivated successfully", user);
    }
}