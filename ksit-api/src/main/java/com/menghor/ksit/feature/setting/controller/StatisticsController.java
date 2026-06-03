package com.menghor.ksit.feature.setting.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.setting.dto.response.StatisticsResponseDto;
import com.menghor.ksit.feature.setting.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * Get overall system statistics for active entities
     * Only accessible by ADMIN and DEVELOPER roles
     */
    @GetMapping("/overview")
    public ApiResponse<StatisticsResponseDto> getOverallStatistics() {
        
        StatisticsResponseDto statistics = statisticsService.getOverallStatistics();
        
        return new ApiResponse<>(
                "success",
                "Statistics retrieved successfully",
                statistics
        );
    }
}