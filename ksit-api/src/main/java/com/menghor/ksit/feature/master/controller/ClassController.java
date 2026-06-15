package com.menghor.ksit.feature.master.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.master.dto.filter.ClassFilterDto;
import com.menghor.ksit.feature.master.dto.request.ClassRequestDto;
import com.menghor.ksit.feature.master.dto.response.ClassResponseDto;
import com.menghor.ksit.feature.master.dto.update.ClassUpdateDto;
import com.menghor.ksit.feature.master.service.ClassService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/classes")
@Slf4j
public class ClassController {
    private final ClassService classService;

    @PostMapping
    public ApiResponse<ClassResponseDto> create(@Valid @RequestBody ClassRequestDto classRequestDto) {
        log.info("Create class request received");
        ClassResponseDto classResponseDto = classService.createClass(classRequestDto);
        log.info("Class created successfully. id={}", classResponseDto.getId());
        return new ApiResponse<>("success", "Class created successfully", classResponseDto);
    }

    @GetMapping("/{id}")
    public ApiResponse<ClassResponseDto> getClassById(@PathVariable Long id) {
        log.info("Get class id={} request received", id);
        ClassResponseDto classResponseDto = classService.getClassById(id);
        return new ApiResponse<>("success", "Class fetched successfully", classResponseDto);
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<ClassResponseDto> updateById(@PathVariable Long id, @Valid @RequestBody ClassUpdateDto classUpdateDto) {
        log.info("Update class id={} request received", id);
        ClassResponseDto classResponseDto = classService.updateClassById(id, classUpdateDto);
        log.info("Class id={} updated successfully", id);
        return new ApiResponse<>("success", "Class updated successfully", classResponseDto);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<ClassResponseDto> deleteById(@PathVariable Long id) {
        log.info("Delete class id={} request received", id);
        ClassResponseDto classResponseDto = classService.deleteClassById(id);
        log.info("Class id={} deleted successfully", id);
        return new ApiResponse<>("success", "Class deleted successfully", classResponseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<ClassResponseDto>> getAllClasses(@RequestBody ClassFilterDto filterDto) {
        log.info("Get all classes request received");
        CustomPaginationResponseDto<ClassResponseDto> classResponseList = classService.getAllClasses(filterDto);
        return new ApiResponse<>("success", "All classes fetched successfully", classResponseList);
    }

    @PostMapping("/my-classes")
    public ApiResponse<CustomPaginationResponseDto<ClassResponseDto>> getMyClasses(@RequestBody ClassFilterDto filterDto) {
        log.info("Get my classes request received");
        CustomPaginationResponseDto<ClassResponseDto> classResponseList = classService.getMyClasses(filterDto);
        return new ApiResponse<>("success", "User classes retrieved successfully", classResponseList);
    }
}