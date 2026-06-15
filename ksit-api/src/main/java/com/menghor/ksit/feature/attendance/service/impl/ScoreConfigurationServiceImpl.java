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
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScoreConfigurationServiceImpl implements ScoreConfigurationService {

    private final ScoreConfigurationRepository scoreConfigRepository;
    private final ScoreConfigurationMapper scoreConfigMapper;

    @Override
    @Transactional
    public ScoreConfigurationResponseDto createOrUpdateScoreConfiguration(ScoreConfigurationRequestDto requestDto) {
        log.info("Creating or updating score configuration");
        if (!validatePercentageTotal(requestDto)) {
            int total = getTotalPercentage(requestDto);
            log.warn("Score percentages validation failed. total={}%, expected=100%", total);
            throw new BadRequestException("Score percentages must add up to exactly 100%. Current total: " + total);
        }

        Optional<ScoreConfigurationEntity> existingConfig = scoreConfigRepository.findByStatus(Status.ACTIVE);

        ScoreConfigurationEntity entity;
        if (existingConfig.isPresent()) {
            entity = existingConfig.get();
            scoreConfigMapper.updateEntityFromDto(requestDto, entity);
            log.info("Updating existing score configuration id={}", entity.getId());
        } else {
            entity = scoreConfigMapper.toEntity(requestDto);
            log.info("Creating new score configuration");
        }

        ScoreConfigurationEntity savedEntity = scoreConfigRepository.save(entity);
        log.info("Score configuration saved successfully. id={}", savedEntity.getId());
        return scoreConfigMapper.toResponseDto(savedEntity);
    }

    @Override
    public ScoreConfigurationResponseDto getScoreConfiguration() {
        log.info("Fetching active score configuration");
        ScoreConfigurationEntity entity = scoreConfigRepository.findByStatus(Status.ACTIVE)
                .orElseThrow(() -> new NotFoundException("No active score configuration found"));
        return scoreConfigMapper.toResponseDto(entity);
    }

    private boolean validatePercentageTotal(ScoreConfigurationRequestDto requestDto) {
        return getTotalPercentage(requestDto) == 100;
    }

    private int getTotalPercentage(ScoreConfigurationRequestDto requestDto) {
        return requestDto.getAttendancePercentage() +
                requestDto.getAssignmentPercentage() +
                requestDto.getMidtermPercentage() +
                requestDto.getFinalPercentage();
    }

    @EventListener(ContextRefreshedEvent.class)
    @Transactional
    public void initializeDefaultConfiguration() {
        if (scoreConfigRepository.countByStatus(Status.ACTIVE) == 0) {
            log.info("No active score configuration found. Initializing default configuration");
            ScoreConfigurationEntity defaultConfig = scoreConfigMapper.createDefaultConfiguration();
            scoreConfigRepository.save(defaultConfig);
            log.info("Default score configuration initialized successfully");
        }
    }
}