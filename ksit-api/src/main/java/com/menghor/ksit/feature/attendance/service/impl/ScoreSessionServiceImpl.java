package com.menghor.ksit.feature.attendance.service.impl;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.enumations.SubmissionStatus;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.attendance.dto.filter.ScoreSessionFilterDto;
import com.menghor.ksit.feature.attendance.dto.request.ScoreSessionRequestDto;
import com.menghor.ksit.feature.attendance.dto.response.ScoreSessionResponseDto;
import com.menghor.ksit.feature.attendance.dto.update.ScoreSessionUpdateDto;
import com.menghor.ksit.feature.attendance.mapper.ScoreSessionMapper;
import com.menghor.ksit.feature.attendance.models.ScoreConfigurationEntity;
import com.menghor.ksit.feature.attendance.models.ScoreSessionEntity;
import com.menghor.ksit.feature.attendance.models.StudentScoreEntity;
import com.menghor.ksit.feature.attendance.repository.ScoreConfigurationRepository;
import com.menghor.ksit.feature.attendance.repository.ScoreSessionRepository;
import com.menghor.ksit.feature.attendance.repository.StudentScoreRepository;
import com.menghor.ksit.feature.attendance.service.ScoreSessionService;
import com.menghor.ksit.feature.attendance.specification.ScoreSessionSpecification;
import com.menghor.ksit.feature.attendance.specification.StudentScoreSpecification;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.repository.UserRepository;
import com.menghor.ksit.feature.school.model.ScheduleEntity;
import com.menghor.ksit.feature.school.repository.ScheduleRepository;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import com.menghor.ksit.utils.database.SecurityUtils;
import com.menghor.ksit.utils.pagiantion.PaginationUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoreSessionServiceImpl implements ScoreSessionService {

    private final ScoreSessionRepository scoreSessionRepository;
    private final StudentScoreRepository studentScoreRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final ScoreConfigurationRepository scoreConfigRepository;
    private final ScoreSessionMapper scoreSessionMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public ScoreSessionResponseDto initializeScoreSession(ScoreSessionRequestDto requestDto) {

        // Check if ANY score session exists for this schedule (regardless of status)
        Specification<ScoreSessionEntity> existingSessionSpec = ScoreSessionSpecification
                .hasScheduleId(requestDto.getScheduleId());

        // Use PaginationUtils to get the latest session (page 1, size 1, sorted by createdAt DESC)
        Pageable latestFirst = PaginationUtils.createPageable(1, 1, "createdAt", "DESC");
        Page<ScoreSessionEntity> existingSessionsPage = scoreSessionRepository.findAll(existingSessionSpec, latestFirst);

        if (!existingSessionsPage.isEmpty()) {
            // Use the latest session regardless of its status
            ScoreSessionEntity latestSession = existingSessionsPage.getContent().get(0);

            return handleExistingSession(latestSession);
        } else {
            return createNewSession(requestDto);
        }
    }

    private ScoreSessionResponseDto handleExistingSession(ScoreSessionEntity session) {

        ScheduleEntity schedule = session.getSchedule();
        Long classId = schedule.getClasses().getId();

        // Get ALL current students in the class (including newly added ones)
        List<UserEntity> allStudentsInClass = findStudentsByClass(classId);

        // Get existing student scores for this session
        List<StudentScoreEntity> existingScores = findStudentScoresBySession(session.getId());

        // Create a map of existing scores by student ID for quick lookup
        Map<Long, StudentScoreEntity> existingScoresMap = existingScores.stream()
                .collect(Collectors.toMap(score -> score.getStudent().getId(), score -> score));

        // Find students who don't have scores yet (newly added to class)
        List<StudentScoreEntity> newScores = createMissingStudentScores(allStudentsInClass, existingScoresMap, session);

        if (!newScores.isEmpty()) {
            studentScoreRepository.saveAll(newScores);

            newScores.forEach(score ->
        } else {
        }

        // Refresh the session to get updated relationships
        ScoreSessionEntity refreshedSession = scoreSessionRepository.findById(session.getId()).orElse(session);

        return scoreSessionMapper.toDto(refreshedSession);
    }

    private ScoreSessionResponseDto createNewSession(ScoreSessionRequestDto requestDto) {

        ScheduleEntity schedule = findScheduleById(requestDto.getScheduleId());
        UserEntity currentUser = securityUtils.getCurrentUser();

        ScoreSessionEntity scoreSession = createScoreSessionEntity(schedule, currentUser);
        ScoreSessionEntity savedSession = scoreSessionRepository.save(scoreSession);

        List<UserEntity> students = findStudentsByClass(schedule.getClasses().getId());
        List<StudentScoreEntity> studentScores = createStudentScoresForSession(students, savedSession);

        studentScoreRepository.saveAll(studentScores);
        savedSession.setStudentScores(studentScores);

        return scoreSessionMapper.toDto(savedSession);
    }

    @Override
    public ScoreSessionResponseDto getScoreSessionById(Long id) {

        ScoreSessionEntity scoreSession = scoreSessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Score session not found with ID: " + id));

        return scoreSessionMapper.toDto(scoreSession);
    }

    @Override
    @Transactional
    public ScoreSessionResponseDto updateScoreSession(ScoreSessionUpdateDto updateDto) {

        ScoreSessionEntity scoreSession = scoreSessionRepository.findById(updateDto.getId())
                .orElseThrow(() -> new NotFoundException("Score session not found with ID: " + updateDto.getId()));

        updateScoreSessionFields(scoreSession, updateDto);

        ScoreSessionEntity updatedSession = scoreSessionRepository.save(scoreSession);

        return scoreSessionMapper.toDto(updatedSession);
    }

    @Override
    public CustomPaginationResponseDto<ScoreSessionResponseDto> getAllScoreSessions(ScoreSessionFilterDto filterDto) {

        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        Specification<ScoreSessionEntity> spec = buildScoreSessionSpecification(filterDto);

        Page<ScoreSessionEntity> scoreSessionPage = scoreSessionRepository.findAll(spec, pageable);

        List<ScoreSessionResponseDto> content = scoreSessionPage.getContent().stream()
                .map(scoreSessionMapper::toDto)
                .collect(Collectors.toList());

        return new CustomPaginationResponseDto<>(
                content,
                scoreSessionPage.getNumber() + 1,
                scoreSessionPage.getSize(),
                scoreSessionPage.getTotalElements(),
                scoreSessionPage.getTotalPages(),
                scoreSessionPage.isLast()
        );
    }

    private List<UserEntity> findStudentsByClass(Long classId) {
        return userRepository.findByClassesId(classId);
    }

    private List<StudentScoreEntity> findStudentScoresBySession(Long sessionId) {
        Specification<StudentScoreEntity> spec = StudentScoreSpecification
                .hasScoreSessionId(sessionId);

        return studentScoreRepository.findAll(spec);
    }

    private ScheduleEntity findScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NotFoundException("Schedule not found with ID: " + scheduleId));
    }

    private ScoreSessionEntity createScoreSessionEntity(ScheduleEntity schedule, UserEntity teacher) {
        ScoreSessionEntity scoreSession = new ScoreSessionEntity();
        scoreSession.setSchedule(schedule);
        scoreSession.setTeacher(teacher);
        scoreSession.setStatus(SubmissionStatus.DRAFT);
        scoreSession.setSubmissionDate(null);
        return scoreSession;
    }

    private List<StudentScoreEntity> createMissingStudentScores(
            List<UserEntity> allStudentsInClass,
            Map<Long, StudentScoreEntity> existingScoresMap,
            ScoreSessionEntity session) {

        List<StudentScoreEntity> newScores = allStudentsInClass.stream()
                .filter(student -> !existingScoresMap.containsKey(student.getId()))
                .map(student -> {
                    StudentScoreEntity newScore = createDefaultStudentScore(student, session);
                    return newScore;
                })
                .collect(Collectors.toList());

        if (!newScores.isEmpty()) {
        }

        return newScores;
    }

    private List<StudentScoreEntity> createStudentScoresForSession(List<UserEntity> students, ScoreSessionEntity session) {
        return students.stream()
                .map(student -> createDefaultStudentScore(student, session))
                .collect(Collectors.toList());
    }

    private StudentScoreEntity createDefaultStudentScore(UserEntity student, ScoreSessionEntity scoreSession) {
        StudentScoreEntity studentScore = new StudentScoreEntity();
        studentScore.setScoreSession(scoreSession);
        studentScore.setStudent(student);

        // Get and set the active score configuration
        Optional<ScoreConfigurationEntity> scoreConfig = scoreConfigRepository.findByStatus(Status.ACTIVE);
        scoreConfig.ifPresent(config -> {
            studentScore.setScoreConfiguration(config);
        });

        // Initialize all scores to 0
        studentScore.setAttendanceScore(BigDecimal.ZERO);
        studentScore.setAssignmentScore(BigDecimal.ZERO);
        studentScore.setMidtermScore(BigDecimal.ZERO);
        studentScore.setFinalScore(BigDecimal.ZERO);
        studentScore.setTotalScore(BigDecimal.ZERO);

        return studentScore;
    }

    private void updateScoreSessionFields(ScoreSessionEntity scoreSession, ScoreSessionUpdateDto updateDto) {
        if (updateDto.getStatus() != null) {
            scoreSession.setStatus(updateDto.getStatus());
            if (updateDto.getStatus() == SubmissionStatus.SUBMITTED) {
                scoreSession.setSubmissionDate(LocalDateTime.now());
            }
        }

        if (updateDto.getTeacherComments() != null) {
            scoreSession.setTeacherComments(updateDto.getTeacherComments());
        }

        if (updateDto.getStaffComments() != null) {
            scoreSession.setStaffComments(updateDto.getStaffComments());
        }
    }

    private Specification<ScoreSessionEntity> buildScoreSessionSpecification(ScoreSessionFilterDto filterDto) {
        return Specification
                .where(ScoreSessionSpecification.searchByNameOrCode(filterDto.getSearch()))
                .and(ScoreSessionSpecification.hasStatus(filterDto.getStatus()))
                .and(ScoreSessionSpecification.hasTeacherId(filterDto.getTeacherId()))
                .and(ScoreSessionSpecification.hasScheduleId(filterDto.getScheduleId()))
                .and(ScoreSessionSpecification.hasClassId(filterDto.getClassId()))
                .and(ScoreSessionSpecification.hasCourseId(filterDto.getCourseId()))
                .and(ScoreSessionSpecification.hasStudentId(filterDto.getStudentId()))
                .and(ScoreSessionSpecification.hasSemester(filterDto.getSemester()))
                .and(ScoreSessionSpecification.hasAcademyYear(filterDto.getAcademyYear()));
    }
}