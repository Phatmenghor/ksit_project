package com.menghor.ksit.feature.score.service;

import com.menghor.ksit.feature.score.dto.request.ScoreConfigurationRequestDto;
import com.menghor.ksit.feature.score.dto.response.ScoreConfigurationResponseDto;

public interface ScoreConfigurationService {
    ScoreConfigurationResponseDto createOrUpdateScoreConfiguration(ScoreConfigurationRequestDto requestDto);
    ScoreConfigurationResponseDto getScoreConfiguration();
}