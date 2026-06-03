package com.menghor.ksit.feature.auth.service.impl;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.exceptoins.error.BadRequestException;
import com.menghor.ksit.exceptoins.error.DuplicateNameException;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.auth.dto.relationship.*;
import com.menghor.ksit.feature.auth.dto.request.StaffCreateRequestDto;
import com.menghor.ksit.feature.auth.dto.request.StaffUpdateRequestDto;
import com.menghor.ksit.feature.auth.dto.filter.StaffUserFilterRequestDto;
import com.menghor.ksit.feature.auth.dto.resposne.StaffUserAllResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StaffUserListResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StaffUserResponseDto;
import com.menghor.ksit.feature.auth.mapper.StaffMapper;
import com.menghor.ksit.feature.auth.models.*;
import com.menghor.ksit.feature.auth.repository.*;
import com.menghor.ksit.feature.auth.service.StaffService;
import com.menghor.ksit.feature.auth.specification.UserSpecification;
import com.menghor.ksit.feature.master.model.DepartmentEntity;
import com.menghor.ksit.feature.master.repository.DepartmentRepository;
import com.menghor.ksit.feature.menu.service.MenuService;
import com.menghor.ksit.utils.component.RelationshipUpdateHandler;
import com.menghor.ksit.utils.pagiantion.PaginationUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffServiceImpl implements StaffService {

    @PersistenceContext
    private EntityManager entityManager;

    private final RelationshipUpdateHandler relationshipUpdateHandler;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final StaffMapper staffMapper;
    private final MenuService menuService;

    private final TeachersProfessionalRankRepository teachersProfessionalRankRepository;
    private final TeacherExperienceRepository teacherExperienceRepository;
    private final TeacherPraiseOrCriticismRepository teacherPraiseOrCriticismRepository;
    private final TeacherEducationRepository teacherEducationRepository;
    private final TeacherVocationalRepository teacherVocationalRepository;
    private final TeacherShortCourseRepository teacherShortCourseRepository;
    private final TeacherLanguageRepository teacherLanguageRepository;
    private final TeacherFamilyRepository teacherFamilyRepository;

    @Override
    @Transactional
    public StaffUserResponseDto registerStaff(StaffCreateRequestDto requestDto) {
        log.info("Registering new staff user with email: {}", requestDto.getEmail());

        if (requestDto.getDepartmentId() != null) {
            DepartmentEntity department = departmentRepository.findById(requestDto.getDepartmentId())
                    .orElseThrow(() -> new BadRequestException("Department not found with ID: " + requestDto.getDepartmentId()));
        }

        UserEntity staff = new UserEntity();
        setBasicStaffFields(staff, requestDto);
        UserEntity savedStaff = userRepository.save(staff);

        try {
            menuService.initializeMenuPermissionsForNewUser(savedStaff.getId());
        } catch (Exception e) {
            log.error("Failed to initialize menu permissions for staff user {}: {}", savedStaff.getId(), e.getMessage());
        }

        createInitialRelationships(savedStaff, requestDto);
        UserEntity refreshedStaff = loadStaffWithAllRelationships(savedStaff.getId());

        log.info("Staff user registered successfully with ID: {}", refreshedStaff.getId());
        return staffMapper.toStaffUserDto(refreshedStaff);
    }

    @Override
    public StaffUserAllResponseDto getAllStaffUsers(StaffUserFilterRequestDto filterDto) {
        log.info("Fetching all staff users with filter: {}", filterDto);

        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        Specification<UserEntity> specification = UserSpecification.createStaffSpecification(filterDto);
        Page<UserEntity> userPage = userRepository.findAll(specification, pageable);
        List<StaffUserListResponseDto> userDtos = staffMapper.toStaffUserDtoList(userPage.getContent());

        return staffMapper.toStaffPageResponse(userDtos, userPage);
    }

    @Override
    public StaffUserResponseDto getStaffUserById(Long id) {
        log.info("Fetching staff user by ID: {}", id);
        UserEntity user = loadStaffWithAllRelationships(id);
        return staffMapper.toStaffUserDto(user);
    }

    @Override
    @Transactional
    public StaffUserResponseDto updateStaffUser(Long id, StaffUpdateRequestDto updateDto) {
        log.info("Starting staff user update for ID: {}", id);

        UserEntity staff = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + id));

        if (staff.isStudent()) {
            throw new BadRequestException("User with ID " + id + " is a student, not a staff user");
        }

        // Validate department if provided
        if (updateDto.getDepartmentId() != null) {
            DepartmentEntity department = departmentRepository.findById(updateDto.getDepartmentId())
                    .orElseThrow(() -> new BadRequestException("Department not found with ID: " + updateDto.getDepartmentId()));
        }

        // Update basic fields
        updateBasicFields(staff, updateDto);

        // Save basic changes first
        userRepository.save(staff);

        // Update relationships using the RelationshipUpdateHandler
        updateStaffRelationships(staff, updateDto);

        // Load final result with all relationships
        UserEntity finalStaff = loadStaffWithAllRelationships(id);

        log.info("Staff user update completed successfully for ID: {}", id);
        return staffMapper.toStaffUserDto(finalStaff);
    }

    // FIXED: Remove manual transaction management and flush calls
    private void updateStaffRelationships(UserEntity staff, StaffUpdateRequestDto updateDto) {
        log.info("Updating staff relationships for user ID: {}", staff.getId());

        try {
            // Use RelationshipUpdateHandler for all relationship updates
            // TeachersProfessionalRank
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeachersProfessionalRank(),
                    updateDto.getTeachersProfessionalRanks(),
                    dto -> createTeachersProfessionalRankEntity(dto, staff),
                    this::updateTeachersProfessionalRankEntity,
                    teachersProfessionalRankRepository,
                    staff,
                    "TeachersProfessionalRank",
                    TeachersProfessionalRankDto::getId
            );

            // TeacherExperience
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeacherExperience(),
                    updateDto.getTeacherExperiences(),
                    dto -> createTeacherExperienceEntity(dto, staff),
                    this::updateTeacherExperienceEntity,
                    teacherExperienceRepository,
                    staff,
                    "TeacherExperience",
                    TeacherExperienceDto::getId
            );

            // TeacherPraiseOrCriticism
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeacherPraiseOrCriticism(),
                    updateDto.getTeacherPraiseOrCriticisms(),
                    dto -> createTeacherPraiseOrCriticismEntity(dto, staff),
                    this::updateTeacherPraiseOrCriticismEntity,
                    teacherPraiseOrCriticismRepository,
                    staff,
                    "TeacherPraiseOrCriticism",
                    TeacherPraiseOrCriticismDto::getId
            );

            // TeacherEducation
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeacherEducation(),
                    updateDto.getTeacherEducations(),
                    dto -> createTeacherEducationEntity(dto, staff),
                    this::updateTeacherEducationEntity,
                    teacherEducationRepository,
                    staff,
                    "TeacherEducation",
                    TeacherEducationDto::getId
            );

            // TeacherVocational
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeacherVocational(),
                    updateDto.getTeacherVocationals(),
                    dto -> createTeacherVocationalEntity(dto, staff),
                    this::updateTeacherVocationalEntity,
                    teacherVocationalRepository,
                    staff,
                    "TeacherVocational",
                    TeacherVocationalDto::getId
            );

            // TeacherShortCourse
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeacherShortCourse(),
                    updateDto.getTeacherShortCourses(),
                    dto -> createTeacherShortCourseEntity(dto, staff),
                    this::updateTeacherShortCourseEntity,
                    teacherShortCourseRepository,
                    staff,
                    "TeacherShortCourse",
                    TeacherShortCourseDto::getId
            );

            // TeacherLanguage
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeacherLanguage(),
                    updateDto.getTeacherLanguages(),
                    dto -> createTeacherLanguageEntity(dto, staff),
                    this::updateTeacherLanguageEntity,
                    teacherLanguageRepository,
                    staff,
                    "TeacherLanguage",
                    TeacherLanguageDto::getId
            );

            // TeacherFamily
            relationshipUpdateHandler.updateRelationshipsSimple(
                    staff.getTeacherFamily(),
                    updateDto.getTeacherFamilies(),
                    dto -> createTeacherFamilyEntity(dto, staff),
                    this::updateTeacherFamilyEntity,
                    teacherFamilyRepository,
                    staff,
                    "TeacherFamily",
                    TeacherFamilyDto::getId
            );

            log.info("Successfully updated all staff relationships for user ID: {}", staff.getId());

        } catch (Exception e) {
            log.error("Error updating staff relationships for user ID {}: {}", staff.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update staff relationships: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public StaffUserResponseDto deleteStaffUser(Long id) {
        log.info("Deleting/deactivating staff user with ID: {}", id);

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + id));

        user.setIdentifyNumber(UUID.randomUUID().toString());
        user.setStatus(Status.DELETED);
        UserEntity deactivatedUser = userRepository.save(user);

        log.info("Staff user with ID {} deactivated successfully", id);
        return staffMapper.toStaffUserDto(deactivatedUser);
    }

    private UserEntity loadStaffWithAllRelationships(Long staffId) {
        try {
            String basicQuery = """
                SELECT DISTINCT u FROM UserEntity u
                LEFT JOIN FETCH u.roles
                LEFT JOIN FETCH u.department d
                WHERE u.id = :staffId
                """;

            UserEntity user = entityManager.createQuery(basicQuery, UserEntity.class)
                    .setParameter("staffId", staffId)
                    .getSingleResult();

            loadTeacherProfessionalRanks(user);
            loadTeacherExperiences(user);
            loadTeacherPraiseOrCriticisms(user);
            loadTeacherEducations(user);
            loadTeacherVocational(user);
            loadTeacherShortCourses(user);
            loadTeacherLanguages(user);
            loadTeacherFamilies(user);

            return user;
        } catch (Exception e) {
            throw new NotFoundException("User not found with ID: " + staffId);
        }
    }

    private void loadTeacherProfessionalRanks(UserEntity user) {
        String query = "SELECT t FROM TeachersProfessionalRankEntity t WHERE t.user.id = :userId";
        List<TeachersProfessionalRankEntity> results = entityManager.createQuery(query, TeachersProfessionalRankEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeachersProfessionalRank().clear();
        user.getTeachersProfessionalRank().addAll(results);
    }

    private void loadTeacherExperiences(UserEntity user) {
        String query = "SELECT t FROM TeacherExperienceEntity t WHERE t.user.id = :userId";
        List<TeacherExperienceEntity> results = entityManager.createQuery(query, TeacherExperienceEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeacherExperience().clear();
        user.getTeacherExperience().addAll(results);
    }

    private void loadTeacherPraiseOrCriticisms(UserEntity user) {
        String query = "SELECT t FROM TeacherPraiseOrCriticismEntity t WHERE t.user.id = :userId";
        List<TeacherPraiseOrCriticismEntity> results = entityManager.createQuery(query, TeacherPraiseOrCriticismEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeacherPraiseOrCriticism().clear();
        user.getTeacherPraiseOrCriticism().addAll(results);
    }

    private void loadTeacherEducations(UserEntity user) {
        String query = "SELECT t FROM TeacherEducationEntity t WHERE t.user.id = :userId";
        List<TeacherEducationEntity> results = entityManager.createQuery(query, TeacherEducationEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeacherEducation().clear();
        user.getTeacherEducation().addAll(results);
    }

    private void loadTeacherVocational(UserEntity user) {
        String query = "SELECT t FROM TeacherVocationalEntity t WHERE t.user.id = :userId";
        List<TeacherVocationalEntity> results = entityManager.createQuery(query, TeacherVocationalEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeacherVocational().clear();
        user.getTeacherVocational().addAll(results);
    }

    private void loadTeacherShortCourses(UserEntity user) {
        String query = "SELECT t FROM TeacherShortCourseEntity t WHERE t.user.id = :userId";
        List<TeacherShortCourseEntity> results = entityManager.createQuery(query, TeacherShortCourseEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeacherShortCourse().clear();
        user.getTeacherShortCourse().addAll(results);
    }

    private void loadTeacherLanguages(UserEntity user) {
        String query = "SELECT t FROM TeacherLanguageEntity t WHERE t.user.id = :userId";
        List<TeacherLanguageEntity> results = entityManager.createQuery(query, TeacherLanguageEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeacherLanguage().clear();
        user.getTeacherLanguage().addAll(results);
    }

    private void loadTeacherFamilies(UserEntity user) {
        String query = "SELECT t FROM TeacherFamilyEntity t WHERE t.user.id = :userId";
        List<TeacherFamilyEntity> results = entityManager.createQuery(query, TeacherFamilyEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();

        user.getTeacherFamily().clear();
        user.getTeacherFamily().addAll(results);
    }

    // Helper methods remain the same...
    private void setBasicStaffFields(UserEntity staff, StaffCreateRequestDto requestDto) {
        staff.setUsername(requestDto.getUsername());
        staff.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        staff.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : Status.ACTIVE);
        staff.setEmail(requestDto.getEmail());

        staff.setKhmerFirstName(requestDto.getKhmerFirstName());
        staff.setKhmerLastName(requestDto.getKhmerLastName());
        staff.setEnglishFirstName(requestDto.getEnglishFirstName());
        staff.setEnglishLastName(requestDto.getEnglishLastName());
        staff.setGender(requestDto.getGender());
        staff.setDateOfBirth(requestDto.getDateOfBirth());
        staff.setPhoneNumber(requestDto.getPhoneNumber());
        staff.setCurrentAddress(requestDto.getCurrentAddress());
        staff.setNationality(requestDto.getNationality());
        staff.setEthnicity(requestDto.getEthnicity());
        staff.setPlaceOfBirth(requestDto.getPlaceOfBirth());
        staff.setProfileUrl(requestDto.getProfileUrl());

        staff.setTaughtEnglish(requestDto.getTaughtEnglish());
        staff.setThreeLevelClass(requestDto.getThreeLevelClass());
        staff.setReferenceNote(requestDto.getReferenceNote());
        staff.setTechnicalTeamLeader(requestDto.getTechnicalTeamLeader());
        staff.setAssistInTeaching(requestDto.getAssistInTeaching());
        staff.setSerialNumber(requestDto.getSerialNumber());
        staff.setTwoLevelClass(requestDto.getTwoLevelClass());
        staff.setClassResponsibility(requestDto.getClassResponsibility());
        staff.setLastSalaryIncrementDate(requestDto.getLastSalaryIncrementDate());
        staff.setTeachAcrossSchools(requestDto.getTeachAcrossSchools());
        staff.setOvertimeHours(requestDto.getOvertimeHours());
        staff.setIssuedDate(requestDto.getIssuedDate());
        staff.setSuitableClass(requestDto.getSuitableClass());
        staff.setBilingual(requestDto.getBilingual());
        staff.setAcademicYearTaught(requestDto.getAcademicYearTaught());
        staff.setWorkHistory(requestDto.getWorkHistory());

        staff.setStaffId(requestDto.getStaffId());
        staff.setNationalId(requestDto.getNationalId());
        staff.setIdentifyNumber(requestDto.getIdentifyNumber());
        staff.setStartWorkDate(requestDto.getStartWorkDate());
        staff.setCurrentPositionDate(requestDto.getCurrentPositionDate());
        staff.setEmployeeWork(requestDto.getEmployeeWork());
        staff.setDisability(requestDto.getDisability());
        staff.setPayrollAccountNumber(requestDto.getPayrollAccountNumber());
        staff.setCppMembershipNumber(requestDto.getCppMembershipNumber());
        staff.setProvince(requestDto.getProvince());
        staff.setDistrict(requestDto.getDistrict());
        staff.setCommune(requestDto.getCommune());
        staff.setVillage(requestDto.getVillage());
        staff.setOfficeName(requestDto.getOfficeName());
        staff.setCurrentPosition(requestDto.getCurrentPosition());
        staff.setDecreeFinal(requestDto.getDecreeFinal());
        staff.setRankAndClass(requestDto.getRankAndClass());

        staff.setMaritalStatus(requestDto.getMaritalStatus());
        staff.setMustBe(requestDto.getMustBe());
        staff.setAffiliatedProfession(requestDto.getAffiliatedProfession());
        staff.setFederationName(requestDto.getFederationName());
        staff.setAffiliatedOrganization(requestDto.getAffiliatedOrganization());
        staff.setFederationEstablishmentDate(requestDto.getFederationEstablishmentDate());
        staff.setWivesSalary(requestDto.getWivesSalary());

        if (requestDto.getDepartmentId() != null) {
            try {
                DepartmentEntity department = departmentRepository.findById(requestDto.getDepartmentId())
                        .orElseThrow(() -> new BadRequestException("Department not found with ID: " + requestDto.getDepartmentId()));
                staff.setDepartment(department);
            } catch (Exception e) {
                throw new BadRequestException("Failed to assign department: " + e.getMessage());
            }
        } else {
            staff.setDepartment(null);
        }

        List<Role> roles = new ArrayList<>();
        if (requestDto.getRoles() != null && !requestDto.getRoles().isEmpty()) {
            for (RoleEnum roleEnum : requestDto.getRoles()) {
                Role role = roleRepository.findByName(roleEnum)
                        .orElseThrow(() -> new BadRequestException("Invalid role: " + roleEnum));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName(RoleEnum.STAFF)
                    .orElseThrow(() -> new BadRequestException("Default role not found"));
            roles.add(defaultRole);
        }
        staff.setRoles(roles);

        staff.setTeachersProfessionalRank(new ArrayList<>());
        staff.setTeacherExperience(new ArrayList<>());
        staff.setTeacherPraiseOrCriticism(new ArrayList<>());
        staff.setTeacherEducation(new ArrayList<>());
        staff.setTeacherVocational(new ArrayList<>());
        staff.setTeacherShortCourse(new ArrayList<>());
        staff.setTeacherLanguage(new ArrayList<>());
        staff.setTeacherFamily(new ArrayList<>());
    }

    private void createInitialRelationships(UserEntity savedStaff, StaffCreateRequestDto requestDto) {
        if (requestDto.getTeachersProfessionalRanks() != null && !requestDto.getTeachersProfessionalRanks().isEmpty()) {
            for (TeachersProfessionalRankDto dto : requestDto.getTeachersProfessionalRanks()) {
                TeachersProfessionalRankEntity entity = createTeachersProfessionalRankEntity(dto, savedStaff);
                teachersProfessionalRankRepository.save(entity);
            }
        }

        if (requestDto.getTeacherExperiences() != null && !requestDto.getTeacherExperiences().isEmpty()) {
            for (TeacherExperienceDto dto : requestDto.getTeacherExperiences()) {
                TeacherExperienceEntity entity = createTeacherExperienceEntity(dto, savedStaff);
                teacherExperienceRepository.save(entity);
            }
        }

        if (requestDto.getTeacherPraiseOrCriticisms() != null && !requestDto.getTeacherPraiseOrCriticisms().isEmpty()) {
            for (TeacherPraiseOrCriticismDto dto : requestDto.getTeacherPraiseOrCriticisms()) {
                TeacherPraiseOrCriticismEntity entity = createTeacherPraiseOrCriticismEntity(dto, savedStaff);
                teacherPraiseOrCriticismRepository.save(entity);
            }
        }

        if (requestDto.getTeacherEducations() != null && !requestDto.getTeacherEducations().isEmpty()) {
            for (TeacherEducationDto dto : requestDto.getTeacherEducations()) {
                TeacherEducationEntity entity = createTeacherEducationEntity(dto, savedStaff);
                teacherEducationRepository.save(entity);
            }
        }

        if (requestDto.getTeacherVocationals() != null && !requestDto.getTeacherVocationals().isEmpty()) {
            for (TeacherVocationalDto dto : requestDto.getTeacherVocationals()) {
                TeacherVocationalEntity entity = createTeacherVocationalEntity(dto, savedStaff);
                teacherVocationalRepository.save(entity);
            }
        }

        if (requestDto.getTeacherShortCourses() != null && !requestDto.getTeacherShortCourses().isEmpty()) {
            for (TeacherShortCourseDto dto : requestDto.getTeacherShortCourses()) {
                TeacherShortCourseEntity entity = createTeacherShortCourseEntity(dto, savedStaff);
                teacherShortCourseRepository.save(entity);
            }
        }

        if (requestDto.getTeacherLanguages() != null && !requestDto.getTeacherLanguages().isEmpty()) {
            for (TeacherLanguageDto dto : requestDto.getTeacherLanguages()) {
                TeacherLanguageEntity entity = createTeacherLanguageEntity(dto, savedStaff);
                teacherLanguageRepository.save(entity);
            }
        }

        if (requestDto.getTeacherFamilies() != null && !requestDto.getTeacherFamilies().isEmpty()) {
            for (TeacherFamilyDto dto : requestDto.getTeacherFamilies()) {
                TeacherFamilyEntity entity = createTeacherFamilyEntity(dto, savedStaff);
                teacherFamilyRepository.save(entity);
            }
        }

        // Remove manual flush - let Spring handle it
        log.info("Initial relationships created successfully for staff ID: {}", savedStaff.getId());
    }

    private void updateBasicFields(UserEntity staff, StaffUpdateRequestDto updateDto) {
        if (updateDto.getUsername() != null && !updateDto.getUsername().equals(staff.getUsername()) &&
                userRepository.existsByUsernameAndIdNot(updateDto.getUsername(), staff.getId())) {
            throw new DuplicateNameException("Username '" + updateDto.getUsername() + "' is already in use as a username.");
        }

        if (updateDto.getTaughtEnglish() != null) staff.setTaughtEnglish(updateDto.getTaughtEnglish());
        if (updateDto.getThreeLevelClass() != null) staff.setThreeLevelClass(updateDto.getThreeLevelClass());
        if (updateDto.getReferenceNote() != null) staff.setReferenceNote(updateDto.getReferenceNote());
        if (updateDto.getTechnicalTeamLeader() != null) staff.setTechnicalTeamLeader(updateDto.getTechnicalTeamLeader());
        if (updateDto.getAssistInTeaching() != null) staff.setAssistInTeaching(updateDto.getAssistInTeaching());
        if (updateDto.getSerialNumber() != null) staff.setSerialNumber(updateDto.getSerialNumber());
        if (updateDto.getTwoLevelClass() != null) staff.setTwoLevelClass(updateDto.getTwoLevelClass());
        if (updateDto.getClassResponsibility() != null) staff.setClassResponsibility(updateDto.getClassResponsibility());
        if (updateDto.getLastSalaryIncrementDate() != null) staff.setLastSalaryIncrementDate(updateDto.getLastSalaryIncrementDate());
        if (updateDto.getTeachAcrossSchools() != null) staff.setTeachAcrossSchools(updateDto.getTeachAcrossSchools());
        if (updateDto.getOvertimeHours() != null) staff.setOvertimeHours(updateDto.getOvertimeHours());
        if (updateDto.getIssuedDate() != null) staff.setIssuedDate(updateDto.getIssuedDate());
        if (updateDto.getSuitableClass() != null) staff.setSuitableClass(updateDto.getSuitableClass());
        if (updateDto.getBilingual() != null) staff.setBilingual(updateDto.getBilingual());
        if (updateDto.getAcademicYearTaught() != null) staff.setAcademicYearTaught(updateDto.getAcademicYearTaught());
        if (updateDto.getWorkHistory() != null) staff.setWorkHistory(updateDto.getWorkHistory());

        if (updateDto.getUsername() != null) staff.setUsername(updateDto.getUsername());
        if (updateDto.getEmail() != null) staff.setEmail(updateDto.getEmail());
        if (updateDto.getKhmerFirstName() != null) staff.setKhmerFirstName(updateDto.getKhmerFirstName());
        if (updateDto.getKhmerLastName() != null) staff.setKhmerLastName(updateDto.getKhmerLastName());
        if (updateDto.getEnglishFirstName() != null) staff.setEnglishFirstName(updateDto.getEnglishFirstName());
        if (updateDto.getEnglishLastName() != null) staff.setEnglishLastName(updateDto.getEnglishLastName());
        if (updateDto.getGender() != null) staff.setGender(updateDto.getGender());
        if (updateDto.getDateOfBirth() != null) staff.setDateOfBirth(updateDto.getDateOfBirth());
        if (updateDto.getPhoneNumber() != null) staff.setPhoneNumber(updateDto.getPhoneNumber());
        if (updateDto.getCurrentAddress() != null) staff.setCurrentAddress(updateDto.getCurrentAddress());
        if (updateDto.getNationality() != null) staff.setNationality(updateDto.getNationality());
        if (updateDto.getEthnicity() != null) staff.setEthnicity(updateDto.getEthnicity());
        if (updateDto.getPlaceOfBirth() != null) staff.setPlaceOfBirth(updateDto.getPlaceOfBirth());
        if (updateDto.getProfileUrl() != null) staff.setProfileUrl(updateDto.getProfileUrl());

        if (updateDto.getStaffId() != null) staff.setStaffId(updateDto.getStaffId());
        if (updateDto.getNationalId() != null) staff.setNationalId(updateDto.getNationalId());
        if (updateDto.getIdentifyNumber() != null) staff.setIdentifyNumber(updateDto.getIdentifyNumber());
        if (updateDto.getStartWorkDate() != null) staff.setStartWorkDate(updateDto.getStartWorkDate());
        if (updateDto.getCurrentPositionDate() != null) staff.setCurrentPositionDate(updateDto.getCurrentPositionDate());
        if (updateDto.getEmployeeWork() != null) staff.setEmployeeWork(updateDto.getEmployeeWork());
        if (updateDto.getDisability() != null) staff.setDisability(updateDto.getDisability());
        if (updateDto.getPayrollAccountNumber() != null) staff.setPayrollAccountNumber(updateDto.getPayrollAccountNumber());
        if (updateDto.getCppMembershipNumber() != null) staff.setCppMembershipNumber(updateDto.getCppMembershipNumber());
        if (updateDto.getProvince() != null) staff.setProvince(updateDto.getProvince());
        if (updateDto.getDistrict() != null) staff.setDistrict(updateDto.getDistrict());
        if (updateDto.getCommune() != null) staff.setCommune(updateDto.getCommune());
        if (updateDto.getVillage() != null) staff.setVillage(updateDto.getVillage());
        if (updateDto.getOfficeName() != null) staff.setOfficeName(updateDto.getOfficeName());
        if (updateDto.getCurrentPosition() != null) staff.setCurrentPosition(updateDto.getCurrentPosition());
        if (updateDto.getDecreeFinal() != null) staff.setDecreeFinal(updateDto.getDecreeFinal());
        if (updateDto.getRankAndClass() != null) staff.setRankAndClass(updateDto.getRankAndClass());

        if (updateDto.getMaritalStatus() != null) staff.setMaritalStatus(updateDto.getMaritalStatus());
        if (updateDto.getMustBe() != null) staff.setMustBe(updateDto.getMustBe());
        if (updateDto.getAffiliatedProfession() != null) staff.setAffiliatedProfession(updateDto.getAffiliatedProfession());
        if (updateDto.getFederationName() != null) staff.setFederationName(updateDto.getFederationName());
        if (updateDto.getAffiliatedOrganization() != null) staff.setAffiliatedOrganization(updateDto.getAffiliatedOrganization());
        if (updateDto.getFederationEstablishmentDate() != null) staff.setFederationEstablishmentDate(updateDto.getFederationEstablishmentDate());
        if (updateDto.getWivesSalary() != null) staff.setWivesSalary(updateDto.getWivesSalary());

        if (updateDto.getDepartmentId() != null) {
            try {
                DepartmentEntity department = departmentRepository.findById(updateDto.getDepartmentId())
                        .orElseThrow(() -> new BadRequestException("Department not found with ID: " + updateDto.getDepartmentId()));

                staff.setDepartment(department);
            } catch (Exception e) {
                throw new BadRequestException("Failed to update department: " + e.getMessage());
            }
        }

        if (updateDto.getRoles() != null && !updateDto.getRoles().isEmpty()) {
            List<Role> roles = new ArrayList<>();
            for (RoleEnum roleEnum : updateDto.getRoles()) {
                Role role = roleRepository.findByName(roleEnum)
                        .orElseThrow(() -> new BadRequestException("Invalid role: " + roleEnum));
                roles.add(role);
            }
            staff.setRoles(roles);
        }

        if (updateDto.getStatus() != null) {
            staff.setStatus(updateDto.getStatus());
        }
    }

    private TeachersProfessionalRankEntity createTeachersProfessionalRankEntity(TeachersProfessionalRankDto dto, UserEntity user) {
        TeachersProfessionalRankEntity entity = new TeachersProfessionalRankEntity();
        updateTeachersProfessionalRankEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeachersProfessionalRankEntity(TeachersProfessionalRankDto dto, TeachersProfessionalRankEntity entity) {
        if (dto.getTypeOfProfessionalRank() != null) entity.setTypeOfProfessionalRank(dto.getTypeOfProfessionalRank());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getAnnouncementNumber() != null) entity.setAnnouncementNumber(dto.getAnnouncementNumber());
        if (dto.getDateAccepted() != null) entity.setDateAccepted(dto.getDateAccepted());
    }

    private TeacherExperienceEntity createTeacherExperienceEntity(TeacherExperienceDto dto, UserEntity user) {
        TeacherExperienceEntity entity = new TeacherExperienceEntity();
        updateTeacherExperienceEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeacherExperienceEntity(TeacherExperienceDto dto, TeacherExperienceEntity entity) {
        if (dto.getContinuousEmployment() != null) entity.setContinuousEmployment(dto.getContinuousEmployment());
        if (dto.getWorkPlace() != null) entity.setWorkPlace(dto.getWorkPlace());
        if (dto.getStartDate() != null) entity.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
    }

    private TeacherPraiseOrCriticismEntity createTeacherPraiseOrCriticismEntity(TeacherPraiseOrCriticismDto dto, UserEntity user) {
        TeacherPraiseOrCriticismEntity entity = new TeacherPraiseOrCriticismEntity();
        updateTeacherPraiseOrCriticismEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeacherPraiseOrCriticismEntity(TeacherPraiseOrCriticismDto dto, TeacherPraiseOrCriticismEntity entity) {
        if (dto.getTypePraiseOrCriticism() != null) entity.setTypePraiseOrCriticism(dto.getTypePraiseOrCriticism());
        if (dto.getGiveBy() != null) entity.setGiveBy(dto.getGiveBy());
        if (dto.getDateAccepted() != null) entity.setDateAccepted(dto.getDateAccepted());
    }

    private TeacherEducationEntity createTeacherEducationEntity(TeacherEducationDto dto, UserEntity user) {
        TeacherEducationEntity entity = new TeacherEducationEntity();
        updateTeacherEducationEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeacherEducationEntity(TeacherEducationDto dto, TeacherEducationEntity entity) {
        if (dto.getCulturalLevel() != null) entity.setCulturalLevel(dto.getCulturalLevel());
        if (dto.getSkillName() != null) entity.setSkillName(dto.getSkillName());
        if (dto.getDateAccepted() != null) entity.setDateAccepted(dto.getDateAccepted());
        if (dto.getCountry() != null) entity.setCountry(dto.getCountry());
    }

    private TeacherVocationalEntity createTeacherVocationalEntity(TeacherVocationalDto dto, UserEntity user) {
        TeacherVocationalEntity entity = new TeacherVocationalEntity();
        updateTeacherVocationalEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeacherVocationalEntity(TeacherVocationalDto dto, TeacherVocationalEntity entity) {
        if (dto.getCulturalLevel() != null) entity.setCulturalLevel(dto.getCulturalLevel());
        if (dto.getSkillOne() != null) entity.setSkillOne(dto.getSkillOne());
        if (dto.getSkillTwo() != null) entity.setSkillTwo(dto.getSkillTwo());
        if (dto.getTrainingSystem() != null) entity.setTrainingSystem(dto.getTrainingSystem());
        if (dto.getDateAccepted() != null) entity.setDateAccepted(dto.getDateAccepted());
    }

    private TeacherShortCourseEntity createTeacherShortCourseEntity(TeacherShortCourseDto dto, UserEntity user) {
        TeacherShortCourseEntity entity = new TeacherShortCourseEntity();
        updateTeacherShortCourseEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeacherShortCourseEntity(TeacherShortCourseDto dto, TeacherShortCourseEntity entity) {
        if (dto.getSkill() != null) entity.setSkill(dto.getSkill());
        if (dto.getSkillName() != null) entity.setSkillName(dto.getSkillName());
        if (dto.getStartDate() != null) entity.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
        if (dto.getDuration() != null) entity.setDuration(dto.getDuration());
        if (dto.getPreparedBy() != null) entity.setPreparedBy(dto.getPreparedBy());
        if (dto.getSupportBy() != null) entity.setSupportBy(dto.getSupportBy());
    }

    private TeacherLanguageEntity createTeacherLanguageEntity(TeacherLanguageDto dto, UserEntity user) {
        TeacherLanguageEntity entity = new TeacherLanguageEntity();
        updateTeacherLanguageEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeacherLanguageEntity(TeacherLanguageDto dto, TeacherLanguageEntity entity) {
        if (dto.getLanguage() != null) entity.setLanguage(dto.getLanguage());
        if (dto.getReading() != null) entity.setReading(dto.getReading());
        if (dto.getWriting() != null) entity.setWriting(dto.getWriting());
        if (dto.getSpeaking() != null) entity.setSpeaking(dto.getSpeaking());
    }

    private TeacherFamilyEntity createTeacherFamilyEntity(TeacherFamilyDto dto, UserEntity user) {
        TeacherFamilyEntity entity = new TeacherFamilyEntity();
        updateTeacherFamilyEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateTeacherFamilyEntity(TeacherFamilyDto dto, TeacherFamilyEntity entity) {
        if (dto.getNameChild() != null) entity.setNameChild(dto.getNameChild());
        if (dto.getGender() != null) entity.setGender(dto.getGender());
        if (dto.getDateOfBirth() != null) entity.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getWorking() != null) entity.setWorking(dto.getWorking());
    }
}