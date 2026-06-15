package com.menghor.ksit.feature.setting.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.setting.dto.response.StatisticsResponseDto;
import com.menghor.ksit.feature.setting.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Statistics", description = "Dashboard statistics and analytics")
@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
@Slf4j
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/overview")
    public ApiResponse<StatisticsResponseDto> getOverallStatistics() {
        log.info("Get overall statistics request received");
        StatisticsResponseDto statistics = statisticsService.getOverallStatistics();
        return new ApiResponse<>("success", "Statistics retrieved successfully", statistics);
    }
}