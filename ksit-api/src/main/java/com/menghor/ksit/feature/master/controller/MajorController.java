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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/majors")
@Slf4j
public class MajorController {
    private final MajorService majorService;

    @PostMapping
    public ApiResponse<MajorResponseDto> createMajor(@Valid @RequestBody MajorRequestDto majorRequestDto) {
        log.info("Create major request received");
        MajorResponseDto majorResponseDto = majorService.createMajor(majorRequestDto);
        log.info("Major created successfully. id={}", majorResponseDto.getId());
        return new ApiResponse<>("success", "Major created successfully", majorResponseDto);
    }

    @GetMapping("/{id}")
    public ApiResponse<MajorResponseDto> getMajorById(@PathVariable Long id) {
        log.info("Get major id={} request received", id);
        MajorResponseDto majorResponseDto = majorService.getMajorById(id);
        return new ApiResponse<>("success", "Major fetched successfully", majorResponseDto);
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<MajorResponseDto> updateMajorById(@PathVariable Long id, @Valid @RequestBody MajorUpdateDto majorRequestDto) {
        log.info("Update major id={} request received", id);
        MajorResponseDto majorResponseDto = majorService.updateMajorById(id, majorRequestDto);
        log.info("Major id={} updated successfully", id);
        return new ApiResponse<>("success", "Major updated successfully", majorResponseDto);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<MajorResponseDto> deleteMajorById(@PathVariable Long id) {
        log.info("Delete major id={} request received", id);
        MajorResponseDto majorResponseDto = majorService.deleteMajorById(id);
        log.info("Major id={} deleted successfully", id);
        return new ApiResponse<>("success", "Major deleted successfully", majorResponseDto);
    }

    @PostMapping("/list-all")
    public ApiResponse<List<MajorResponseDto>> getAllListMajors(@RequestBody MajorFilterDto filterDto) {
        log.info("Get all majors list request received");
        List<MajorResponseDto> majorResponseDto = majorService.getAllListMajors(filterDto);
        return new ApiResponse<>("success", "All majors fetched successfully", majorResponseDto);
    }

    @PostMapping("/my-list-all")
    public ApiResponse<List<MajorResponseDto>> getAllMyListMajors(@RequestBody MajorFilterDto filterDto) {
        log.info("Get my majors list request received");
        List<MajorResponseDto> majorResponseDto = majorService.getAllMyListMajors(filterDto);
        return new ApiResponse<>("success", "My majors fetched successfully", majorResponseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<MajorResponseDto>> getAllMajors(@RequestBody MajorFilterDto filterDto) {
        log.info("Get all majors paginated request received");
        CustomPaginationResponseDto<MajorResponseDto> majorResponseDto = majorService.getAllMajors(filterDto);
        return new ApiResponse<>("success", "All majors fetched successfully", majorResponseDto);
    }

    @PostMapping("/my-majors")
    public ApiResponse<CustomPaginationResponseDto<MajorResponseDto>> getMyMajors(@RequestBody MajorFilterDto filterDto) {
        log.info("Get my majors request received");
        CustomPaginationResponseDto<MajorResponseDto> majorResponseDto = majorService.getMyMajors(filterDto);
        return new ApiResponse<>("success", "User majors retrieved successfully", majorResponseDto);
    }
}