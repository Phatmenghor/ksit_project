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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/semesters")
@Slf4j
public class SemesterController {
    private final SemesterService semesterService;

    @PostMapping
    public ApiResponse<SemesterResponseDto> create(@Valid @RequestBody SemesterRequestDto semesterRequestDto) {
        log.info("Create semester request received");
        SemesterResponseDto semesterResponseDto = semesterService.createSemester(semesterRequestDto);
        log.info("Semester created successfully. id={}", semesterResponseDto.getId());
        return new ApiResponse<>("success", "Semester created successfully", semesterResponseDto);
    }

    @GetMapping("/{id}")
    public ApiResponse<SemesterResponseDto> getSemesterById(@PathVariable Long id) {
        log.info("Get semester id={} request received", id);
        SemesterResponseDto semesterResponseDto = semesterService.getSemesterById(id);
        return new ApiResponse<>("success", "Semester fetched successfully", semesterResponseDto);
    }

    @PostMapping("/updateSemesterById/{id}")
    public ApiResponse<SemesterResponseDto> updateSemesterById(@PathVariable Long id, @Valid @RequestBody SemesterUpdateDto semesterRequestDto) {
        log.info("Update semester id={} request received", id);
        SemesterResponseDto semesterResponseDto = semesterService.updateSemesterById(id, semesterRequestDto);
        log.info("Semester id={} updated successfully", id);
        return new ApiResponse<>("success", "Semester updated successfully", semesterResponseDto);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<SemesterResponseDto> deleteSemesterById(@PathVariable Long id) {
        log.info("Delete semester id={} request received", id);
        SemesterResponseDto semesterResponseDto = semesterService.deleteSemesterById(id);
        log.info("Semester id={} deleted successfully", id);
        return new ApiResponse<>("success", "Semester deleted successfully", semesterResponseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<SemesterResponseDto>> getAllSemesters(@RequestBody SemesterFilterDto semesterFilterDto) {
        log.info("Get all semesters request received");
        CustomPaginationResponseDto<SemesterResponseDto> paginationResponseDto = semesterService.getAllSemesters(semesterFilterDto);
        return new ApiResponse<>("success", "All semesters fetched successfully", paginationResponseDto);
    }
}