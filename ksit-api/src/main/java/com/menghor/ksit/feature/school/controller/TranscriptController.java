package com.menghor.ksit.feature.school.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.school.dto.response.TranscriptResponseDto;
import com.menghor.ksit.feature.school.service.TranscriptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transcript")
@RequiredArgsConstructor
public class TranscriptController {

    private final TranscriptService transcriptService;

    @GetMapping("/my-transcript")
    public ApiResponse<TranscriptResponseDto> getMyTranscript() {

        TranscriptResponseDto transcript = transcriptService.getMyCompleteTranscript();

        return new ApiResponse<>(
                "success",
                "Your complete transcript retrieved successfully",
                transcript
        );
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<TranscriptResponseDto> getStudentTranscript(@PathVariable Long studentId) {

        TranscriptResponseDto transcript = transcriptService.getStudentCompleteTranscript(studentId);

        return new ApiResponse<>(
                "success",
                "Student transcript retrieved successfully",
                transcript
        );
    }
}