package com.menghor.ksit.feature.master.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.master.dto.filter.MajorFilterDto;
import com.menghor.ksit.feature.master.dto.request.MajorRequestDto;
import com.menghor.ksit.feature.master.dto.response.MajorResponseDto;
import com.menghor.ksit.feature.master.dto.update.MajorUpdateDto;
import com.menghor.ksit.feature.master.service.MajorService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/majors")
public class MajorController {
    private final MajorService majorService;

    @PostMapping
    public ApiResponse<MajorResponseDto> createMajor(@Valid @RequestBody MajorRequestDto majorRequestDto) {
        MajorResponseDto majorResponseDto = majorService.createMajor(majorRequestDto);
        return new ApiResponse<>(
                "success",
                "Major created successfully...!",
                majorResponseDto
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<MajorResponseDto> getMajorById(@PathVariable Long id) {
        MajorResponseDto majorResponseDto = majorService.getMajorById(id);
        return new ApiResponse<>(
                "success",
                "Get major by id "+ id + " successfully...!",
                majorResponseDto
        );
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<MajorResponseDto> updateMajorById(@PathVariable Long id, @Valid @RequestBody MajorUpdateDto majorRequestDto) {
        MajorResponseDto majorResponseDto = majorService.updateMajorById(id, majorRequestDto);
        return new ApiResponse<>(
                "success",
                "Update major by id " + id + " successfully...!",
                majorResponseDto
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<MajorResponseDto> deleteMajorById(@PathVariable Long id) {
        MajorResponseDto majorResponseDto = majorService.deleteMajorById(id);
        return new ApiResponse<>(
                "success",
                "Delete major by id " + id + " successfully...!",
                majorResponseDto
        );
    }

    @PostMapping("/list-all")
    public ApiResponse<List<MajorResponseDto>> getAllListMajors(@RequestBody MajorFilterDto filterDto) {
        List<MajorResponseDto> majorResponseDto = majorService.getAllListMajors(filterDto);
        return new ApiResponse<>(
                "success",
                "All majors fetched successfully...!",
                majorResponseDto
        );
    }

    @PostMapping("/my-list-all")
    public ApiResponse<List<MajorResponseDto>> getAllMyListMajors(@RequestBody MajorFilterDto filterDto) {
        List<MajorResponseDto> majorResponseDto = majorService.getAllMyListMajors(filterDto);
        return new ApiResponse<>(
                "success",
                "All majors fetched successfully...!",
                majorResponseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<MajorResponseDto>> getAllMajors(@RequestBody MajorFilterDto filterDto) {
        CustomPaginationResponseDto<MajorResponseDto> majorResponseDto = majorService.getAllMajors(filterDto);
        return new ApiResponse<>(
                "success",
                "All majors fetched successfully...!",
                majorResponseDto
        );
    }

    @PostMapping("/my-majors")
    public ApiResponse<CustomPaginationResponseDto<MajorResponseDto>> getMyMajors(@RequestBody MajorFilterDto filterDto) {
        CustomPaginationResponseDto<MajorResponseDto> majorResponseDto = majorService.getMyMajors(filterDto);
        return new ApiResponse<>(
                "success",
                "User majors retrieved successfully...!",
                majorResponseDto
        );
    }
}