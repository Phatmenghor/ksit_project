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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/classes")
public class ClassController {
    private final ClassService classService;

    @PostMapping
    public ApiResponse<ClassResponseDto> create(@Valid @RequestBody ClassRequestDto classRequestDto) {
        ClassResponseDto classResponseDto = classService.createClass(classRequestDto);
        return new ApiResponse<>(
                "success",
                "Classes created successfully...!",
                classResponseDto
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<ClassResponseDto> getClassById(@PathVariable Long id) {
        ClassResponseDto classResponseDto = classService.getClassById(id);
        return new ApiResponse<>(
                "success",
                "Get class by id "+ id + " successfully...!",
                classResponseDto
        );
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<ClassResponseDto> updateById(@PathVariable Long id, @Valid @RequestBody ClassUpdateDto classUpdateDto) {
        ClassResponseDto classResponseDto = classService.updateClassById(id, classUpdateDto);
        return new ApiResponse<>(
                "success",
                "Update class by id " + id + " successfully...!",
                classResponseDto
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<ClassResponseDto> deleteById(@PathVariable Long id) {
        ClassResponseDto classResponseDto = classService.deleteClassById(id);
        return new ApiResponse<>(
                "Success",
                "Delete class by id " + id + " successfully...!",
                classResponseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<ClassResponseDto>> getAllClasses(@RequestBody ClassFilterDto filterDto) {
        CustomPaginationResponseDto<ClassResponseDto> classResponseList = classService.getAllClasses(filterDto);
        return new ApiResponse<>(
                "success",
                "All classes fetched successfully...!",
                classResponseList
        );
    }

    @PostMapping("/my-classes")
    public ApiResponse<CustomPaginationResponseDto<ClassResponseDto>> getMyClasses(@RequestBody ClassFilterDto filterDto) {
        CustomPaginationResponseDto<ClassResponseDto> classResponseList = classService.getMyClasses(filterDto);
        return new ApiResponse<>(
                "success",
                "User classes retrieved successfully...!",
                classResponseList
        );
    }
}