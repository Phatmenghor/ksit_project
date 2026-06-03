package com.menghor.ksit.feature.attendance.service.impl;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.exceptoins.error.BadRequestException;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.attendance.dto.request.ScoreConfigurationRequestDto;
import com.menghor.ksit.feature.attendance.dto.response.ScoreConfigurationResponseDto;
import com.menghor.ksit.feature.attendance.mapper.ScoreConfigurationMapper;
import com.menghor.ksit.feature.attendance.models.ScoreConfigurationEntity;
import com.menghor.ksit.feature.attendance.repository.ScoreConfigurationRepository;
import com.menghor.ksit.feature.attendance.service.ScoreConfigurationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScoreConfigurationServiceImpl implements ScoreConfigurationService {

    private final ScoreConfigurationRepository scoreConfigRepository;
    private final ScoreConfigurationMapper scoreConfigMapper;

    @Override
    @Transactional
    public ScoreConfigurationResponseDto createOrUpdateScoreConfiguration(ScoreConfigurationRequestDto requestDto) {

        // Validate percentages total 100%
        if (!validatePercentageTotal(requestDto)) {
            throw new BadRequestException("Score percentages must add up to exactly 100%. Current total: " +
                    getTotalPercentage(requestDto));
        }

        Optional<ScoreConfigurationEntity> existingConfig = scoreConfigRepository.findByStatus(Status.ACTIVE);

        ScoreConfigurationEntity entity;
        if (existingConfig.isPresent()) {
            entity = existingConfig.get();
            scoreConfigMapper.updateEntityFromDto(requestDto, entity);
        } else {
            entity = scoreConfigMapper.toEntity(requestDto);
        }

        ScoreConfigurationEntity savedEntity = scoreConfigRepository.save(entity);

        return scoreConfigMapper.toResponseDto(savedEntity);
    }

    @Override
    public ScoreConfigurationResponseDto getScoreConfiguration() {

        ScoreConfigurationEntity entity = scoreConfigRepository.findByStatus(Status.ACTIVE)
                .orElseThrow(() -> new NotFoundException("No active score configuration found"));

        return scoreConfigMapper.toResponseDto(entity);
    }

    private boolean validatePercentageTotal(ScoreConfigurationRequestDto requestDto) {
        Integer total = getTotalPercentage(requestDto);
        boolean isValid = total.equals(100);
        return isValid;
    }

    private Integer getTotalPercentage(ScoreConfigurationRequestDto requestDto) {
        return requestDto.getAttendancePercentage() +
                requestDto.getAssignmentPercentage() +
                requestDto.getMidtermPercentage() +
                requestDto.getFinalPercentage();
    }

    @EventListener(ContextRefreshedEvent.class)
    @Transactional
    public void initializeDefaultConfiguration() {

        if (scoreConfigRepository.countByStatus(Status.ACTIVE) == 0) {
            ScoreConfigurationEntity defaultConfig = scoreConfigMapper.createDefaultConfiguration();
            ScoreConfigurationEntity savedConfig = scoreConfigRepository.save(defaultConfig);

        } else {
        }
    }
}