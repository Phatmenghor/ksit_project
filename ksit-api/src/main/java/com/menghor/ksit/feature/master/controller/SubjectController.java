package com.menghor.ksit.feature.master.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.master.dto.filter.SubjectFilterDto;
import com.menghor.ksit.feature.master.dto.request.SubjectRequestDto;
import com.menghor.ksit.feature.master.dto.response.SubjectResponseDto;
import com.menghor.ksit.feature.master.service.SubjectService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/subjects")
@Slf4j
public class SubjectController {
    private final SubjectService subjectService;

    @PostMapping
    public ApiResponse<SubjectResponseDto> create(@Valid @RequestBody SubjectRequestDto subjectRequestDto) {
        log.info("Create subject request received");
        SubjectResponseDto subjectResponseDto = subjectService.createSubject(subjectRequestDto);
        log.info("Subject created successfully. id={}", subjectResponseDto.getId());
        return new ApiResponse<>("success", "Subject created successfully", subjectResponseDto);
    }

    @GetMapping("/{id}")
    public ApiResponse<SubjectResponseDto> getSubjectById(@PathVariable Long id) {
        log.info("Get subject id={} request received", id);
        SubjectResponseDto subjectResponseDto = subjectService.getSubjectById(id);
        return new ApiResponse<>("success", "Subject fetched successfully", subjectResponseDto);
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<SubjectResponseDto> updateById(@Valid @RequestBody SubjectRequestDto subjectRequestDto, @PathVariable Long id) {
        log.info("Update subject id={} request received", id);
        SubjectResponseDto subjectResponseDto = subjectService.updateSubjectById(subjectRequestDto, id);
        log.info("Subject id={} updated successfully", id);
        return new ApiResponse<>("success", "Subject updated successfully", subjectResponseDto);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<SubjectResponseDto> deleteById(@PathVariable Long id) {
        log.info("Delete subject id={} request received", id);
        SubjectResponseDto subjectResponseDto = subjectService.deleteSubjectById(id);
        log.info("Subject id={} deleted successfully", id);
        return new ApiResponse<>("success", "Subject deleted successfully", subjectResponseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<SubjectResponseDto>> getAllSubjects(@RequestBody SubjectFilterDto filterDto) {
        log.info("Get all subjects request received");
        CustomPaginationResponseDto<SubjectResponseDto> allSubjects = subjectService.getAllSubjects(filterDto);
        return new ApiResponse<>("success", "All subjects fetched successfully", allSubjects);
    }
}