package com.menghor.ksit.feature.school.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.school.dto.filter.ScheduleFilterDto;
import com.menghor.ksit.feature.school.dto.request.ScheduleBulkDuplicateRequestDto;
import com.menghor.ksit.feature.school.dto.request.ScheduleRequestDto;
import com.menghor.ksit.feature.school.dto.response.ScheduleBulkDuplicateResponseDto;
import com.menghor.ksit.feature.school.dto.response.ScheduleResponseDto;
import com.menghor.ksit.feature.school.dto.update.ScheduleUpdateDto;
import com.menghor.ksit.feature.school.service.ScheduleService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Schedules", description = "Manage class schedules and timetables")
@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Slf4j
public class ScheduleController {
    private final ScheduleService scheduleService;

    @PostMapping
    public ApiResponse<ScheduleResponseDto> createSchedule(@Valid @RequestBody ScheduleRequestDto requestDto) {
        log.info("Create schedule request received");
        ScheduleResponseDto responseDto = scheduleService.createSchedule(requestDto);
        log.info("Schedule created successfully. id={}", responseDto.getId());
        return new ApiResponse<>("success", "Schedule created successfully", responseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<ScheduleResponseDto>> getAllSchedules(@RequestBody ScheduleFilterDto filterDto) {
        log.info("Get all schedules request received");
        CustomPaginationResponseDto<ScheduleResponseDto> responseDto = scheduleService.getAllSchedules(filterDto);
        return new ApiResponse<>("success", "Schedules retrieved successfully", responseDto);
    }

    @PostMapping("/bulk-duplicate")
    public ApiResponse<ScheduleBulkDuplicateResponseDto> bulkDuplicateSchedules(
            @Valid @RequestBody ScheduleBulkDuplicateRequestDto requestDto) {
        log.info("Bulk duplicate schedules request received");
        ScheduleBulkDuplicateResponseDto responseDto = scheduleService.bulkDuplicateSchedules(requestDto);
        log.info("Schedules duplicated successfully");
        return new ApiResponse<>("success", "Schedules duplicated successfully", responseDto);
    }

    @PostMapping("/all-list")
    public ApiResponse<List<ScheduleResponseDto>> getAllSchedulesSimple(@RequestBody ScheduleFilterDto filterDto) {
        log.info("Get all schedules list request received");
        List<ScheduleResponseDto> responseDto = scheduleService.getAllSchedulesSimple(filterDto);
        return new ApiResponse<>("success", "All schedules retrieved successfully", responseDto);
    }

    @PostMapping("/my-schedules")
    public ApiResponse<CustomPaginationResponseDto<ScheduleResponseDto>> getMySchedules(@RequestBody ScheduleFilterDto filterDto) {
        log.info("Get my schedules request received");
        CustomPaginationResponseDto<ScheduleResponseDto> responseDto = scheduleService.getMySchedules(filterDto);
        return new ApiResponse<>("success", "User schedules retrieved successfully", responseDto);
    }

    @PostMapping("/my-schedules-list")
    public ApiResponse<List<ScheduleResponseDto>> getMySchedulesSimple(@RequestBody ScheduleFilterDto filterDto) {
        log.info("Get my schedules list request received");
        List<ScheduleResponseDto> responseDto = scheduleService.getMySchedulesSimple(filterDto);
        return new ApiResponse<>("success", "User schedules retrieved successfully", responseDto);
    }

    @GetMapping("/{id}")
    public ApiResponse<ScheduleResponseDto> getScheduleById(@PathVariable Long id) {
        log.info("Get schedule id={} request received", id);
        ScheduleResponseDto responseDto = scheduleService.getScheduleById(id);
        return new ApiResponse<>("success", "Schedule retrieved successfully", responseDto);
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<ScheduleResponseDto> updateSchedule(@PathVariable Long id, @Valid @RequestBody ScheduleUpdateDto updateDto) {
        log.info("Update schedule id={} request received", id);
        ScheduleResponseDto responseDto = scheduleService.updateSchedule(id, updateDto);
        log.info("Schedule id={} updated successfully", id);
        return new ApiResponse<>("success", "Schedule updated successfully", responseDto);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<ScheduleResponseDto> deleteSchedule(@PathVariable Long id) {
        log.info("Delete schedule id={} request received", id);
        ScheduleResponseDto responseDto = scheduleService.deleteSchedule(id);
        log.info("Schedule id={} deleted successfully", id);
        return new ApiResponse<>("success", "Schedule deleted successfully", responseDto);
    }
}