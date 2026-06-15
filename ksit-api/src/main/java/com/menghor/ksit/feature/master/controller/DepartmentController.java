package com.menghor.ksit.feature.master.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.master.dto.filter.DepartmentFilter;
import com.menghor.ksit.feature.master.dto.request.DepartmentRequestDto;
import com.menghor.ksit.feature.master.dto.response.DepartmentResponseDto;
import com.menghor.ksit.feature.master.dto.update.DepartmentUpdateDto;
import com.menghor.ksit.feature.master.service.DepartmentService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/departments")
@Slf4j
public class DepartmentController {
    private final DepartmentService departmentService;

    @PostMapping
    public ApiResponse<DepartmentResponseDto> create(@Valid @RequestBody DepartmentRequestDto departmentRequestDto) {
        log.info("Create department request received");
        DepartmentResponseDto department = departmentService.createDepartment(departmentRequestDto);
        log.info("Department created successfully. id={}", department.getId());
        return new ApiResponse<>("success", "Department created successfully", department);
    }

    @GetMapping("/{id}")
    public ApiResponse<DepartmentResponseDto> getDepartmentById(@PathVariable Long id) {
        log.info("Get department id={} request received", id);
        DepartmentResponseDto department = departmentService.getDepartmentById(id);
        return new ApiResponse<>("success", "Department fetched successfully", department);
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<DepartmentResponseDto> updateById(@Valid @RequestBody DepartmentUpdateDto departmentRequestDto, @PathVariable Long id) {
        log.info("Update department id={} request received", id);
        DepartmentResponseDto department = departmentService.updateDepartmentById(departmentRequestDto, id);
        log.info("Department id={} updated successfully", id);
        return new ApiResponse<>("success", "Department updated successfully", department);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<DepartmentResponseDto> deleteById(@PathVariable Long id) {
        log.info("Delete department id={} request received", id);
        DepartmentResponseDto department = departmentService.deleteDepartmentById(id);
        log.info("Department id={} deleted successfully", id);
        return new ApiResponse<>("success", "Department deleted successfully", department);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<DepartmentResponseDto>> getAllDepartments(@RequestBody DepartmentFilter filterDto) {
        log.info("Get all departments request received");
        CustomPaginationResponseDto<DepartmentResponseDto> department = departmentService.getAllDepartments(filterDto);
        return new ApiResponse<>("success", "All departments fetched successfully", department);
    }

    @PostMapping("/my-departments")
    public ApiResponse<CustomPaginationResponseDto<DepartmentResponseDto>> getMyDepartments(@RequestBody DepartmentFilter filterDto) {
        log.info("Get my departments request received");
        CustomPaginationResponseDto<DepartmentResponseDto> department = departmentService.getMyDepartments(filterDto);
        return new ApiResponse<>("success", "User departments retrieved successfully", department);
    }
}