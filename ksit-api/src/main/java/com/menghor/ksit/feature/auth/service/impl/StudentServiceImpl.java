package com.menghor.ksit.feature.auth.service.impl;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.enumations.StudentStatus;
import com.menghor.ksit.exceptoins.error.BadRequestException;
import com.menghor.ksit.exceptoins.error.DuplicateNameException;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.auth.dto.relationship.StudentParentDto;
import com.menghor.ksit.feature.auth.dto.relationship.StudentSiblingDto;
import com.menghor.ksit.feature.auth.dto.relationship.StudentStudiesHistoryDto;
import com.menghor.ksit.feature.auth.dto.request.StudentBatchCreateRequestDto;
import com.menghor.ksit.feature.auth.dto.request.StudentCreateRequestDto;
import com.menghor.ksit.feature.auth.dto.request.StudentUpdateRequestDto;
import com.menghor.ksit.feature.auth.dto.filter.StudentUserFilterRequestDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentUserAllResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentUserListResponseDto;
import com.menghor.ksit.feature.auth.dto.resposne.StudentUserResponseDto;
import com.menghor.ksit.feature.auth.mapper.StudentMapper;
import com.menghor.ksit.feature.auth.models.*;
import com.menghor.ksit.feature.auth.repository.*;
import com.menghor.ksit.feature.auth.service.StudentService;
import com.menghor.ksit.feature.auth.specification.UserSpecification;
import com.menghor.ksit.feature.master.model.ClassEntity;
import com.menghor.ksit.feature.master.repository.ClassRepository;
import com.menghor.ksit.feature.menu.service.MenuService;
import com.menghor.ksit.utils.component.RelationshipUpdateHandler;
import com.menghor.ksit.utils.pagiantion.PaginationUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {

    @PersistenceContext
    private EntityManager entityManager;

    private final RelationshipUpdateHandler relationshipUpdateHandler;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentMapper studentMapper;
    private final StudentIdentifierGenerator identifierGenerator;
    private final MenuService menuService;

    // Child entity repositories
    private final StudentStudiesHistoryRepository studentStudiesHistoryRepository;
    private final StudentParentRepository studentParentRepository;
    private final StudentSiblingRepository studentSiblingRepository;

    @Override
    @Transactional
    public StudentUserResponseDto registerStudent(StudentCreateRequestDto requestDto) {

        // Generate student identifier based on class code
        String identifyNumber = identifierGenerator.generateStudentIdentifier(requestDto.getClassId());

        // Set username to identifyNumber if not provided
        String username = requestDto.getUsername();
        if (username == null || username.isEmpty()) {
            username = identifyNumber;
        }

        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            log.warn("Attempt to register with duplicate username: {}", username);
            throw new DuplicateNameException("Username '" + username + "' is already in use. Please try a different username.");
        }

        // Check if identifyNumber already exists
        if (userRepository.existsByIdentifyNumber(identifyNumber)) {
            log.warn("Attempt to register with duplicate identifyNumber: {}", identifyNumber);
            throw new DuplicateNameException("Student ID number '" + identifyNumber + "' is already in use. Please contact an administrator.");
        }

        UserEntity student = new UserEntity();

        // Set all basic fields
        setBasicStudentFields(student, requestDto, identifyNumber, username);

        // Save the student first to get the ID
        UserEntity savedStudent = userRepository.save(student);

        try {
            menuService.initializeMenuPermissionsForNewUser(savedStudent.getId());
        } catch (Exception e) {
            log.error("Failed to initialize menu permissions for student user {}: {}", savedStudent.getId(), e.getMessage());
        }

        // Handle initial relationships for creation
        createInitialStudentRelationships(savedStudent, requestDto);

        // Use eager loading to fetch the student with all relationships
        UserEntity refreshedStudent = loadStudentWithAllRelationships(savedStudent.getId());

        return studentMapper.toStudentUserDto(refreshedStudent);
    }

    @Override
    @Transactional
    public List<StudentResponseDto> batchRegisterStudents(StudentBatchCreateRequestDto batchRequest) {

        // Check if class exists
        ClassEntity classEntity = classRepository.findById(batchRequest.getClassId())
                .orElseThrow(() -> new BadRequestException("Class not found with ID: " + batchRequest.getClassId()));

        // Get the STUDENT role
        Role studentRole = roleRepository.findByName(RoleEnum.STUDENT)
                .orElseThrow(() -> new BadRequestException("Student role not found"));

        // Create students
        return IntStream.range(0, batchRequest.getQuantity())
                .mapToObj(i -> {
                    try {
                        // Generate identifier
                        String identifyNumber = identifierGenerator.generateStudentIdentifier(batchRequest.getClassId());

                        // Check if identifyNumber already exists
                        if (userRepository.existsByIdentifyNumber(identifyNumber)) {
                            log.warn("Skipping batch student creation - duplicate identifyNumber: {}", identifyNumber);
                            throw new DuplicateNameException("Student ID '" + identifyNumber + "' is already in use. Skipping this student creation.");
                        }

                        // Generate password
                        String plainTextPassword = identifierGenerator.generateRandomPassword();

                        // Create student entity
                        UserEntity student = new UserEntity();

                        // Set username from identifyNumber
                        student.setUsername(identifyNumber);
                        student.setPassword(passwordEncoder.encode(plainTextPassword));
                        student.setStatus(batchRequest.getStatus() != null ? batchRequest.getStatus() : Status.ACTIVE);
                        student.setIdentifyNumber(identifyNumber);
                        student.setStudentStatus(StudentStatus.STUDYING);

                        // Set class
                        student.setClasses(classEntity);

                        // Set role
                        student.setRoles(Collections.singletonList(studentRole));

                        // Save student
                        UserEntity savedStudent = userRepository.save(student);

                        try {
                            menuService.initializeMenuPermissionsForNewUser(savedStudent.getId());
                        } catch (Exception e) {
                            log.error("Failed to initialize menu permissions for batch student #{}: {}", (i + 1), e.getMessage());
                        }

                        return studentMapper.toStudentBatchDto(savedStudent, plainTextPassword);
                    } catch (Exception e) {
                        log.error("Error creating batch student #{}: {}", (i + 1), e.getMessage());
                        throw new BadRequestException("Error creating batch student #" + (i + 1) + ": " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public StudentUserAllResponseDto getAllStudentUsers(StudentUserFilterRequestDto filterDto) {

        // Validate pagination parameters
        PaginationUtils.validatePagination(filterDto.getPageNo(), filterDto.getPageSize());

        // Add sorting by creation date in descending order (newest to oldest)
        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "identifyNumber",
                "ASC"
        );

        // Build specification for filtering
        Specification<UserEntity> specification = UserSpecification.createStudentSpecification(filterDto);

        // Fetch paginated users
        Page<UserEntity> userPage = userRepository.findAll(specification, pageable);

        // Convert to response DTOs
        List<StudentUserListResponseDto> userDtos = studentMapper.toStudentUserDtoList(userPage.getContent());

        // Create and return paginated response
        return studentMapper.toStudentPageResponse(userDtos, userPage);
    }

    @Override
    public List<StudentUserListResponseDto> getAllStudentListUsers(StudentUserFilterRequestDto filterDto) {

        Sort sort = Sort.by(Sort.Direction.ASC, "identifyNumber");

        // Build specification for filtering
        Specification<UserEntity> specification = UserSpecification.createStudentSpecification(filterDto);

        // Fetch paginated users
        List<UserEntity> userPage = userRepository.findAll(specification, sort);

        return studentMapper.toStudentUserDtoList(userPage);
    }

    @Override
    public StudentUserResponseDto getStudentUserById(Long id) {

        // Use eager loading for single user fetch
        UserEntity user = loadStudentWithAllRelationships(id);
        return studentMapper.toStudentUserDto(user);
    }

    @Override
    @Transactional
    public StudentUserResponseDto updateStudentUser(Long id, StudentUpdateRequestDto updateDto) {

        UserEntity student = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User with ID {} not found", id);
                    return new NotFoundException("User not found with ID: " + id);
                });

        // Verify user is a student
        if (!student.isStudent()) {
            throw new BadRequestException("User with ID " + id + " is not a student");
        }

        // Step 1: Update basic fields
        updateStudentBasicFields(student, updateDto);

        // Step 2: Save basic changes first
        UserEntity savedStudent = userRepository.save(student);
        userRepository.flush(); // Force flush to database

        // Step 3: Handle relationship updates
        handleStudentRelationshipUpdates(savedStudent, updateDto);

        // Step 4: Clear entity manager and load final result with all relationships
        entityManager.clear(); // Ensure fresh data
        UserEntity finalStudent = loadStudentWithAllRelationships(savedStudent.getId());

        return studentMapper.toStudentUserDto(finalStudent);
    }

    @Override
    @Transactional
    public StudentUserResponseDto deleteStudentUser(Long id) {

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User with ID {} not found", id);
                    return new NotFoundException("User not found with ID: " + id);
                });

        // Instead of hard delete, deactivate the user
        user.setIdentifyNumber(UUID.randomUUID().toString());
        user.setStatus(Status.DELETED);
        UserEntity deactivatedUser = userRepository.save(user);

        return studentMapper.toStudentUserDto(deactivatedUser);
    }

    // =====================================================================
    // PRIVATE HELPER METHODS WITH EAGER LOADING - FIXED
    // =====================================================================

    /**
     * FIXED: Load student user with all relationships eagerly to avoid lazy loading issues
     */
    private UserEntity loadStudentWithAllRelationships(Long studentId) {
        
        try {
            // First, load the user with basic relationships (non-collections)
            String basicQuery = """
                SELECT DISTINCT u FROM UserEntity u
                LEFT JOIN FETCH u.roles
                LEFT JOIN FETCH u.classes
                WHERE u.id = :studentId
                """;
            
            UserEntity user = entityManager.createQuery(basicQuery, UserEntity.class)
                    .setParameter("studentId", studentId)
                    .getSingleResult();
            
            // Then, load each collection separately
            loadStudentStudiesHistories(user);
            loadStudentParents(user);
            loadStudentSiblings(user);
            
            
            return user;
        } catch (Exception e) {
            log.error("Failed to load student with relationships for ID {}: {}", studentId, e.getMessage());
            throw new NotFoundException("User not found with ID: " + studentId);
        }
    }
    
    private void loadStudentStudiesHistories(UserEntity user) {
        String query = "SELECT s FROM StudentStudiesHistoryEntity s WHERE s.user.id = :userId";
        List<StudentStudiesHistoryEntity> results = entityManager.createQuery(query, StudentStudiesHistoryEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();
        
        user.getStudentStudiesHistory().clear();
        user.getStudentStudiesHistory().addAll(results);
    }
    
    private void loadStudentParents(UserEntity user) {
        String query = "SELECT s FROM StudentParentEntity s WHERE s.user.id = :userId";
        List<StudentParentEntity> results = entityManager.createQuery(query, StudentParentEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();
        
        user.getStudentParent().clear();
        user.getStudentParent().addAll(results);
    }
    
    private void loadStudentSiblings(UserEntity user) {
        String query = "SELECT s FROM StudentSiblingEntity s WHERE s.user.id = :userId";
        List<StudentSiblingEntity> results = entityManager.createQuery(query, StudentSiblingEntity.class)
                .setParameter("userId", user.getId())
                .getResultList();
        
        user.getStudentSibling().clear();
        user.getStudentSibling().addAll(results);
    }

    /**
     * FIXED: Handle student relationship updates with better transaction management
     */
    private void handleStudentRelationshipUpdates(UserEntity student, StudentUpdateRequestDto updateDto) {

        try {
            // Handle StudentStudiesHistory
            relationshipUpdateHandler.updateRelationshipsSimple(
                    student.getStudentStudiesHistory(), // This will be ignored in favor of DB lookup
                    updateDto.getStudentStudiesHistories(),
                    dto -> createStudentStudiesHistoryEntity(dto, student),
                    this::updateStudentStudiesHistoryEntity,
                    studentStudiesHistoryRepository,
                    student,
                    "StudentStudiesHistory",
                    StudentStudiesHistoryDto::getId
            );

            // Handle StudentParent
            relationshipUpdateHandler.updateRelationshipsSimple(
                    student.getStudentParent(),
                    updateDto.getStudentParents(),
                    dto -> createStudentParentEntity(dto, student),
                    this::updateStudentParentEntity,
                    studentParentRepository,
                    student,
                    "StudentParent",
                    StudentParentDto::getId
            );

            // Handle StudentSibling
            relationshipUpdateHandler.updateRelationshipsSimple(
                    student.getStudentSibling(),
                    updateDto.getStudentSiblings(),
                    dto -> createStudentSiblingEntity(dto, student),
                    this::updateStudentSiblingEntity,
                    studentSiblingRepository,
                    student,
                    "StudentSibling",
                    StudentSiblingDto::getId
            );

        } catch (Exception e) {
            log.error("Error during relationship updates for student ID {}: {}", student.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update student relationships: " + e.getMessage(), e);
        }
    }

    // =====================================================================
    // HELPER METHODS FOR BASIC FIELD SETTING
    // =====================================================================

    private void setBasicStudentFields(UserEntity student, StudentCreateRequestDto requestDto, String identifyNumber, String username) {
        // Set common fields
        student.setUsername(username);
        student.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        student.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : Status.ACTIVE);
        student.setEmail(requestDto.getEmail());
        student.setIdentifyNumber(identifyNumber);
        student.setStudentStatus(requestDto.getStudentStatus());

        // Set personal information
        student.setKhmerFirstName(requestDto.getKhmerFirstName());
        student.setKhmerLastName(requestDto.getKhmerLastName());
        student.setEnglishFirstName(requestDto.getEnglishFirstName());
        student.setEnglishLastName(requestDto.getEnglishLastName());
        student.setGender(requestDto.getGender());
        student.setDateOfBirth(requestDto.getDateOfBirth());
        student.setPhoneNumber(requestDto.getPhoneNumber());
        student.setCurrentAddress(requestDto.getCurrentAddress());
        student.setNationality(requestDto.getNationality());
        student.setEthnicity(requestDto.getEthnicity());
        student.setPlaceOfBirth(requestDto.getPlaceOfBirth());
        student.setProfileUrl(requestDto.getProfileUrl());

        // Set student-specific fields
        student.setMemberSiblings(requestDto.getMemberSiblings());
        student.setNumberOfSiblings(requestDto.getNumberOfSiblings());

        // Assign to class if provided
        ClassEntity classEntity = classRepository.findById(requestDto.getClassId())
                .orElseThrow(() -> new BadRequestException("Class not found with ID: " + requestDto.getClassId()));
        student.setClasses(classEntity);

        // Set STUDENT role
        Role studentRole = roleRepository.findByName(RoleEnum.STUDENT)
                .orElseThrow(() -> new BadRequestException("Student role not found"));
        student.setRoles(Collections.singletonList(studentRole));

        // Initialize collections
        student.setStudentStudiesHistory(new ArrayList<>());
        student.setStudentParent(new ArrayList<>());
        student.setStudentSibling(new ArrayList<>());
    }

    private void createInitialStudentRelationships(UserEntity savedStudent, StudentCreateRequestDto requestDto) {

        // Handle student studies history
        if (requestDto.getStudentStudiesHistories() != null && !requestDto.getStudentStudiesHistories().isEmpty()) {
            for (StudentStudiesHistoryDto dto : requestDto.getStudentStudiesHistories()) {
                StudentStudiesHistoryEntity entity = createStudentStudiesHistoryEntity(dto, savedStudent);
                studentStudiesHistoryRepository.save(entity);
            }
        }

        // Handle student parent information
        if (requestDto.getStudentParents() != null && !requestDto.getStudentParents().isEmpty()) {
            for (StudentParentDto dto : requestDto.getStudentParents()) {
                StudentParentEntity entity = createStudentParentEntity(dto, savedStudent);
                studentParentRepository.save(entity);
            }
        }

        // Handle student siblings
        if (requestDto.getStudentSiblings() != null && !requestDto.getStudentSiblings().isEmpty()) {
            for (StudentSiblingDto dto : requestDto.getStudentSiblings()) {
                StudentSiblingEntity entity = createStudentSiblingEntity(dto, savedStudent);
                studentSiblingRepository.save(entity);
            }
        }

        // Force flush to ensure all relationships are persisted
        entityManager.flush();
    }

    private void updateStudentBasicFields(UserEntity student, StudentUpdateRequestDto updateDto) {
        // Update personal info - only update fields that are provided
        if (updateDto.getEmail() != null) student.setEmail(updateDto.getEmail());
        if (updateDto.getKhmerFirstName() != null) student.setKhmerFirstName(updateDto.getKhmerFirstName());
        if (updateDto.getKhmerLastName() != null) student.setKhmerLastName(updateDto.getKhmerLastName());
        if (updateDto.getEnglishFirstName() != null) student.setEnglishFirstName(updateDto.getEnglishFirstName());
        if (updateDto.getEnglishLastName() != null) student.setEnglishLastName(updateDto.getEnglishLastName());
        if (updateDto.getGender() != null) student.setGender(updateDto.getGender());
        if (updateDto.getDateOfBirth() != null) student.setDateOfBirth(updateDto.getDateOfBirth());
        if (updateDto.getPhoneNumber() != null) student.setPhoneNumber(updateDto.getPhoneNumber());
        if (updateDto.getCurrentAddress() != null) student.setCurrentAddress(updateDto.getCurrentAddress());
        if (updateDto.getNationality() != null) student.setNationality(updateDto.getNationality());
        if (updateDto.getEthnicity() != null) student.setEthnicity(updateDto.getEthnicity());
        if (updateDto.getPlaceOfBirth() != null) student.setPlaceOfBirth(updateDto.getPlaceOfBirth());
        if (updateDto.getProfileUrl() != null) student.setProfileUrl(updateDto.getProfileUrl());
        if (updateDto.getStudentStatus() != null) student.setStudentStatus(updateDto.getStudentStatus());

        // Update student-specific fields
        if (updateDto.getMemberSiblings() != null) student.setMemberSiblings(updateDto.getMemberSiblings());
        if (updateDto.getNumberOfSiblings() != null) student.setNumberOfSiblings(updateDto.getNumberOfSiblings());

        // Update class if provided
        if (updateDto.getClassId() != null) {
            ClassEntity classEntity = classRepository.findById(updateDto.getClassId())
                    .orElseThrow(() -> new BadRequestException("Class not found with ID: " + updateDto.getClassId()));
            student.setClasses(classEntity);
        }

        // Update status if provided
        if (updateDto.getStatus() != null) {
            student.setStatus(updateDto.getStatus());
        }
    }

    // =====================================================================
    // ENTITY CREATION HELPER METHODS FOR STUDENTS
    // =====================================================================

    private StudentStudiesHistoryEntity createStudentStudiesHistoryEntity(StudentStudiesHistoryDto dto, UserEntity user) {
        StudentStudiesHistoryEntity entity = new StudentStudiesHistoryEntity();
        updateStudentStudiesHistoryEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateStudentStudiesHistoryEntity(StudentStudiesHistoryDto dto, StudentStudiesHistoryEntity entity) {
        if (dto.getTypeStudies() != null) entity.setTypeStudies(dto.getTypeStudies());
        if (dto.getSchoolName() != null) entity.setSchoolName(dto.getSchoolName());
        if (dto.getLocation() != null) entity.setLocation(dto.getLocation());
        if (dto.getFromYear() != null) entity.setFromYear(dto.getFromYear());
        if (dto.getEndYear() != null) entity.setEndYear(dto.getEndYear());
        if (dto.getObtainedCertificate() != null) entity.setObtainedCertificate(dto.getObtainedCertificate());
        if (dto.getOverallGrade() != null) entity.setOverallGrade(dto.getOverallGrade());
    }

    private StudentParentEntity createStudentParentEntity(StudentParentDto dto, UserEntity user) {
        StudentParentEntity entity = new StudentParentEntity();
        updateStudentParentEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateStudentParentEntity(StudentParentDto dto, StudentParentEntity entity) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getJob() != null) entity.setJob(dto.getJob());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getAge() != null) entity.setAge(dto.getAge());
        if (dto.getParentType() != null) entity.setParentType(dto.getParentType());
    }

    private StudentSiblingEntity createStudentSiblingEntity(StudentSiblingDto dto, UserEntity user) {
        StudentSiblingEntity entity = new StudentSiblingEntity();
        updateStudentSiblingEntity(dto, entity);
        entity.setUser(user);
        return entity;
    }

    private void updateStudentSiblingEntity(StudentSiblingDto dto, StudentSiblingEntity entity) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getGender() != null) entity.setGender(dto.getGender());
        if (dto.getDateOfBirth() != null) entity.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getOccupation() != null) entity.setOccupation(dto.getOccupation());
        if (dto.getPhoneNumber() != null) entity.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
    }
}