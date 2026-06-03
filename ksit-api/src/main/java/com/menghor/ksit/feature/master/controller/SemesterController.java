package com.menghor.ksit.feature.master.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.master.dto.filter.SemesterFilterDto;
import com.menghor.ksit.feature.master.dto.request.SemesterRequestDto;
import com.menghor.ksit.feature.master.dto.response.SemesterResponseDto;
import com.menghor.ksit.feature.master.dto.update.SemesterUpdateDto;
import com.menghor.ksit.feature.master.service.SemesterService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/semesters")
public class SemesterController {
    private final SemesterService semesterService;

    @PostMapping
    public ApiResponse<SemesterResponseDto> create(@Valid @RequestBody SemesterRequestDto semesterRequestDto) {
        SemesterResponseDto semesterResponseDto = semesterService.createSemester(semesterRequestDto);
        return new ApiResponse<>(
                "success",
                "SemesterEnum created successfully...!",
                semesterResponseDto
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<SemesterResponseDto> getSemesterById(@PathVariable Long id) {
        SemesterResponseDto semesterResponseDto = semesterService.getSemesterById(id);
        return new ApiResponse<>(
                "success",
                "Get semester by id " + id + " successfully...!",
                semesterResponseDto
        );
    }

    @PostMapping("/updateSemesterById/{id}")
    public ApiResponse<SemesterResponseDto> updateSemesterById(@PathVariable Long id, @Valid @RequestBody SemesterUpdateDto semesterRequestDto) {
        SemesterResponseDto semesterResponseDto = semesterService.updateSemesterById(id, semesterRequestDto);
        return new ApiResponse<>(
                "success",
                "Update semester by id " + id + " successfully...!",
                semesterResponseDto
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<SemesterResponseDto> deleteSemesterById(@PathVariable Long id) {
        SemesterResponseDto semesterResponseDto = semesterService.deleteSemesterById(id);
        return new ApiResponse<>(
                "success",
                "Delete semester by id " + id + " successfully...!",
                semesterResponseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<SemesterResponseDto>> getAllSemesters(@RequestBody SemesterFilterDto semesterFilterDto) {
        CustomPaginationResponseDto<SemesterResponseDto> paginationResponseDto = semesterService.getAllSemesters(semesterFilterDto);
        return new ApiResponse<>(
                "success",
                "All semesters fetched successfully...!",
                paginationResponseDto
        );
    }
}