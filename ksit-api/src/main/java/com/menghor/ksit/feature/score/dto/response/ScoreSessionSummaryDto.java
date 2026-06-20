package com.menghor.ksit.feature.score.dto.response;

import com.menghor.ksit.enumations.SemesterEnum;
import com.menghor.ksit.enumations.SubmissionStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Lightweight DTO for score session listing — excludes studentScores to keep the payload small.
 */
@Data
public class ScoreSessionSummaryDto {
    private Long id;
    private Long scheduleId;
    private Long teacherId;
    private String teacherName;
    private Long classId;
    private String classCode;
    private Long courseId;
    private String courseName;
    private SemesterEnum semester;
    private SubmissionStatus status;
    private LocalDateTime submissionDate;
    private String teacherComments;
    private String staffComments;
    private Integer studentCount;
    private LocalDateTime createdAt;
}
