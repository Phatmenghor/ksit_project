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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final StudentService studentService;
    private final SecurityUtils securityUtils;

    @PostMapping("/register")
    public ApiResponse<StudentUserResponseDto> registerStudent(@Valid @RequestBody StudentCreateRequestDto requestDto) {
        log.info("Register student request received");
        StudentUserResponseDto registeredStudent = studentService.registerStudent(requestDto);
        log.info("Student registered successfully. id={}", registeredStudent.getId());
        return new ApiResponse<>("success", "Student registered successfully", registeredStudent);
    }

    @PostMapping("/register/batch")
    public ApiResponse<List<StudentResponseDto>> registerStudentBatch(@Valid @RequestBody StudentBatchCreateRequestDto requestDto) {
        log.info("Batch register students request received. count={}", requestDto.getStudents().size());
        List<StudentResponseDto> registeredStudents = studentService.batchRegisterStudents(requestDto);
        log.info("Batch registration completed. registered={}", registeredStudents.size());
        return new ApiResponse<>("success",
                String.format("Successfully registered %d students", registeredStudents.size()),
                registeredStudents);
    }

    @PostMapping("/all")
    public ApiResponse<StudentUserAllResponseDto> getAllStudentUsers(@RequestBody StudentUserFilterRequestDto filterDto) {
        log.info("Get all students request received");
        StudentUserAllResponseDto users = studentService.getAllStudentUsers(filterDto);
        return new ApiResponse<>("success", "Student users retrieved successfully", users);
    }

    @PostMapping("/all-student-list")
    public ApiResponse<List<StudentUserListResponseDto>> getAllStudentListUsers(@RequestBody StudentUserFilterRequestDto filterDto) {
        log.info("Get all student list request received");
        List<StudentUserListResponseDto> users = studentService.getAllStudentListUsers(filterDto);
        return new ApiResponse<>("success", "Student users retrieved successfully", users);
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentUserResponseDto> getStudentUserById(@PathVariable Long id) {
        log.info("Get student by id={} request received", id);
        StudentUserResponseDto user = studentService.getStudentUserById(id);
        return new ApiResponse<>("success", "Student user fetched successfully", user);
    }

    @PutMapping("/{id}")
    public ApiResponse<StudentUserResponseDto> updateStudentUser(@PathVariable Long id, @Valid @RequestBody StudentUpdateRequestDto updateDto) {
        log.info("Update student id={} request received", id);
        StudentUserResponseDto updatedUser = studentService.updateStudentUser(id, updateDto);
        log.info("Student id={} updated successfully", id);
        return new ApiResponse<>("success", "Student user updated successfully", updatedUser);
    }

    @PutMapping("token")
    public ApiResponse<StudentUserResponseDto> updateStudentTokenUser(@Valid @RequestBody StudentUpdateRequestDto updateDto) {
        final UserEntity currentEntity = securityUtils.getCurrentUser();
        log.info("Update student by token request received. userId={}", currentEntity.getId());
        StudentUserResponseDto updatedUser = studentService.updateStudentUser(currentEntity.getId(), updateDto);
        return new ApiResponse<>("success", "Student user updated successfully", updatedUser);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<StudentUserResponseDto> deleteStudentUser(@PathVariable Long id) {
        log.info("Delete student id={} request received", id);
        StudentUserResponseDto user = studentService.deleteStudentUser(id);
        log.info("Student id={} deactivated successfully", id);
        return new ApiResponse<>("success", "Student user deactivated successfully", user);
    }
}