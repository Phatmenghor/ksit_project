package com.menghor.ksit.feature.auth.controller;

import com.menghor.ksit.constants.SuccessMessages;
import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.auth.dto.request.StudentBatchCreateRequestDto;
import com.menghor.ksit.feature.auth.dto.request.StudentCreateRequestDto;
import com.menghor.ksit.feature.auth.dto.request.StudentUpdateRequestDto;
import com.menghor.ksit.feature.auth.dto.filter.StudentUserFilterRequestDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentUserAllResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentUserListResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentUserResponseDto;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.service.StudentService;
import com.menghor.ksit.utils.database.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final SecurityUtils securityUtils;

    /**
     * Register a new student
     */
    @PostMapping("/register")
    public ApiResponse<StudentUserResponseDto> registerStudent(@Valid @RequestBody StudentCreateRequestDto requestDto) {
        StudentUserResponseDto registeredStudent = studentService.registerStudent(requestDto);
        return new ApiResponse<>("success", "Student registered successfully", registeredStudent);
    }

    /**
     * Register multiple students in a batch
     */
    @PostMapping("/register/batch")
    public ApiResponse<List<StudentResponseDto>> registerStudentBatch(@Valid @RequestBody StudentBatchCreateRequestDto requestDto) {
        List<StudentResponseDto> registeredStudents = studentService.batchRegisterStudents(requestDto);
        return new ApiResponse<>("success",
                String.format("Successfully registered %d students", registeredStudents.size()),
                registeredStudents);
    }

    /**
     * Get all student users with filtering
     */
    @PostMapping("/all")
    public ApiResponse<StudentUserAllResponseDto> getAllStudentUsers(@RequestBody StudentUserFilterRequestDto filterDto) {
        StudentUserAllResponseDto users = studentService.getAllStudentUsers(filterDto);
        return new ApiResponse<>("success", "Student users retrieved successfully", users);
    }

    @PostMapping("/all-student-list")
    public ApiResponse<List<StudentUserListResponseDto>> getAllStudentListUsers(@RequestBody StudentUserFilterRequestDto filterDto) {
        List<StudentUserListResponseDto> users = studentService.getAllStudentListUsers(filterDto);
        return new ApiResponse<>("success", "Student users retrieved successfully", users);
    }

    /**
     * Get student user by ID
     */
    @GetMapping("/{id}")
    public ApiResponse<StudentUserResponseDto> getStudentUserById(@PathVariable Long id) {
        StudentUserResponseDto user = studentService.getStudentUserById(id);
        return new ApiResponse<>("'success'", "Student user fetched successfully", user);
    }

    /**
     * Update student user
     */
    @PutMapping("/{id}")
    public ApiResponse<StudentUserResponseDto> updateStudentUser(@PathVariable Long id, @Valid @RequestBody StudentUpdateRequestDto updateDto) {
        StudentUserResponseDto updatedUser = studentService.updateStudentUser(id, updateDto);
        return new ApiResponse<>("'success'", "Student user updated successfully", updatedUser);
    }

    /**
     * Update student token user
     */
    @PutMapping("token")
    public ApiResponse<StudentUserResponseDto> updateStudentTokenUser( @Valid @RequestBody StudentUpdateRequestDto updateDto) {
        final UserEntity currentEntity = securityUtils.getCurrentUser();
        StudentUserResponseDto updatedUser = studentService.updateStudentUser(currentEntity.getId(), updateDto);
        return new ApiResponse<>("'success'", "Student user updated successfully", updatedUser);
    }

    /**
     * Delete/deactivate student user
     */
    @DeleteMapping("/{id}")
    public ApiResponse<StudentUserResponseDto> deleteStudentUser(@PathVariable Long id) {
        StudentUserResponseDto user = studentService.deleteStudentUser(id);
        return new ApiResponse<>("success", "Student user deactivated successfully", user);
    }
}