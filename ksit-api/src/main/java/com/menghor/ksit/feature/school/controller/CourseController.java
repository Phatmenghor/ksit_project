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
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Courses", description = "Manage course enrollment and subject assignments")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/courses")
@Slf4j
public class CourseController {
    private final CourseService courseService;

    @PostMapping
    public ApiResponse<CourseResponseDto> createCourse(@Valid @RequestBody CourseRequestDto courseRequestDto) {
        log.info("Create course request received");
        CourseResponseDto courseResponseDto = courseService.createCourse(courseRequestDto);
        log.info("Course created successfully. id={}", courseResponseDto.getId());
        return new ApiResponse<>("success", "Course created successfully", courseResponseDto);
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponseDto> getCourseById(@PathVariable Long id) {
        log.info("Get course id={} request received", id);
        CourseResponseDto courseResponseDto = courseService.getCourseById(id);
        return new ApiResponse<>("success", "Course retrieved successfully", courseResponseDto);
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<CourseResponseDto> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseUpdateDto courseRequestDto) {
        log.info("Update course id={} request received", id);
        CourseResponseDto courseResponseDto = courseService.updateById(id, courseRequestDto);
        log.info("Course id={} updated successfully", id);
        return new ApiResponse<>("success", "Course updated successfully", courseResponseDto);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<CourseResponseDto> deleteCourse(@PathVariable Long id) {
        log.info("Delete course id={} request received", id);
        CourseResponseDto courseResponseDto = courseService.deleteById(id);
        log.info("Course id={} deleted successfully", id);
        return new ApiResponse<>("success", "Course deleted successfully", courseResponseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<CourseResponseDto>> getAllCourses(@RequestBody CourseFilterDto filterDto) {
        log.info("Get all courses request received");
        CustomPaginationResponseDto<CourseResponseDto> responseDto = courseService.getAllCourses(filterDto);
        return new ApiResponse<>("success", "Courses retrieved successfully", responseDto);
    }
}