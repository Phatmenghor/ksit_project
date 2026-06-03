package com.menghor.ksit.feature.master.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.master.dto.filter.SubjectFilterDto;
import com.menghor.ksit.feature.master.dto.request.SubjectRequestDto;
import com.menghor.ksit.feature.master.dto.response.SubjectResponseDto;
import com.menghor.ksit.feature.master.service.SubjectService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/subjects")
public class SubjectController {
    private final SubjectService subjectService;

    @PostMapping
    public ApiResponse<SubjectResponseDto> create(@Valid @RequestBody SubjectRequestDto subjectRequestDto) {
        SubjectResponseDto subjectResponseDto = subjectService.createSubject(subjectRequestDto);
        return new ApiResponse<>(
                "success",
                "Subject created successfully...!",
                subjectResponseDto
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<SubjectResponseDto> getSubjectById(@PathVariable Long id) {
        SubjectResponseDto subjectResponseDto = subjectService.getSubjectById(id);
        return new ApiResponse<>(
                "success",
                "Get subject by id "+ id + " successfully...!",
                subjectResponseDto
        );
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<SubjectResponseDto> updateById(@Valid @RequestBody SubjectRequestDto subjectRequestDto, @PathVariable Long id) {
        SubjectResponseDto subjectResponseDto = subjectService.updateSubjectById(subjectRequestDto, id);
        return new ApiResponse<>(
                "success",
                "Update subject by id " + id + " successfully...!",
                subjectResponseDto
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<SubjectResponseDto> deleteById(@PathVariable Long id) {
        SubjectResponseDto subjectResponseDto = subjectService.deleteSubjectById(id);
        return new ApiResponse<>(
                "success",
                "Delete subject by id " + id + " successfully...!"
                , subjectResponseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<SubjectResponseDto>> getAllSubjects(@RequestBody SubjectFilterDto filterDto) {
        CustomPaginationResponseDto<SubjectResponseDto> allSubjects = subjectService.getAllSubjects(filterDto);
        return new ApiResponse<>(
                "success",
                "All subjects fetched successfully...!"
                , allSubjects
        );
    }
}