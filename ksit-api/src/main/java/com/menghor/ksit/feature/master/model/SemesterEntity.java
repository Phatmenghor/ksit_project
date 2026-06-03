package com.menghor.ksit.feature.master.model;

import com.menghor.ksit.enumations.SemesterEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.school.model.ScheduleEntity;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "semesters", indexes = {
    @Index(name = "idx_semester_status", columnList = "status"),
    @Index(name = "idx_semester_academy_year", columnList = "academyYear"),
    @Index(name = "idx_semester_semester", columnList = "semester"),
    @Index(name = "idx_semester_start_date", columnList = "startDate"),
    @Index(name = "idx_semester_end_date", columnList = "endDate"),
    @Index(name = "idx_semester_year_sem", columnList = "academyYear, semester")
})
public class SemesterEntity extends BaseEntity {

    private LocalDate startDate;
    private LocalDate endDate;

    private Integer academyYear;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private SemesterEnum semester;

    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL)
    private List<ScheduleEntity> schedules = new ArrayList<>();
}
