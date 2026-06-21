package com.menghor.ksit.feature.score.service;

import com.menghor.ksit.feature.score.dto.response.StudentScoreResponseDto;
import com.menghor.ksit.feature.score.dto.update.StudentScoreUpdateDto;

import java.util.List;

public interface StudentScoreService {
    StudentScoreResponseDto getStudentScoreById(Long id);
    StudentScoreResponseDto     updateStudentScore(StudentScoreUpdateDto updateDto);
    void recalculateAttendanceScores(Long scheduleId);
    StudentScoreResponseDto recalculateAttendanceScoreForStudent(Long scheduleId, Long studentId);
}