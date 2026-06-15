package com.menghor.ksit.feature.score.service;

import com.menghor.ksit.feature.score.dto.response.AttendanceScoreDto;

import java.util.List;

public interface AttendanceScoreService {
    List<AttendanceScoreDto> calculateForClass(Long classId, Long scheduleId);
}