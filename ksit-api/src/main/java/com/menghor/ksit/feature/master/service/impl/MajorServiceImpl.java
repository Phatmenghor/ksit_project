package com.menghor.ksit.feature.master.service.impl;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.exceptoins.error.DuplicateNameException;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.master.dto.filter.MajorFilterDto;
import com.menghor.ksit.feature.master.dto.request.MajorRequestDto;
import com.menghor.ksit.feature.master.dto.response.MajorResponseDto;
import com.menghor.ksit.feature.master.dto.update.MajorUpdateDto;
import com.menghor.ksit.feature.master.mapper.MajorMapper;
import com.menghor.ksit.feature.master.model.DepartmentEntity;
import com.menghor.ksit.feature.master.model.MajorEntity;
import com.menghor.ksit.feature.master.repository.DepartmentRepository;
import com.menghor.ksit.feature.master.repository.MajorRepository;
import com.menghor.ksit.feature.master.service.MajorService;
import com.menghor.ksit.feature.master.specification.MajorSpecification;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MajorServiceImpl implements MajorService {
    private final MajorRepository majorRepository;
    private final DepartmentRepository departmentRepository;
    private final MajorMapper majorMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public MajorResponseDto createMajor(MajorRequestDto majorRequestDto) {

        // Determine the status (default to ACTIVE if not specified)
        Status status = majorRequestDto.getStatus() != null ?
                majorRequestDto.getStatus() : Status.ACTIVE;

        // Only check for duplicates if this major will be ACTIVE
        if (status == Status.ACTIVE) {
            // Check if an ACTIVE major with the same code already exists
            boolean activeMajorExists = majorRepository.existsByCodeAndStatus(
                    majorRequestDto.getCode(), Status.ACTIVE);

            if (activeMajorExists) {
                throw new DuplicateNameException("Major with code '" +
                        majorRequestDto.getCode() + "' already exists");
            }
        }

        // Proceed with major creation
        MajorEntity majorEntity = majorMapper.toEntity(majorRequestDto);

        // Ensure status is set if it wasn't specified
        if (majorEntity.getStatus() == null) {
            majorEntity.setStatus(Status.ACTIVE);
        }

        // Find and set the department
        if (majorRequestDto.getDepartmentId() != null) {
            DepartmentEntity department = findDepartmentById(majorRequestDto.getDepartmentId());
            majorEntity.setDepartment(department);
        }

        MajorEntity savedMajor = majorRepository.save(majorEntity);

        return majorMapper.toResponseDto(savedMajor);
    }

    @Override
    public MajorResponseDto getMajorById(Long id) {

        MajorEntity majorEntity = findMajorById(id);

        return majorMapper.toResponseDto(majorEntity);
    }

    @Override
    @Transactional
    public MajorResponseDto updateMajorById(Long id, MajorUpdateDto majorUpdateDto) {

        // Find the existing entity
        MajorEntity existingMajor = findMajorById(id);

        // Determine what the status will be after the update
        Status newStatus = majorUpdateDto.getStatus() != null ?
                majorUpdateDto.getStatus() : existingMajor.getStatus();

        // If the new status will be ACTIVE and code is changing, check for duplicates
        if (newStatus == Status.ACTIVE &&
                majorUpdateDto.getCode() != null &&
                !majorUpdateDto.getCode().equals(existingMajor.getCode())) {

            boolean activeMajorExists = majorRepository.existsByCodeAndStatus(
                    majorUpdateDto.getCode(), Status.ACTIVE);

            if (activeMajorExists) {
                throw new DuplicateNameException("Major with code '" +
                        majorUpdateDto.getCode() + "' already exists");
            }
        }

        // If the status is changing to ACTIVE (from non-ACTIVE) and the code isn't changing,
        // we still need to check if another ACTIVE major with the same code exists
        if (newStatus == Status.ACTIVE &&
                existingMajor.getStatus() != Status.ACTIVE) {

            boolean activeMajorWithSameCodeExists = majorRepository.existsByCodeAndStatusAndIdNot(
                    existingMajor.getCode(), Status.ACTIVE, id);

            if (activeMajorWithSameCodeExists) {
                throw new DuplicateNameException("Major with code '" +
                        existingMajor.getCode() + "' already exists");
            }
        }

        // Use MapStruct to update only non-null fields
        majorMapper.updateEntityFromDto(majorUpdateDto, existingMajor);

        // Handle department relationship separately if provided
        if (majorUpdateDto.getDepartmentId() != null) {
            DepartmentEntity department = findDepartmentById(majorUpdateDto.getDepartmentId());
            existingMajor.setDepartment(department);
        }

        // Save the updated entity
        MajorEntity updatedMajor = majorRepository.save(existingMajor);

        return majorMapper.toResponseDto(updatedMajor);
    }

    @Override
    @Transactional
    public MajorResponseDto deleteMajorById(Long id) {

        MajorEntity majorEntity = findMajorById(id);
        majorEntity.setStatus(Status.DELETED);

        majorEntity = majorRepository.save(majorEntity);

        return majorMapper.toResponseDto(majorEntity);
    }

    @Override
    public CustomPaginationResponseDto<MajorResponseDto> getAllMajors(MajorFilterDto filterDto) {

        // Validate and prepare pagination using PaginationUtils
        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        // Create specification from filter criteria
        Specification<MajorEntity> spec = MajorSpecification.combine(
                filterDto.getSearch(),
                filterDto.getStatus(),
                filterDto.getDepartmentId()
        );

        // Execute query with specification and pagination
        Page<MajorEntity> majorPage = majorRepository.findAll(spec, pageable);

        // Apply status correction for any null statuses
        majorPage.getContent().forEach(major -> {
            if (major.getStatus() == null) {
                major.setStatus(Status.ACTIVE);
                majorRepository.save(major);
            }
        });

        // Map to response DTO
        CustomPaginationResponseDto<MajorResponseDto> response = majorMapper.toMajorAllResponseDto(majorPage);

        return response;
    }

    @Override
    public CustomPaginationResponseDto<MajorResponseDto> getMyMajors(MajorFilterDto filterDto) {

        UserEntity currentUser = securityUtils.getCurrentUser();

        // Validate and prepare pagination using PaginationUtils
        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        // Use the enhanced specification with role-based filtering
        Specification<MajorEntity> spec = MajorSpecification.combineWithUserRole(
                filterDto.getSearch(),
                filterDto.getStatus(),
                filterDto.getDepartmentId(),
                currentUser
        );

        // Execute query with specification and pagination
        Page<MajorEntity> majorPage = majorRepository.findAll(spec, pageable);

        // Map to response DTO
        CustomPaginationResponseDto<MajorResponseDto> response = majorMapper.toMajorAllResponseDto(majorPage);

        return response;
    }

    @Override
    public List<MajorResponseDto> getAllListMajors(MajorFilterDto filterDto) {

        // Use the enhanced specification with role-based filtering
        Specification<MajorEntity> spec = MajorSpecification.combineWithUserRole(
                filterDto.getSearch(),
                filterDto.getStatus(),
                filterDto.getDepartmentId(),
                null
        );
        List<MajorEntity> majorPage = majorRepository.findAll(spec);
        return majorMapper.toResponseDtoList(majorPage);
    }

    @Override
    public List<MajorResponseDto> getAllMyListMajors(MajorFilterDto filterDto) {

        UserEntity currentUser = securityUtils.getCurrentUser();

        // Use the enhanced specification with role-based filtering
        Specification<MajorEntity> spec = MajorSpecification.combineWithUserRole(
                filterDto.getSearch(),
                filterDto.getStatus(),
                filterDto.getDepartmentId(),
                currentUser
        );
        List<MajorEntity> majorPage = majorRepository.findAll(spec);
        return majorMapper.toResponseDtoList(majorPage);
    }

    // ===== Private Helper Methods =====

    /**
     * Helper method to find a major by ID or throw NotFoundException
     */
    private MajorEntity findMajorById(Long id) {
        return majorRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Major not found with ID: {}", id);
                    return new NotFoundException("Major id " + id + " not found. Please try again.");
                });
    }

    /**
     * Helper method to find a department by ID or throw NotFoundException
     */
    private DepartmentEntity findDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Department not found with ID: {}", id);
                    return new NotFoundException("Department id " + id + " not found");
                });
    }
}