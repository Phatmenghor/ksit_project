package com.menghor.ksit.feature.school.model;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.master.model.DepartmentEntity;
import com.menghor.ksit.feature.master.model.SubjectEntity;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "courses", indexes = {
    @Index(name = "idx_course_code", columnList = "code"),
    @Index(name = "idx_course_status", columnList = "status"),
    @Index(name = "idx_course_department_id", columnList = "department_id"),
    @Index(name = "idx_course_subject_id", columnList = "subject_id"),
    @Index(name = "idx_course_user_id", columnList = "user_id"),
    @Index(name = "idx_course_status_dept", columnList = "status, department_id")
})
public class CourseEntity extends BaseEntity {

    private String code;
    private String nameKH;
    private String nameEn;

    private Integer credit; // Number of credit hours.
    private Integer theory; // Hours of theory classes.
    private Integer execute; // Hours of practical execution.
    private Integer apply;  // Hours applied in practice.
    private Integer totalHour;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String purpose;
    @Column(columnDefinition = "TEXT")
    private String expectedOutcome;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private DepartmentEntity department;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private SubjectEntity subject;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<ScheduleEntity> schedules = new ArrayList<>();
}
