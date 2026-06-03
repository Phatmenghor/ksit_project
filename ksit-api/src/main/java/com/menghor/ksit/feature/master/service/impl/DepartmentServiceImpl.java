package com.menghor.ksit.feature.master.service.impl;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.exceptoins.error.DuplicateNameException;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.master.dto.filter.DepartmentFilter;
import com.menghor.ksit.feature.master.dto.request.DepartmentRequestDto;
import com.menghor.ksit.feature.master.dto.response.DepartmentResponseDto;
import com.menghor.ksit.feature.master.dto.update.DepartmentUpdateDto;
import com.menghor.ksit.feature.master.mapper.DepartmentMapper;
import com.menghor.ksit.feature.master.model.DepartmentEntity;
import com.menghor.ksit.feature.master.repository.DepartmentRepository;
import com.menghor.ksit.feature.master.service.DepartmentService;
import com.menghor.ksit.feature.master.specification.DepartmentSpecification;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import com.menghor.ksit.utils.database.SecurityUtils;
import com.menghor.ksit.utils.pagiantion.PaginationUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public DepartmentResponseDto createDepartment(DepartmentRequestDto departmentRequestDto) {

        // Determine the status (default to ACTIVE if not specified)
        Status status = departmentRequestDto.getStatus() != null ?
                departmentRequestDto.getStatus() : Status.ACTIVE;

        // Only check for duplicates if this department will be ACTIVE
        if (status == Status.ACTIVE) {
            // Check if an ACTIVE department with the same code already exists
            boolean activeDeptWithSameCodeExists = departmentRepository.existsByCodeAndStatus(
                    departmentRequestDto.getCode(), Status.ACTIVE);

            if (activeDeptWithSameCodeExists) {
                throw new DuplicateNameException("Department with code '" +
                        departmentRequestDto.getCode() + "' already exists");
            }

            // Check if an ACTIVE department with the same name already exists
            boolean activeDeptWithSameNameExists = departmentRepository.existsByNameAndStatus(
                    departmentRequestDto.getName(), Status.ACTIVE);

            if (activeDeptWithSameNameExists) {
                throw new DuplicateNameException("Department with name '" +
                        departmentRequestDto.getName() + "' already exists");
            }
        }

        // Proceed with department creation
        DepartmentEntity department = departmentMapper.toEntity(departmentRequestDto);

        // Ensure status is set if it wasn't specified
        if (department.getStatus() == null) {
            department.setStatus(Status.ACTIVE);
        }

        DepartmentEntity savedDepartment = departmentRepository.save(department);

        return departmentMapper.toResponseDto(savedDepartment);
    }

    @Override
    public DepartmentResponseDto getDepartmentById(Long id) {

        DepartmentEntity department = findDepartmentById(id);

        return departmentMapper.toResponseDto(department);
    }

    @Override
    @Transactional
    public DepartmentResponseDto updateDepartmentById(DepartmentUpdateDto departmentRequestDto, Long id) {

        // Find the existing entity
        DepartmentEntity existingDepartment = findDepartmentById(id);

        // Determine what the status will be after the update
        Status newStatus = departmentRequestDto.getStatus() != null ?
                departmentRequestDto.getStatus() : existingDepartment.getStatus();

        // If updating to ACTIVE status, check for duplicates
        if (newStatus == Status.ACTIVE) {
            // Check for code conflict only if code is being changed
            if (departmentRequestDto.getCode() != null &&
                    !departmentRequestDto.getCode().equals(existingDepartment.getCode())) {

                boolean activeDeptWithSameCodeExists = departmentRepository.existsByCodeAndStatusAndIdNot(
                        departmentRequestDto.getCode(), Status.ACTIVE, id);

                if (activeDeptWithSameCodeExists) {
                    throw new DuplicateNameException("Department with code '" +
                            departmentRequestDto.getCode() + "' already exists");
                }
            }

            // Check for name conflict only if name is being changed
            if (departmentRequestDto.getName() != null &&
                    !departmentRequestDto.getName().equals(existingDepartment.getName())) {

                boolean activeDeptWithSameNameExists = departmentRepository.existsByNameAndStatusAndIdNot(
                        departmentRequestDto.getName(), Status.ACTIVE, id);

                if (activeDeptWithSameNameExists) {
                    throw new DuplicateNameException("Department with name '" +
                            departmentRequestDto.getName() + "' already exists");
                }
            }

            // If status changing from non-ACTIVE to ACTIVE, check if another ACTIVE dept with same code/name exists
            if (existingDepartment.getStatus() != Status.ACTIVE) {
                // Check for active department with same code
                boolean activeDeptWithSameCodeExists = departmentRepository.existsByCodeAndStatusAndIdNot(
                        existingDepartment.getCode(), Status.ACTIVE, id);

                if (activeDeptWithSameCodeExists) {
                    throw new DuplicateNameException("Department with code '" +
                            existingDepartment.getCode() + "' already exists");
                }

                // Check for active department with same name
                boolean activeDeptWithSameNameExists = departmentRepository.existsByNameAndStatusAndIdNot(
                        existingDepartment.getName(), Status.ACTIVE, id);

                if (activeDeptWithSameNameExists) {
                    throw new DuplicateNameException("Department with name '" +
                            existingDepartment.getName() + "' already exists");
                }
            }
        }

        // Use MapStruct to update only non-null fields
        departmentMapper.updateEntityFromDto(departmentRequestDto, existingDepartment);

        // Save the updated entity
        DepartmentEntity updatedDepartment = departmentRepository.save(existingDepartment);

        return departmentMapper.toResponseDto(updatedDepartment);
    }

    @Override
    @Transactional
    public DepartmentResponseDto deleteDepartmentById(Long id) {

        DepartmentEntity department = findDepartmentById(id);
        department.setStatus(Status.DELETED);

        department = departmentRepository.save(department);

        return departmentMapper.toResponseDto(department);
    }

    @Override
    public CustomPaginationResponseDto<DepartmentResponseDto> getAllDepartments(DepartmentFilter filterDto) {

        // Validate and prepare pagination using PaginationUtils
        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        // Create specification from filter criteria
        Specification<DepartmentEntity> spec = DepartmentSpecification.combine(
                filterDto.getSearch(),
                filterDto.getStatus()
        );

        // Execute query with specification and pagination
        Page<DepartmentEntity> departmentPage = departmentRepository.findAll(spec, pageable);

        // Apply status correction for any null statuses
        departmentPage.getContent().forEach(dept -> {
            if (dept.getStatus() == null) {
                dept.setStatus(Status.ACTIVE);
                departmentRepository.save(dept);
            }
        });

        // Map to response DTO
        CustomPaginationResponseDto<DepartmentResponseDto> response = departmentMapper.toDepartmentAllResponseDto(departmentPage);

        return response;
    }

    @Override
    public CustomPaginationResponseDto<DepartmentResponseDto> getMyDepartments(DepartmentFilter filterDto) {

        UserEntity currentUser = securityUtils.getCurrentUser();

        // Validate and prepare pagination using PaginationUtils
        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        // Use the enhanced specification with role-based filtering
        Specification<DepartmentEntity> spec = DepartmentSpecification.combineWithUserRole(
                filterDto.getSearch(),
                filterDto.getStatus(),
                currentUser
        );

        // Execute query with specification and pagination
        Page<DepartmentEntity> departmentPage = departmentRepository.findAll(spec, pageable);

        // Map to response DTO
        CustomPaginationResponseDto<DepartmentResponseDto> response = departmentMapper.toDepartmentAllResponseDto(departmentPage);

        return response;
    }

    // ===== Private Helper Methods =====

    /**
     * Helper method to find a department by ID or throw NotFoundException
     */
    private DepartmentEntity findDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Department not found with ID: {}", id);
                    return new NotFoundException("Department id " + id + " not found. Please try again.");
                });
    }
}