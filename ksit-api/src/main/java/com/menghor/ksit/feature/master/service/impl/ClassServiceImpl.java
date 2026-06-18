package com.menghor.ksit.feature.master.service.impl;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.exceptoins.error.DuplicateNameException;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.master.dto.filter.ClassFilterDto;
import com.menghor.ksit.feature.master.dto.request.ClassRequestDto;
import com.menghor.ksit.feature.master.dto.response.ClassResponseDto;
import com.menghor.ksit.feature.master.dto.update.ClassUpdateDto;
import com.menghor.ksit.feature.master.mapper.ClassMapper;
import com.menghor.ksit.feature.master.model.ClassEntity;
import com.menghor.ksit.feature.master.model.MajorEntity;
import com.menghor.ksit.feature.master.repository.ClassRepository;
import com.menghor.ksit.feature.master.repository.MajorRepository;
import com.menghor.ksit.feature.master.service.ClassService;
import com.menghor.ksit.feature.master.specification.ClassSpecification;
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
public class ClassServiceImpl implements ClassService {
    private final ClassRepository classRepository;
    private final MajorRepository majorRepository;
    private final ClassMapper classMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public ClassResponseDto createClass(ClassRequestDto classRequestDto) {
        log.info("Creating class with code={}, majorId={}", classRequestDto.getCode(), classRequestDto.getMajorId());

        // Determine the status (default to ACTIVE if not specified)
        Status status = classRequestDto.getStatus() != null ?
                classRequestDto.getStatus() : Status.ACTIVE;

        // Only check for duplicates if this class will be ACTIVE
        if (status == Status.ACTIVE) {
            // Check if an ACTIVE class with the same code already exists
            boolean activeClassExists = classRepository.existsByCodeAndStatus(
                    classRequestDto.getCode(), Status.ACTIVE);

            if (activeClassExists) {
                log.warn("Duplicate class code={} already exists", classRequestDto.getCode());
                throw new DuplicateNameException("Class with code '" +
                        classRequestDto.getCode() + "' already exists");
            }
        }

        // Proceed with class creation
        ClassEntity classEntity = classMapper.toEntity(classRequestDto);
        MajorEntity major = findMajorById(classRequestDto.getMajorId());
        classEntity.setMajor(major);

        ClassEntity savedClass = classRepository.save(classEntity);
        log.info("Class created successfully. id={}, code={}", savedClass.getId(), savedClass.getCode());
        return classMapper.toResponseDto(savedClass);
    }

    @Override
    public ClassResponseDto getClassById(Long id) {
        log.info("Fetching class id={}", id);
        ClassEntity classEntity = findClassById(id);
        return classMapper.toResponseDto(classEntity);
    }

    @Override
    @Transactional
    public ClassResponseDto updateClassById(Long id, ClassUpdateDto classUpdateDto) {
        log.info("Updating class id={}", id);

        // Find the existing entity
        ClassEntity existingClass = findClassById(id);

        // Determine what the status will be after the update
        Status newStatus = classUpdateDto.getStatus() != null ?
                classUpdateDto.getStatus() : existingClass.getStatus();

        // If the new status will be ACTIVE and code is changing, check for duplicates
        if (newStatus == Status.ACTIVE &&
                classUpdateDto.getCode() != null &&
                !classUpdateDto.getCode().equals(existingClass.getCode())) {

            boolean activeClassExists = classRepository.existsByCodeAndStatus(
                    classUpdateDto.getCode(), Status.ACTIVE);

            if (activeClassExists) {
                log.warn("Duplicate class code={} on update for id={}", classUpdateDto.getCode(), id);
                throw new DuplicateNameException("Another ACTIVE class with code '" +
                        classUpdateDto.getCode() + "' already exists");
            }
        }

        // If the status is changing to ACTIVE (from non-ACTIVE) and the code isn't changing,
        // we still need to check if another ACTIVE class with the same code exists
        if (newStatus == Status.ACTIVE &&
                existingClass.getStatus() != Status.ACTIVE) {

            boolean activeClassWithSameCodeExists = classRepository.existsByCodeAndStatusAndIdNot(
                    existingClass.getCode(), Status.ACTIVE, id);

            if (activeClassWithSameCodeExists) {
                log.warn("Duplicate class code={} when reactivating id={}", existingClass.getCode(), id);
                throw new DuplicateNameException("Class with code '" +
                        existingClass.getCode() + "' already exists");
            }
        }

        // Proceed with update
        classMapper.updateEntityFromDto(classUpdateDto, existingClass);

        // Handle major relationship separately if provided
        if (classUpdateDto.getMajorId() != null) {
            MajorEntity major = findMajorById(classUpdateDto.getMajorId());
            existingClass.setMajor(major);
        }

        // Save the updated entity
        ClassEntity updatedClass = classRepository.save(existingClass);
        log.info("Class id={} updated successfully", updatedClass.getId());
        return classMapper.toResponseDto(updatedClass);
    }

    @Override
    @Transactional
    public ClassResponseDto deleteClassById(Long id) {
        log.info("Deleting class id={}", id);
        ClassEntity classEntity = findClassById(id);

        // Set status to DELETED (soft delete)
        classEntity.setStatus(Status.DELETED);

        classEntity = classRepository.save(classEntity);
        log.info("Class id={} deleted successfully", id);
        return classMapper.toResponseDto(classEntity);
    }

    @Override
    public CustomPaginationResponseDto<ClassResponseDto> getAllClasses(ClassFilterDto filterDto) {
        log.info("getAllClasses | filter: search='{}', academyYear={}, status={}, majorId={}, page={}, size={}",
                filterDto.getSearch(), filterDto.getAcademyYear(), filterDto.getStatus(),
                filterDto.getMajorId(), filterDto.getPageNo(), filterDto.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        Specification<ClassEntity> spec = ClassSpecification.combine(
                filterDto.getSearch(),
                filterDto.getAcademyYear(),
                filterDto.getStatus(),
                filterDto.getMajorId()
        );

        Page<ClassEntity> classPage = classRepository.findAll(spec, pageable);
        log.info("getAllClasses | result: totalElements={}, totalPages={}, currentPage={}",
                classPage.getTotalElements(), classPage.getTotalPages(), classPage.getNumber() + 1);

        CustomPaginationResponseDto<ClassResponseDto> response = classMapper.toClassAllResponseDto(classPage);
        return response;
    }

    @Override
    public CustomPaginationResponseDto<ClassResponseDto> getMyClasses(ClassFilterDto filterDto) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        log.info("getMyClasses | user='{}', roles={} | filter: search='{}', academyYear={}, status={}, majorId={}, page={}, size={}",
                currentUser != null ? currentUser.getUsername() : "null",
                currentUser != null ? currentUser.getRoles().stream().map(r -> r.getName().name()).toList() : "[]",
                filterDto.getSearch(), filterDto.getAcademyYear(), filterDto.getStatus(),
                filterDto.getMajorId(), filterDto.getPageNo(), filterDto.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        Specification<ClassEntity> spec = ClassSpecification.combineWithUserRole(
                filterDto.getSearch(),
                filterDto.getAcademyYear(),
                filterDto.getStatus(),
                filterDto.getMajorId(),
                currentUser
        );

        Page<ClassEntity> classPage = classRepository.findAll(spec, pageable);
        log.info("getMyClasses | result: totalElements={}, totalPages={}, currentPage={}",
                classPage.getTotalElements(), classPage.getTotalPages(), classPage.getNumber() + 1);

        CustomPaginationResponseDto<ClassResponseDto> response = classMapper.toClassAllResponseDto(classPage);
        return response;
    }

    // ===== Private Helper Methods =====

    /**
     * Helper method to find a class by ID or throw NotFoundException
     */
    private ClassEntity findClassById(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Class not found with ID: {}", id);
                    return new NotFoundException("Class id " + id + " not found. Please try again.");
                });
    }

    /**
     * Helper method to find a major by ID or throw NotFoundException
     */
    private MajorEntity findMajorById(Long id) {
        return majorRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Major not found with ID: {}", id);
                    return new NotFoundException("Major id " + id + " not found");
                });
    }
}