package com.menghor.ksit.feature.score.service;

import com.menghor.ksit.feature.score.dto.response.TranscriptResponseDto;

public interface TranscriptService {
    TranscriptResponseDto getMyCompleteTranscript();

    TranscriptResponseDto getStudentCompleteTranscript(Long studentId);
}