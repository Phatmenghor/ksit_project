package com.menghor.ksit.feature.score.service;

import com.menghor.ksit.enumations.SubmissionStatus;
import com.menghor.ksit.feature.score.dto.filter.ScoreSessionFilterDto;
import com.menghor.ksit.feature.score.dto.request.BatchUpdateScoresRequestDto;
import com.menghor.ksit.feature.score.dto.request.CalculateAttendanceScoresRequestDto;
import com.menghor.ksit.feature.score.dto.request.ScoreSessionRequestDto;
import com.menghor.ksit.feature.score.dto.response.ScoreSessionResponseDto;
import com.menghor.ksit.feature.score.dto.response.ScoreSessionSummaryDto;
import com.menghor.ksit.feature.score.dto.update.ScoreSessionUpdateDto;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;

public interface ScoreSessionService {
    ScoreSessionResponseDto initializeScoreSession(ScoreSessionRequestDto requestDto);
    ScoreSessionResponseDto getScoreSessionById(Long id);
    ScoreSessionResponseDto updateScoreSession(ScoreSessionUpdateDto updateDto);
    CustomPaginationResponseDto<ScoreSessionSummaryDto> getAllScoreSessions(ScoreSessionFilterDto filterDto);
}