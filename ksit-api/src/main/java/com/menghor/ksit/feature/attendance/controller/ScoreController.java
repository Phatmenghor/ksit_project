package com.menghor.ksit.feature.attendance.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.attendance.dto.filter.ScoreSessionFilterDto;
import com.menghor.ksit.feature.attendance.dto.request.ScoreConfigurationRequestDto;
import com.menghor.ksit.feature.attendance.dto.request.ScoreSessionRequestDto;
import com.menghor.ksit.feature.attendance.dto.response.ScoreConfigurationResponseDto;
import com.menghor.ksit.feature.attendance.dto.response.ScoreSessionResponseDto;
import com.menghor.ksit.feature.attendance.dto.response.StudentScoreResponseDto;
import com.menghor.ksit.feature.attendance.dto.update.ScoreSessionUpdateDto;
import com.menghor.ksit.feature.attendance.dto.update.StudentScoreUpdateDto;
import com.menghor.ksit.feature.attendance.service.ScoreConfigurationService;
import com.menghor.ksit.feature.attendance.service.ScoreSessionService;
import com.menghor.ksit.feature.attendance.service.StudentScoreService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/score")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreSessionService scoreSessionService;
    private final StudentScoreService studentScoreService;
    private final ScoreConfigurationService scoreConfigurationService;

    // Score Configuration Endpoints
    @PostMapping("/configuration")
    public ApiResponse<ScoreConfigurationResponseDto> createOrUpdateScoreConfiguration(
            @Valid @RequestBody ScoreConfigurationRequestDto requestDto) {
        ScoreConfigurationResponseDto responseDto = scoreConfigurationService.createOrUpdateScoreConfiguration(requestDto);
        return new ApiResponse<>(
                "success",
                "Score configuration saved successfully",
                responseDto
        );
    }

    @GetMapping("/configuration")
    public ApiResponse<ScoreConfigurationResponseDto> getScoreConfiguration() {
        ScoreConfigurationResponseDto responseDto = scoreConfigurationService.getScoreConfiguration();
        return new ApiResponse<>(
                "success",
                "Score configuration retrieved successfully",
                responseDto
        );
    }

    // Score Session Endpoints
    @PostMapping("/initialize")
    public ApiResponse<ScoreSessionResponseDto> initializeScoreSession(@Valid @RequestBody ScoreSessionRequestDto requestDto) {
        ScoreSessionResponseDto responseDto = scoreSessionService.initializeScoreSession(requestDto);
        return new ApiResponse<>(
                "success",
                "Score session initialized successfully",
                responseDto
        );
    }

    @GetMapping("/session/{id}")
    public ApiResponse<ScoreSessionResponseDto> getScoreSessionById(@PathVariable Long id) {
        ScoreSessionResponseDto responseDto = scoreSessionService.getScoreSessionById(id);
        return new ApiResponse<>(
                "success",
                "Score session retrieved successfully",
                responseDto
        );
    }

    @PutMapping("/submission-update")
    public ApiResponse<ScoreSessionResponseDto> updateScoreSession(
            @Valid @RequestBody ScoreSessionUpdateDto updateDto) {
        ScoreSessionResponseDto responseDto = scoreSessionService.updateScoreSession(updateDto);
        return new ApiResponse<>(
                "success",
                "Score session updated successfully",
                responseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<ScoreSessionResponseDto>> getAllScoreSessions(
            @Valid @RequestBody ScoreSessionFilterDto filterDto) {
        CustomPaginationResponseDto<ScoreSessionResponseDto> response =
                scoreSessionService.getAllScoreSessions(filterDto);
        return new ApiResponse<>(
                "success",
                "Score sessions retrieved successfully",
                response
        );
    }

    // Student Score Endpoints
    @GetMapping("/{id}")
    public ApiResponse<StudentScoreResponseDto> getStudentScoreById(@PathVariable Long id) {
        StudentScoreResponseDto responseDto = studentScoreService.getStudentScoreById(id);
        return new ApiResponse<>(
                "success",
                "Student score retrieved successfully",
                responseDto
        );
    }

    @PutMapping("/score-update")
    public ApiResponse<StudentScoreResponseDto> updateStudentScore(
            @Valid @RequestBody StudentScoreUpdateDto updateDto) {
        StudentScoreResponseDto responseDto = studentScoreService.updateStudentScore(updateDto);
        return new ApiResponse<>(
                "success",
                "Student score updated successfully",
                responseDto
        );
    }
}