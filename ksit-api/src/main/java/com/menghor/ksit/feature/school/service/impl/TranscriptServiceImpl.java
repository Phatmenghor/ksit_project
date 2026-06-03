package com.menghor.ksit.feature.school.service.impl;

import com.menghor.ksit.enumations.*;
import com.menghor.ksit.exceptoins.error.BadRequestException;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.attendance.models.ScoreSessionEntity;
import com.menghor.ksit.feature.attendance.models.StudentScoreEntity;
import com.menghor.ksit.feature.attendance.repository.ScoreSessionRepository;
import com.menghor.ksit.feature.attendance.repository.StudentScoreRepository;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.repository.UserRepository;
import com.menghor.ksit.feature.school.dto.response.TranscriptCourseDto;
import com.menghor.ksit.feature.school.dto.response.TranscriptResponseDto;
import com.menghor.ksit.feature.school.dto.response.TranscriptSemesterDto;
import com.menghor.ksit.feature.school.mapper.TranscriptMapper;
import com.menghor.ksit.feature.school.model.ScheduleEntity;
import com.menghor.ksit.feature.school.repository.ScheduleRepository;
import com.menghor.ksit.feature.school.service.TranscriptService;
import com.menghor.ksit.utils.database.SecurityUtils;
import com.menghor.ksit.utils.service.GradeUtilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranscriptServiceImpl implements TranscriptService {

    private final ScheduleRepository scheduleRepository;
    private final StudentScoreRepository studentScoreRepository;
    private final ScoreSessionRepository scoreSessionRepository;
    private final UserRepository userRepository;
    private final TranscriptMapper transcriptMapper;
    private final SecurityUtils securityUtils;
    private final GradeUtilityService gradeUtilityService; // Add this dependency

    @Override
    public TranscriptResponseDto getMyCompleteTranscript() {
        UserEntity currentUser = securityUtils.getCurrentUser();
        return generateCompleteTranscript(currentUser);
    }

    @Override
    public TranscriptResponseDto getStudentCompleteTranscript(Long studentId) {
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found with ID: " + studentId));

        return generateCompleteTranscript(student);
    }

    private TranscriptResponseDto generateCompleteTranscript(UserEntity student) {

        // Validate student has a class
        if (student.getClasses() == null) {
            throw new BadRequestException("Student is not assigned to any class");
        }

        // Get ALL schedules for this student's class
        List<ScheduleEntity> allSchedules = getAllStudentSchedules(student);

        if (allSchedules.isEmpty()) {
            log.warn("No schedules found for student {}", student.getId());
            return createEmptyTranscript(student);
        }

        // Group schedules by semester and year
        Map<String, List<ScheduleEntity>> groupedSchedules = groupSchedulesBySemester(allSchedules);

        // Build complete transcript response
        TranscriptResponseDto transcript = buildCompleteTranscript(student, groupedSchedules);

        return transcript;
    }

    private List<ScheduleEntity> getAllStudentSchedules(UserEntity student) {
        // Get all schedules for student's class (no filters - everything)
        return scheduleRepository.findAll((root, query, criteriaBuilder) ->
                criteriaBuilder.and(
                        criteriaBuilder.equal(root.get("classes").get("id"), student.getClasses().getId()),
                        criteriaBuilder.equal(root.get("status"), Status.ACTIVE)
                ));
    }

    private Map<String, List<ScheduleEntity>> groupSchedulesBySemester(List<ScheduleEntity> schedules) {
        return schedules.stream()
                .filter(schedule -> schedule.getSemester() != null)
                .collect(Collectors.groupingBy(
                        schedule -> schedule.getSemester().getAcademyYear() + "_" +
                                schedule.getSemester().getSemester().name(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));
    }

    private TranscriptResponseDto buildCompleteTranscript(UserEntity student,
                                                          Map<String, List<ScheduleEntity>> groupedSchedules) {

        TranscriptResponseDto transcript = transcriptMapper.toTranscriptResponse(student);

        List<TranscriptSemesterDto> semesters = new ArrayList<>();

        // Running totals for cumulative calculation
        int totalCreditsStudied = 0;
        int totalCreditsEarned = 0;
        BigDecimal cumulativeGradePoints = BigDecimal.ZERO;

        // Sort semesters chronologically
        List<String> sortedKeys = groupedSchedules.keySet().stream()
                .sorted(this::compareSemesterKeys)
                .toList();

        for (String semesterKey : sortedKeys) {
            List<ScheduleEntity> semesterSchedules = groupedSchedules.get(semesterKey);

            TranscriptSemesterDto semesterDto = buildSemesterDto(student, semesterSchedules);

            // Update running totals
            totalCreditsStudied += semesterDto.getTotalCredits();

            // Only count earned credits for completed courses
            int semesterCreditsEarned = semesterDto.getCourses().stream()
                    .filter(course -> course.getStatus() == CourseStatusEnum.COMPLETED &&
                            isPassingGrade(course.getLetterGrade()))
                    .mapToInt(course -> course.getCredit() != null ? course.getCredit() : 0)
                    .sum();

            totalCreditsEarned += semesterCreditsEarned;

            // Calculate cumulative grade points for completed courses only
            BigDecimal semesterGradePoints = calculateSemesterGradePoints(
                    semesterDto.getCourses().stream()
                            .filter(course -> course.getStatus() == CourseStatusEnum.COMPLETED)
                            .collect(Collectors.toList())
            );
            cumulativeGradePoints = cumulativeGradePoints.add(semesterGradePoints);

            // Calculate cumulative GPA (GPAX)
            BigDecimal cumulativeGPA = totalCreditsStudied > 0 ?
                    cumulativeGradePoints.divide(BigDecimal.valueOf(totalCreditsStudied), 2, RoundingMode.HALF_UP) :
                    BigDecimal.ZERO;

            // Set GPAX
            semesterDto.setGpax(cumulativeGPA);

            semesters.add(semesterDto);
        }

        transcript.setSemesters(semesters);

        // Set overall totals
        transcript.setNumberOfCreditsStudied(totalCreditsStudied);
        transcript.setNumberOfCreditsTransferred(0); // Default to 0, can be configured later
        transcript.setTotalNumberOfCreditsEarned(totalCreditsEarned);
        transcript.setCumulativeGradePointAverage(totalCreditsStudied > 0 ?
                cumulativeGradePoints.divide(BigDecimal.valueOf(totalCreditsStudied), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO);
        transcript.setAcademicStatus(gradeUtilityService.getAcademicStanding(
                transcript.getCumulativeGradePointAverage().doubleValue()));
        transcript.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return transcript;
    }

    private TranscriptSemesterDto buildSemesterDto(UserEntity student, List<ScheduleEntity> schedules) {
        TranscriptSemesterDto semesterDto = new TranscriptSemesterDto();

        // Set semester info from first schedule
        if (!schedules.isEmpty()) {
            ScheduleEntity firstSchedule = schedules.get(0);
            if (firstSchedule.getSemester() != null) {
                semesterDto.setAcademyYear(firstSchedule.getSemester().getAcademyYear());
                semesterDto.setSemester(firstSchedule.getSemester().getSemester());
                semesterDto.setSemesterName(firstSchedule.getSemester().getSemester().name() +
                        ", " + firstSchedule.getSemester().getAcademyYear());
            }

            // Set year level from schedule or derive from academy year
            if (firstSchedule.getYearLevel() != null) {
                semesterDto.setYearLevel(firstSchedule.getYearLevel());
            } else {
                // Derive year level from academy year if not set
                assert firstSchedule.getSemester() != null;
                semesterDto.setYearLevel(deriveYearLevel(firstSchedule.getSemester().getAcademyYear()));
            }
        }

        // Build course list
        List<TranscriptCourseDto> courses = schedules.stream()
                .map(schedule -> buildCourseDto(student, schedule))
                .sorted(Comparator.comparing(TranscriptCourseDto::getCourseCode))
                .collect(Collectors.toList());

        semesterDto.setCourses(courses);

        // Calculate semester totals
        int totalCredits = courses.stream()
                .mapToInt(course -> course.getCredit() != null ? course.getCredit() : 0)
                .sum();

        // Calculate GPA for completed courses only
        List<TranscriptCourseDto> completedCourses = courses.stream()
                .filter(course -> course.getStatus() == CourseStatusEnum.COMPLETED)
                .collect(Collectors.toList());

        BigDecimal semesterGradePoints = calculateSemesterGradePoints(completedCourses);
        int completedCredits = completedCourses.stream()
                .mapToInt(course -> course.getCredit() != null ? course.getCredit() : 0)
                .sum();

        BigDecimal semesterGPA = completedCredits > 0 ?
                semesterGradePoints.divide(BigDecimal.valueOf(completedCredits), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        semesterDto.setTotalCredits(totalCredits);
        semesterDto.setGpa(semesterGPA);

        return semesterDto;
    }

    // FIXED: Complete rewrite of course DTO building with proper calculations
    private TranscriptCourseDto buildCourseDto(UserEntity student, ScheduleEntity schedule) {
        
        TranscriptCourseDto courseDto = transcriptMapper.toCourseDto(schedule);

        // Find student's score and session info for this schedule
        ScoreSessionInfo sessionInfo = findStudentScoreWithSessionInfo(student.getId(), schedule.getId());

        if (sessionInfo.scoreEntity != null && sessionInfo.scoreSession != null) {
            
            StudentScoreEntity score = sessionInfo.scoreEntity;
            ScoreSessionEntity scoreSession = sessionInfo.scoreSession;
            
            // FIXED: Manually calculate total score to ensure it's correct
            BigDecimal calculatedTotal = calculateTotalScore(score);
            
            // Update the entity's total if needed
            if (score.getTotalScore() == null || 
                score.getTotalScore().compareTo(calculatedTotal) != 0) {
                score.setTotalScore(calculatedTotal);
            }

            // FIXED: Use GradeUtilityService for proper grade calculation
            String calculatedGrade = gradeUtilityService.calculateGrade(calculatedTotal);
            if (score.getGrade() == null || !score.getGrade().equals(calculatedGrade)) {
                score.setGrade(calculatedGrade);
            }

            // Map all score data to DTO
            courseDto.setTotalScore(calculatedTotal);
            courseDto.setLetterGrade(calculatedGrade);
            courseDto.setAttendanceScore(score.getAttendanceScore());
            courseDto.setAssignmentScore(score.getAssignmentScore());
            courseDto.setMidtermScore(score.getMidtermScore());
            courseDto.setFinalScore(score.getFinalScore());

            // FIXED: Use GradeUtilityService for grade points calculation
            double gradePoints = gradeUtilityService.getGradePoint(calculatedGrade);
            courseDto.setGradePoints(BigDecimal.valueOf(gradePoints));
            courseDto.setStatus(CourseStatusEnum.COMPLETED);

            // NEW: Add submission status information
            courseDto.setSubmissionStatus(scoreSession.getStatus());
            courseDto.setScoreSessionId(scoreSession.getId());
            courseDto.setSubmissionDate(scoreSession.getSubmissionDate() != null ? 
                                       scoreSession.getSubmissionDate().toString() : null);

        } else {
            
            // No approved score found - set defaults for in progress
            courseDto.setTotalScore(BigDecimal.ZERO);
            courseDto.setLetterGrade(null);
            courseDto.setGradePoints(BigDecimal.ZERO);
            courseDto.setStatus(CourseStatusEnum.IN_PROGRESS);
            courseDto.setAttendanceScore(BigDecimal.ZERO);
            courseDto.setAssignmentScore(BigDecimal.ZERO);
            courseDto.setMidtermScore(BigDecimal.ZERO);
            courseDto.setFinalScore(BigDecimal.ZERO);
            
            // NEW: Check if there's a draft/pending session
            ScoreSessionEntity anySession = findAnyScoreSession(schedule.getId());
            if (anySession != null) {
                courseDto.setSubmissionStatus(anySession.getStatus());
                courseDto.setScoreSessionId(anySession.getId());
                courseDto.setSubmissionDate(null); // No submission date for non-approved
            } else {
                courseDto.setSubmissionStatus(null); // No session at all
                courseDto.setScoreSessionId(null);
                courseDto.setSubmissionDate(null);
            }
        }

        return courseDto;
    }

    // NEW: Helper method to calculate total score manually
    private BigDecimal calculateTotalScore(StudentScoreEntity score) {
        BigDecimal total = BigDecimal.ZERO;
        
        if (score.getAttendanceScore() != null) {
            total = total.add(score.getAttendanceScore());
        }
        if (score.getAssignmentScore() != null) {
            total = total.add(score.getAssignmentScore());
        }
        if (score.getMidtermScore() != null) {
            total = total.add(score.getMidtermScore());
        }
        if (score.getFinalScore() != null) {
            total = total.add(score.getFinalScore());
        }
        
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    // NEW: Data class to hold both score and session info
    private static class ScoreSessionInfo {
        StudentScoreEntity scoreEntity;
        ScoreSessionEntity scoreSession;
        
        ScoreSessionInfo(StudentScoreEntity scoreEntity, ScoreSessionEntity scoreSession) {
            this.scoreEntity = scoreEntity;
            this.scoreSession = scoreSession;
        }
    }

    // FIXED: Return both score and session information
    private ScoreSessionInfo findStudentScoreWithSessionInfo(Long studentId, Long scheduleId) {
        // Find approved score sessions for this schedule
        List<ScoreSessionEntity> approvedSessions = scoreSessionRepository.findAll(
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.and(
                                criteriaBuilder.equal(root.get("schedule").get("id"), scheduleId),
                                criteriaBuilder.equal(root.get("status"), SubmissionStatus.APPROVED)
                        )
        );

        // Find student's score in any of these approved sessions
        for (ScoreSessionEntity scoreSession : approvedSessions) {
            Optional<StudentScoreEntity> scoreOpt = studentScoreRepository.findAll(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.and(
                                    criteriaBuilder.equal(root.get("scoreSession").get("id"), scoreSession.getId()),
                                    criteriaBuilder.equal(root.get("student").get("id"), studentId)
                            )
            ).stream().findFirst();

            if (scoreOpt.isPresent()) {
                return new ScoreSessionInfo(scoreOpt.get(), scoreSession);
            }
        }

        return new ScoreSessionInfo(null, null);
    }

    // NEW: Find any score session (for status tracking)
    private ScoreSessionEntity findAnyScoreSession(Long scheduleId) {
        List<ScoreSessionEntity> sessions = scoreSessionRepository.findAll(
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.equal(root.get("schedule").get("id"), scheduleId)
        );
        
        // Return the latest session (highest ID)
        return sessions.stream()
                .max(Comparator.comparing(ScoreSessionEntity::getId))
                .orElse(null);
    }

    private YearLevelEnum deriveYearLevel(Integer academyYear) {
        // This is a simple derivation - you might want to implement more complex logic
        // based on your school's academic calendar
        int currentYear = LocalDateTime.now().getYear();
        int yearDifference = currentYear - academyYear;

        return switch (yearDifference) {
            case 0 -> YearLevelEnum.FIRST_YEAR;
            case 1 -> YearLevelEnum.SECOND_YEAR;
            case 2 -> YearLevelEnum.THIRD_YEAR;
            case 3 -> YearLevelEnum.FOURTH_YEAR;
            default -> YearLevelEnum.FIRST_YEAR; // Default
        };
    }

    // FIXED: Use GradeUtilityService for passing grade check
    private boolean isPassingGrade(String letterGrade) {
        if (letterGrade == null) return false;
        return gradeUtilityService.isPassing(letterGrade);
    }

    private BigDecimal calculateSemesterGradePoints(List<TranscriptCourseDto> courses) {
        return courses.stream()
                .filter(course -> course.getGradePoints() != null &&
                        course.getCredit() != null &&
                        course.getLetterGrade() != null)
                .map(course -> course.getGradePoints().multiply(BigDecimal.valueOf(course.getCredit())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private TranscriptResponseDto createEmptyTranscript(UserEntity student) {
        TranscriptResponseDto transcript = transcriptMapper.toTranscriptResponse(student);
        transcript.setSemesters(new ArrayList<>());
        transcript.setNumberOfCreditsStudied(0);
        transcript.setNumberOfCreditsTransferred(0);
        transcript.setTotalNumberOfCreditsEarned(0);
        transcript.setCumulativeGradePointAverage(BigDecimal.ZERO);
        transcript.setAcademicStatus("No Records");
        transcript.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return transcript;
    }

    private int compareSemesterKeys(String key1, String key2) {
        String[] parts1 = key1.split("_");
        String[] parts2 = key2.split("_");

        if (parts1.length != 2 || parts2.length != 2) {
            return key1.compareTo(key2);
        }

        try {
            int year1 = Integer.parseInt(parts1[0]);
            int year2 = Integer.parseInt(parts2[0]);

            if (year1 != year2) {
                return Integer.compare(year1, year2);
            }

            // Same year, compare semester (SEMESTER_1 before SEMESTER_2)
            return parts1[1].compareTo(parts2[1]);
        } catch (Exception e) {
            return key1.compareTo(key2);
        }
    }
}