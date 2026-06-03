package com.menghor.ksit.feature.attendance.mapper;

import com.menghor.ksit.enumations.AttendanceFinalizationStatus;
import com.menghor.ksit.enumations.AttendanceStatus;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.attendance.dto.response.AttendanceDto;
import com.menghor.ksit.feature.attendance.dto.response.AttendanceSessionDto;
import com.menghor.ksit.feature.attendance.models.AttendanceEntity;
import com.menghor.ksit.feature.attendance.models.AttendanceSessionEntity;
import com.menghor.ksit.feature.attendance.models.ScoreConfigurationEntity;
import com.menghor.ksit.feature.attendance.repository.AttendanceRepository;
import com.menghor.ksit.feature.attendance.repository.AttendanceSessionRepository;
import com.menghor.ksit.feature.attendance.repository.ScoreConfigurationRepository;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.master.model.SemesterEntity;
import com.menghor.ksit.feature.school.model.CourseEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceMapper {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final ScoreConfigurationRepository scoreConfigurationRepository;

    public AttendanceDto toDto(AttendanceEntity entity) {
        if (entity == null) {
            return null;
        }

        AttendanceDto dto = AttendanceDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .attendanceType(entity.getAttendanceType())
                .comment(entity.getComment())
                .recordedTime(entity.getRecordedTime())
                .finalizationStatus(entity.getFinalizationStatus())
                .build();

        // Map student information
        if (entity.getStudent() != null) {
            dto.setStudentId(entity.getStudent().getId());
            dto.setStudentName(mapStudentName(entity.getStudent()));
            dto.setIdentifyNumber(entity.getStudent().getIdentifyNumber());
            dto.setGender(entity.getStudent().getGender());
            dto.setDateOfBirth(entity.getStudent().getDateOfBirth());
        }

        // Map attendance session and related information
        if (entity.getAttendanceSession() != null) {
            AttendanceSessionEntity session = entity.getAttendanceSession();
            dto.setAttendanceSessionId(session.getId());

            // Teacher information
            if (session.getTeacher() != null) {
                dto.setTeacherId(session.getTeacher().getId());
                dto.setTeacherName(mapTeacherName(session.getTeacher()));
            }

            // Schedule and related information
            if (session.getSchedule() != null) {
                dto.setScheduleId(session.getSchedule().getId());

                // Course information
                if (session.getSchedule().getCourse() != null) {
                    CourseEntity course = session.getSchedule().getCourse();
                    dto.setCourseName(mapCourseName(course));
                    dto.setCourseNameKH(course.getNameKH());
                    dto.setCourseNameEn(course.getNameEn());
                    dto.setCourseCode(course.getCode());
                    dto.setCredit(course.getCredit());
                    dto.setTheory(course.getTheory());
                    dto.setExecute(course.getExecute());
                    dto.setApply(course.getApply());
                    dto.setTotalHour(course.getTotalHour());

                    if (course.getDepartment() != null) {
                        dto.setDepartmentImageUrl(course.getDepartment().getUrlLogo());
                    }
                }

                // Schedule details
                dto.setStartTime(session.getSchedule().getStartTime());
                dto.setEndTime(session.getSchedule().getEndTime());
                dto.setDay(session.getSchedule().getDay());
                dto.setYearLevel(session.getSchedule().getYearLevel());

                // Room information
                if (session.getSchedule().getRoom() != null) {
                    dto.setRoomId(session.getSchedule().getRoom().getId());
                    dto.setRoomName(session.getSchedule().getRoom().getName());
                }

                // Class information
                if (session.getSchedule().getClasses() != null) {
                    dto.setClassId(session.getSchedule().getClasses().getId());
                    dto.setClassCode(session.getSchedule().getClasses().getCode());
                }

                // Semester information
                if (session.getSchedule().getSemester() != null) {
                    SemesterEntity semester = session.getSchedule().getSemester();
                    dto.setSemesterId(semester.getId());
                    dto.setSemester(semester.getSemester());
                    dto.setSemesterName(mapSemesterName(semester));
                    dto.setAcademyYear(semester.getAcademyYear());
                }

                // Calculate attendance score information
                calculateAttendanceScoreInfo(dto, entity);
            }
        }

        return dto;
    }

    /**
     * Calculate attendance score information for the DTO
     */
    private void calculateAttendanceScoreInfo(AttendanceDto dto, AttendanceEntity entity) {
        try {
            Long scheduleId = dto.getScheduleId();
            Long studentId = dto.getStudentId();

            if (scheduleId == null || studentId == null) {
                return;
            }

            // Count total FINALIZED sessions for this schedule - FIXED VERSION
            Specification<AttendanceSessionEntity> finalizedSessionSpec = new Specification<AttendanceSessionEntity>() {
                @Override
                public Predicate toPredicate(Root<AttendanceSessionEntity> root,
                                             CriteriaQuery<?> query,
                                             CriteriaBuilder cb) {
                    List<Predicate> predicates = new ArrayList<>();
                    predicates.add(cb.equal(root.get("schedule").get("id"), scheduleId));
                    predicates.add(cb.equal(root.get("finalizationStatus"), AttendanceFinalizationStatus.FINAL));
                    return cb.and(predicates.toArray(new Predicate[0]));
                }
            };

            long totalFinalizedSessions = sessionRepository.count(finalizedSessionSpec);
            dto.setTotalSessionsConducted((int) totalFinalizedSessions);

            // Count sessions where this student was PRESENT - FIXED VERSION
            Specification<AttendanceEntity> presentSpec = new Specification<AttendanceEntity>() {
                @Override
                public Predicate toPredicate(Root<AttendanceEntity> root,
                                             CriteriaQuery<?> query,
                                             CriteriaBuilder cb) {
                    List<Predicate> predicates = new ArrayList<>();
                    predicates.add(cb.equal(root.get("student").get("id"), studentId));
                    predicates.add(cb.equal(root.get("attendanceSession").get("schedule").get("id"), scheduleId));
                    predicates.add(cb.equal(root.get("finalizationStatus"), AttendanceFinalizationStatus.FINAL));
                    predicates.add(cb.equal(root.get("status"), AttendanceStatus.PRESENT));
                    return cb.and(predicates.toArray(new Predicate[0]));
                }
            };

            long sessionsPresent = attendanceRepository.count(presentSpec);
            dto.setSessionsAttended((int) sessionsPresent);

            // Calculate attendance percentage
            BigDecimal percentage = BigDecimal.ZERO;
            if (totalFinalizedSessions > 0) {
                percentage = BigDecimal.valueOf(sessionsPresent)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalFinalizedSessions), 2, RoundingMode.HALF_UP);
            } else {
                // No sessions yet, default to 100%
                percentage = BigDecimal.valueOf(100);
            }
            dto.setAttendancePercentage(percentage);

            // Get score configuration for max attendance score
            Optional<ScoreConfigurationEntity> scoreConfigOpt = scoreConfigurationRepository.findByStatus(Status.ACTIVE);
            if (scoreConfigOpt.isPresent()) {
                Integer maxScore = scoreConfigOpt.get().getAttendancePercentage();
                dto.setMaxAttendanceScore(maxScore);

                // Calculate actual attendance score
                BigDecimal attendanceScore = percentage
                        .multiply(BigDecimal.valueOf(maxScore))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                dto.setAttendanceScore(attendanceScore);

                // Create description
                String description = String.format(
                        "Attended %d/%d sessions (%.1f%%) = %.2f/%d points",
                        sessionsPresent, totalFinalizedSessions, percentage, attendanceScore, maxScore
                );
                dto.setAttendanceScoreDescription(description);
            } else {
                // No configuration, just show percentage
                dto.setAttendanceScoreDescription(String.format(
                        "Attended %d/%d sessions (%.1f%%)",
                        sessionsPresent, totalFinalizedSessions, percentage
                ));
            }

        } catch (Exception e) {
            log.error("Error calculating attendance score info: {}", e.getMessage());
            // Set default values on error
            dto.setAttendanceScoreDescription("Score calculation pending");
        }
    }

    public AttendanceSessionDto toDto(AttendanceSessionEntity entity) {
        if (entity == null) {
            return null;
        }

        AttendanceSessionDto dto = AttendanceSessionDto.builder()
                .id(entity.getId())
                .sessionDate(entity.getSessionDate())
                .finalizationStatus(entity.getFinalizationStatus())
                .status(entity.getStatus())
                .build();

        // Map schedule information
        if (entity.getSchedule() != null) {
            dto.setScheduleId(entity.getSchedule().getId());

            if (entity.getSchedule().getRoom() != null) {
                dto.setRoomName(entity.getSchedule().getRoom().getName());
            }

            if (entity.getSchedule().getClasses() != null) {
                dto.setClassCode(entity.getSchedule().getClasses().getCode());
            }
        }

        // Map teacher information
        if (entity.getTeacher() != null) {
            dto.setTeacherId(entity.getTeacher().getId());
            dto.setTeacherName(mapTeacherName(entity.getTeacher()));
        }

        // Calculate totals
        dto.setTotalStudents(calculateTotalStudents(entity));
        dto.setTotalPresent(calculateTotalPresent(entity));
        dto.setTotalAbsent(calculateTotalAbsent(entity));

        // Sort and map attendances (each will have calculated scores)
        if (entity.getAttendances() != null) {
            dto.setAttendances(sortAttendances(entity.getAttendances()));
        } else {
            dto.setAttendances(new ArrayList<>());
        }

        // Calculate session summary information
        calculateSessionSummaryInfo(dto, entity);

        return dto;
    }

    /**
     * Calculate session summary information
     */
    private void calculateSessionSummaryInfo(AttendanceSessionDto dto, AttendanceSessionEntity entity) {
        try {
            Long scheduleId = entity.getSchedule() != null ? entity.getSchedule().getId() : null;

            if (scheduleId != null) {
                // Count total FINALIZED sessions for this schedule - FIXED VERSION
                Specification<AttendanceSessionEntity> finalizedSessionSpec = new Specification<AttendanceSessionEntity>() {
                    @Override
                    public Predicate toPredicate(Root<AttendanceSessionEntity> root,
                                                 CriteriaQuery<?> query,
                                                 CriteriaBuilder cb) {
                        List<Predicate> predicates = new ArrayList<>();
                        predicates.add(cb.equal(root.get("schedule").get("id"), scheduleId));
                        predicates.add(cb.equal(root.get("finalizationStatus"), AttendanceFinalizationStatus.FINAL));
                        return cb.and(predicates.toArray(new Predicate[0]));
                    }
                };

                long totalFinalizedSessions = sessionRepository.count(finalizedSessionSpec);
                dto.setTotalSessionsConductedForSchedule((int) totalFinalizedSessions);

                // Calculate attendance percentage for this session
                if (dto.getTotalStudents() != null && dto.getTotalStudents() > 0) {
                    BigDecimal percentage = BigDecimal.valueOf(dto.getTotalPresent())
                            .multiply(BigDecimal.valueOf(100))
                            .divide(BigDecimal.valueOf(dto.getTotalStudents()), 2, RoundingMode.HALF_UP);
                    dto.setSessionAttendancePercentage(percentage);

                    // Create description
                    String description = String.format(
                            "Session %d of %d: %d/%d students present (%.1f%%)",
                            entity.getFinalizationStatus() == AttendanceFinalizationStatus.FINAL ? totalFinalizedSessions : totalFinalizedSessions + 1,
                            entity.getFinalizationStatus() == AttendanceFinalizationStatus.FINAL ? totalFinalizedSessions : totalFinalizedSessions + 1,
                            dto.getTotalPresent(), dto.getTotalStudents(), percentage
                    );
                    dto.setSessionAttendanceDescription(description);
                } else {
                    dto.setSessionAttendancePercentage(BigDecimal.ZERO);
                    dto.setSessionAttendanceDescription("No students in class");
                }

                // Indicate if this session counts towards score
                dto.setCountsTowardsScore(entity.getFinalizationStatus() == AttendanceFinalizationStatus.FINAL);
            }

        } catch (Exception e) {
            log.error("Error calculating session summary info: {}", e.getMessage());
            dto.setSessionAttendanceDescription("Summary calculation pending");
            dto.setCountsTowardsScore(false);
        }
    }

    // Helper method to sort attendances: PRESENT first, then by createdAt
    private List<AttendanceDto> sortAttendances(List<AttendanceEntity> attendances) {
        if (attendances == null || attendances.isEmpty()) {
            return new ArrayList<>();
        }

        return attendances.stream()
                .sorted(Comparator
                        .comparing((AttendanceEntity a) -> a.getStatus().ordinal())
                        .thenComparing(AttendanceEntity::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Helper method to handle the student name logic
    private String mapStudentName(UserEntity student) {
        if (student == null) {
            return null;
        }

        // Check if English names are available and not null
        if (student.getEnglishFirstName() != null && student.getEnglishLastName() != null) {
            return student.getEnglishFirstName() + " " + student.getEnglishLastName();
        }

        // Fallback to Khmer names
        if (student.getKhmerFirstName() != null && student.getKhmerLastName() != null) {
            return student.getKhmerFirstName() + " " + student.getKhmerLastName();
        }

        // If all names are null, return null
        return null;
    }

    // Helper method to handle the teacher name logic
    private String mapTeacherName(UserEntity teacher) {
        if (teacher == null) {
            return null;
        }

        // Check if English names are available and not null
        if (teacher.getEnglishFirstName() != null && teacher.getEnglishLastName() != null) {
            return teacher.getEnglishFirstName() + " " + teacher.getEnglishLastName();
        }

        // Fallback to Khmer names
        if (teacher.getKhmerFirstName() != null && teacher.getKhmerLastName() != null) {
            return teacher.getKhmerFirstName() + " " + teacher.getKhmerLastName();
        }

        // If all names are null, return username or null
        return teacher.getUsername();
    }

    // Helper method to handle the course name logic
    private String mapCourseName(CourseEntity course) {
        if (course == null) {
            return null;
        }

        // Prefer English name, fallback to Khmer name, then fallback to code
        if (course.getNameEn() != null && !course.getNameEn().trim().isEmpty()) {
            return course.getNameEn();
        }

        if (course.getNameKH() != null && !course.getNameKH().trim().isEmpty()) {
            return course.getNameKH();
        }

        if (course.getCode() != null && !course.getCode().trim().isEmpty()) {
            return course.getCode();
        }

        return "Course #" + course.getId();
    }

    // Helper method to handle the semester name logic
    private String mapSemesterName(SemesterEntity semester) {
        if (semester == null) {
            return null;
        }

        // Create a readable semester name like "Semester 1, 2024"
        String semesterName = "";
        if (semester.getSemester() != null) {
            semesterName = semester.getSemester().name().replace("_", " ");
            // Convert "SEMESTER 1" to "Semester 1"
            semesterName = semesterName.substring(0, 1).toUpperCase() +
                    semesterName.substring(1).toLowerCase();
        }

        if (semester.getAcademyYear() != null) {
            semesterName += ", " + semester.getAcademyYear();
        }

        return semesterName.isEmpty() ? "Semester #" + semester.getId() : semesterName;
    }

    // Count calculation methods
    private Long calculateTotalStudents(AttendanceSessionEntity entity) {
        if (entity == null || entity.getAttendances() == null) {
            return 0L;
        }
        return (long) entity.getAttendances().size();
    }

    private Long calculateTotalPresent(AttendanceSessionEntity entity) {
        if (entity == null || entity.getAttendances() == null) {
            return 0L;
        }
        return entity.getAttendances().stream()
                .filter(attendance -> attendance.getStatus() == AttendanceStatus.PRESENT)
                .count();
    }

    private Long calculateTotalAbsent(AttendanceSessionEntity entity) {
        if (entity == null || entity.getAttendances() == null) {
            return 0L;
        }
        return entity.getAttendances().stream()
                .filter(attendance -> attendance.getStatus() == AttendanceStatus.ABSENT)
                .count();
    }
}