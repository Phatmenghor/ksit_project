package com.menghor.ksit.feature.score.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.score.dto.filter.ScoreSessionFilterDto;
import com.menghor.ksit.feature.score.dto.request.ScoreConfigurationRequestDto;
import com.menghor.ksit.feature.score.dto.request.ScoreSessionRequestDto;
import com.menghor.ksit.feature.score.dto.response.ScoreConfigurationResponseDto;
import com.menghor.ksit.feature.score.dto.response.ScoreSessionResponseDto;
import com.menghor.ksit.feature.score.dto.response.StudentScoreResponseDto;
import com.menghor.ksit.feature.score.dto.update.ScoreSessionUpdateDto;
import com.menghor.ksit.feature.score.dto.update.StudentScoreUpdateDto;
import com.menghor.ksit.feature.score.service.ScoreConfigurationService;
import com.menghor.ksit.feature.score.service.ScoreSessionService;
import com.menghor.ksit.feature.score.service.StudentScoreService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Scores", description = "Manage student scores, grades, and score configurations")
@RestController
@RequestMapping("/api/v1/score")
@RequiredArgsConstructor
@Slf4j
public class ScoreController {

    private final ScoreSessionService scoreSessionService;
    private final StudentScoreService studentScoreService;
    private final ScoreConfigurationService scoreConfigurationService;

    @PostMapping("/configuration")
    public ApiResponse<ScoreConfigurationResponseDto> createOrUpdateScoreConfiguration(
            @Valid @RequestBody ScoreConfigurationRequestDto requestDto) {
        log.info("Create/update score configuration request received");
        ScoreConfigurationResponseDto responseDto = scoreConfigurationService.createOrUpdateScoreConfiguration(requestDto);
        log.info("Score configuration saved successfully");
        return new ApiResponse<>("success", "Score configuration saved successfully", responseDto);
    }

    @GetMapping("/configuration")
    public ApiResponse<ScoreConfigurationResponseDto> getScoreConfiguration() {
        log.info("Get score configuration request received");
        ScoreConfigurationResponseDto responseDto = scoreConfigurationService.getScoreConfiguration();
        return new ApiResponse<>("success", "Score configuration retrieved successfully", responseDto);
    }

    @PostMapping("/initialize")
    public ApiResponse<ScoreSessionResponseDto> initializeScoreSession(@Valid @RequestBody ScoreSessionRequestDto requestDto) {
        log.info("Initialize score session request received. scheduleId={}", requestDto.getScheduleId());
        ScoreSessionResponseDto responseDto = scoreSessionService.initializeScoreSession(requestDto);
        log.info("Score session initialized successfully. id={}", responseDto.getId());
        return new ApiResponse<>("success", "Score session initialized successfully", responseDto);
    }

    @GetMapping("/session/{id}")
    public ApiResponse<ScoreSessionResponseDto> getScoreSessionById(@PathVariable Long id) {
        log.info("Get score session id={} request received", id);
        ScoreSessionResponseDto responseDto = scoreSessionService.getScoreSessionById(id);
        return new ApiResponse<>("success", "Score session retrieved successfully", responseDto);
    }

    @PutMapping("/submission-update")
    public ApiResponse<ScoreSessionResponseDto> updateScoreSession(
            @Valid @RequestBody ScoreSessionUpdateDto updateDto) {
        log.info("Update score session id={} request received", updateDto.getId());
        ScoreSessionResponseDto responseDto = scoreSessionService.updateScoreSession(updateDto);
        log.info("Score session id={} updated successfully", updateDto.getId());
        return new ApiResponse<>("success", "Score session updated successfully", responseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<ScoreSessionResponseDto>> getAllScoreSessions(
            @Valid @RequestBody ScoreSessionFilterDto filterDto) {
        log.info("Get all score sessions request received");
        CustomPaginationResponseDto<ScoreSessionResponseDto> response = scoreSessionService.getAllScoreSessions(filterDto);
        return new ApiResponse<>("success", "Score sessions retrieved successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentScoreResponseDto> getStudentScoreById(@PathVariable Long id) {
        log.info("Get student score id={} request received", id);
        StudentScoreResponseDto responseDto = studentScoreService.getStudentScoreById(id);
        return new ApiResponse<>("success", "Student score retrieved successfully", responseDto);
    }

    @PutMapping("/score-update")
    public ApiResponse<StudentScoreResponseDto> updateStudentScore(
            @Valid @RequestBody StudentScoreUpdateDto updateDto) {
        log.info("Update student score id={} request received", updateDto.getId());
        StudentScoreResponseDto responseDto = studentScoreService.updateStudentScore(updateDto);
        log.info("Student score id={} updated successfully", updateDto.getId());
        return new ApiResponse<>("success", "Student score updated successfully", responseDto);
    }
}