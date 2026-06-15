package com.menghor.ksit.feature.school.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.school.dto.response.TranscriptResponseDto;
import com.menghor.ksit.feature.school.service.TranscriptService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Transcripts", description = "Generate and view student academic transcripts")
@RestController
@RequestMapping("/api/v1/transcript")
@RequiredArgsConstructor
@Slf4j
public class TranscriptController {

    private final TranscriptService transcriptService;

    @GetMapping("/my-transcript")
    public ApiResponse<TranscriptResponseDto> getMyTranscript() {
        log.info("Get my transcript request received");
        TranscriptResponseDto transcript = transcriptService.getMyCompleteTranscript();
        return new ApiResponse<>("success", "Your complete transcript retrieved successfully", transcript);
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<TranscriptResponseDto> getStudentTranscript(@PathVariable Long studentId) {
        log.info("Get transcript for studentId={} request received", studentId);
        TranscriptResponseDto transcript = transcriptService.getStudentCompleteTranscript(studentId);
        return new ApiResponse<>("success", "Student transcript retrieved successfully", transcript);
    }
}