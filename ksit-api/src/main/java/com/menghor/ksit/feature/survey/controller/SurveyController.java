package com.menghor.ksit.feature.survey.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.survey.dto.filter.SurveyReportFilterDto;
import com.menghor.ksit.feature.survey.dto.filter.SurveyReportHeaderFilterDto;
import com.menghor.ksit.feature.survey.dto.request.SurveyResponseSubmitDto;
import com.menghor.ksit.feature.survey.dto.response.*;
import com.menghor.ksit.feature.survey.dto.update.SurveyUpdateDto;
import com.menghor.ksit.feature.survey.service.SurveyProgressService;
import com.menghor.ksit.feature.survey.service.SurveyReportService;
import com.menghor.ksit.feature.survey.service.SurveyService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/surveys")
@RequiredArgsConstructor
@Slf4j
public class SurveyController {

    private final SurveyService surveyService;
    private final SurveyReportService surveyReportService;
    private final SurveyProgressService surveyProgressService;

    @GetMapping("/main")
    public ApiResponse<SurveyResponseDto> getMainSurvey() {
        log.info("Get main survey request received");
        SurveyResponseDto response = surveyService.getMainSurvey();
        return ApiResponse.success("Main survey fetched successfully", response);
    }

    @PutMapping("/main")
    public ApiResponse<SurveyResponseDto> updateMainSurvey(@Valid @RequestBody SurveyUpdateDto updateDto) {
        log.info("Update main survey request received");
        SurveyResponseDto response = surveyService.updateMainSurvey(updateDto);
        log.info("Survey updated successfully");
        return ApiResponse.success("Survey updated successfully", response);
    }

    @DeleteMapping("/section/{sectionId}")
    public ApiResponse<SurveyResponseDto> deleteSurveySection(@PathVariable Long sectionId) {
        log.info("Delete survey section id={} request received", sectionId);
        SurveyResponseDto updatedSurvey = surveyService.deleteSurveySectionAndGetUpdatedSurvey(sectionId);
        return ApiResponse.success("Survey section deleted successfully", updatedSurvey);
    }

    @GetMapping("/schedule/{scheduleId}/students-progress")
    public ApiResponse<ScheduleStudentsProgressDto> getScheduleStudentsProgress(@PathVariable Long scheduleId) {
        log.info("Get students survey progress for scheduleId={} request received", scheduleId);
        ScheduleStudentsProgressDto response = surveyProgressService.getScheduleStudentsProgress(scheduleId);
        return ApiResponse.success("Students survey progress fetched successfully", response);
    }

    @DeleteMapping("/question/{questionId}")
    public ApiResponse<SurveyResponseDto> deleteSurveyQuestion(@PathVariable Long questionId) {
        log.info("Delete survey question id={} request received", questionId);
        SurveyResponseDto updatedSurvey = surveyService.deleteSurveyQuestionAndGetUpdatedSurvey(questionId);
        return ApiResponse.success("Survey question deleted successfully", updatedSurvey);
    }

    @PostMapping("/schedule/{scheduleId}/submit")
    public ApiResponse<StudentSurveyResponseDto> submitSurveyResponse(
            @PathVariable Long scheduleId,
            @Valid @RequestBody SurveyResponseSubmitDto submitDto) {
        log.info("Submit survey response for scheduleId={} request received", scheduleId);
        StudentSurveyResponseDto response = surveyService.submitSurveyResponseForSchedule(scheduleId, submitDto);
        log.info("Survey response submitted successfully for scheduleId={}", scheduleId);
        return ApiResponse.success("Survey response submitted successfully", response);
    }

    @GetMapping("/schedule/{scheduleId}/my-response")
    public ApiResponse<StudentSurveyResponseDto> getMyResponseForSchedule(@PathVariable Long scheduleId) {
        log.info("Get my survey response for scheduleId={} request received", scheduleId);
        StudentSurveyResponseDto response = surveyService.getMyResponseForSchedule(scheduleId);
        return ApiResponse.success("Your survey response fetched successfully", response);
    }

    @GetMapping("/response/{responseId}/detail")
    public ApiResponse<SurveyResponseDetailDto> getStudentResponseDetail(@PathVariable Long responseId) {
        log.info("Get survey response detail id={} request received", responseId);
        SurveyResponseDetailDto response = surveyService.getStudentResponseDetail(responseId);
        return ApiResponse.success("Survey response detail fetched successfully", response);
    }

    @PostMapping("/reports/preview")
    public ApiResponse<CustomPaginationResponseDto<SurveyReportRowDto>> getSurveyReportPreview(
            @Valid @RequestBody SurveyReportFilterDto filterDto) {
        log.info("Get survey report preview request received");
        CustomPaginationResponseDto<SurveyReportRowDto> response = surveyReportService.getSurveyReportWithPagination(filterDto);
        return ApiResponse.success("Survey report preview fetched successfully", response);
    }

    @PostMapping("/reports/export")
    public ApiResponse<List<SurveyReportRowDto>> getSurveyReportForExport(
            @Valid @RequestBody SurveyReportFilterDto filterDto) {
        log.info("Get survey report for export request received");
        List<SurveyReportRowDto> response = surveyReportService.getSurveyReportForExport(filterDto);
        return ApiResponse.success("Survey report for export fetched successfully", response);
    }

    @PostMapping("/reports/headers")
    public ApiResponse<List<SurveyReportHeaderDto>> getSurveyReportHeaders(@Valid @RequestBody SurveyReportHeaderFilterDto headerFilterDto) {
        log.info("Get survey report headers request received");
        List<SurveyReportHeaderDto> headers = surveyReportService.getFilteredSurveyReportHeaders(headerFilterDto);
        return ApiResponse.success("Survey report headers fetched successfully", headers);
    }

    @PostMapping("/reports/active/preview")
    public ApiResponse<CustomPaginationResponseDto<SurveyReportRowDto>> getSurveyReportActivePreview(
            @Valid @RequestBody SurveyReportFilterDto filterDto) {
        log.info("Get active survey report preview request received");
        CustomPaginationResponseDto<SurveyReportRowDto> response = surveyReportService.getSurveyReportWithPaginationActiveOnly(filterDto);
        return ApiResponse.success("Survey report active preview fetched successfully", response);
    }

    @PostMapping("/reports/active/export")
    public ApiResponse<List<SurveyReportRowDto>> getSurveyReportActiveForExport(
            @Valid @RequestBody SurveyReportFilterDto filterDto) {
        log.info("Get active survey report for export request received");
        List<SurveyReportRowDto> response = surveyReportService.getSurveyReportForExportActiveOnly(filterDto);
        return ApiResponse.success("Survey report active export fetched successfully", response);
    }

    @PostMapping("/reports/active/headers")
    public ApiResponse<List<SurveyReportHeaderDto>> getSurveyReportActiveHeaders(@Valid @RequestBody SurveyReportHeaderFilterDto headerFilterDto) {
        log.info("Get active survey report headers request received");
        List<SurveyReportHeaderDto> headers = surveyReportService.getFilteredSurveyReportHeadersActiveOnly(headerFilterDto);
        return ApiResponse.success("Survey report active headers fetched successfully", headers);
    }
}