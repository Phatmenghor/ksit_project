package com.menghor.ksit.feature.master.model;

import com.menghor.ksit.enumations.DegreeEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.enumations.YearLevelEnum;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.school.model.ScheduleEntity;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "classes", indexes = {
    @Index(name = "idx_class_code", columnList = "code"),
    @Index(name = "idx_class_major_id", columnList = "major_id"),
    @Index(name = "idx_class_degree", columnList = "degree"),
    @Index(name = "idx_class_year_level", columnList = "yearLevel"),
    @Index(name = "idx_class_status", columnList = "status"),
    @Index(name = "idx_class_academy_year", columnList = "academyYear"),
    @Index(name = "idx_class_status_year", columnList = "status, academyYear")
})
public class ClassEntity extends BaseEntity {

    @Column(name = "code", nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private DegreeEnum degree;          // bachelor

    @Enumerated(EnumType.STRING)
    private YearLevelEnum yearLevel;    // first year

    @Enumerated(EnumType.STRING)
    private Status status;

    private Integer academyYear;         // 2025, 2026

    @ManyToOne
    @JoinColumn(name = "major_id")
    private MajorEntity major;

    // Students enrolled in this class
    @OneToMany(mappedBy = "classes", cascade = CascadeType.ALL)
    private List<UserEntity> students = new ArrayList<>();

    @OneToMany(mappedBy = "classes", cascade = CascadeType.ALL)
    private List<ScheduleEntity> schedule = new ArrayList<>();
}
