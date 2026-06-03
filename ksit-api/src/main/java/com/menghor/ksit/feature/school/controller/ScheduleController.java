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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;

    @PostMapping
    public ApiResponse<ScheduleResponseDto> createSchedule(@Valid @RequestBody ScheduleRequestDto requestDto) {
        ScheduleResponseDto responseDto = scheduleService.createSchedule(requestDto);
        return new ApiResponse<>(
                "success",
                "Schedule created successfully",
                responseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<ScheduleResponseDto>> getAllSchedules(@RequestBody ScheduleFilterDto filterDto) {
        CustomPaginationResponseDto<ScheduleResponseDto> responseDto = scheduleService.getAllSchedules(filterDto);
        return new ApiResponse<>(
                "success",
                "Schedules retrieved successfully",
                responseDto
        );
    }

    @PostMapping("/bulk-duplicate")
    public ApiResponse<ScheduleBulkDuplicateResponseDto> bulkDuplicateSchedules(
            @Valid @RequestBody ScheduleBulkDuplicateRequestDto requestDto) {

        ScheduleBulkDuplicateResponseDto responseDto = scheduleService.bulkDuplicateSchedules(requestDto);

        return new ApiResponse<>(
                "success",
                "Schedules duplicated successfully",
                responseDto
        );
    }

    @PostMapping("/all-list")
    public ApiResponse<List<ScheduleResponseDto>> getAllSchedulesSimple(@RequestBody ScheduleFilterDto filterDto) {
        List<ScheduleResponseDto> responseDto = scheduleService.getAllSchedulesSimple(filterDto);
        return new ApiResponse<>(
                "success",
                "All schedules retrieved successfully",
                responseDto
        );
    }

    @PostMapping("/my-schedules")
    public ApiResponse<CustomPaginationResponseDto<ScheduleResponseDto>> getMySchedules(@RequestBody ScheduleFilterDto filterDto) {
        CustomPaginationResponseDto<ScheduleResponseDto> responseDto = scheduleService.getMySchedules(filterDto);
        return new ApiResponse<>(
                "success",
                "User schedules retrieved successfully",
                responseDto
        );
    }

    @PostMapping("/my-schedules-list")
    public ApiResponse<List<ScheduleResponseDto>> getMySchedulesSimple(@RequestBody ScheduleFilterDto filterDto) {
        List<ScheduleResponseDto> responseDto = scheduleService.getMySchedulesSimple(filterDto);
        return new ApiResponse<>(
                "success",
                "User schedules retrieved successfully",
                responseDto
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<ScheduleResponseDto> getScheduleById(@PathVariable Long id) {
        ScheduleResponseDto responseDto = scheduleService.getScheduleById(id);
        return new ApiResponse<>(
                "success",
                "Schedule retrieved successfully",
                responseDto
        );
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<ScheduleResponseDto> updateSchedule(@PathVariable Long id, @Valid @RequestBody ScheduleUpdateDto updateDto) {
        ScheduleResponseDto responseDto = scheduleService.updateSchedule(id, updateDto);
        return new ApiResponse<>(
                "success",
                "Schedule updated successfully",
                responseDto
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<ScheduleResponseDto> deleteSchedule(@PathVariable Long id) {
        ScheduleResponseDto responseDto = scheduleService.deleteSchedule(id);
        return new ApiResponse<>(
                "success",
                "Schedule deleted successfully",
                responseDto
        );
    }
}