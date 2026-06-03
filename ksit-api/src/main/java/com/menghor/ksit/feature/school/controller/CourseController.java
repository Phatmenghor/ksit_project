package com.menghor.ksit.feature.school.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.school.dto.filter.CourseFilterDto;
import com.menghor.ksit.feature.school.dto.request.CourseRequestDto;
import com.menghor.ksit.feature.school.dto.response.CourseResponseDto;
import com.menghor.ksit.feature.school.dto.update.CourseUpdateDto;
import com.menghor.ksit.feature.school.service.CourseService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/courses")
public class CourseController {
    private final CourseService courseService;

    @PostMapping
    public ApiResponse<CourseResponseDto> createCourse(@Valid @RequestBody CourseRequestDto courseRequestDto) {
        CourseResponseDto courseResponseDto = courseService.createCourse(courseRequestDto);
        return new ApiResponse<>(
                "success",
                "Course created successfully",
                courseResponseDto
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponseDto> getCourseById(@PathVariable Long id) {
        CourseResponseDto courseResponseDto = courseService.getCourseById(id);
        return new ApiResponse<>(
                "success",
                "Course retrieved successfully",
                courseResponseDto
        );
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<CourseResponseDto> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseUpdateDto courseRequestDto) {
        CourseResponseDto courseResponseDto = courseService.updateById(id, courseRequestDto);
        return new ApiResponse<>(
                "success",
                "Course updated successfully",
                courseResponseDto
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<CourseResponseDto> deleteCourse(@PathVariable Long id) {
        CourseResponseDto courseResponseDto = courseService.deleteById(id);
        return new ApiResponse<>(
                "success",
                "Course deleted successfully",
                courseResponseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<CourseResponseDto>> getAllCourses(@RequestBody CourseFilterDto filterDto) {
        CustomPaginationResponseDto<CourseResponseDto> responseDto = courseService.getAllCourses(filterDto);
        return new ApiResponse<>(
                "success",
                "Courses retrieved successfully",
                responseDto
        );
    }
}