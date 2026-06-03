package com.menghor.ksit.feature.auth.models;

import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

// ឋានៈវិជ្ជាជីវៈគ្រូបង្រៀន
@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "teachers_professional_rank", indexes = {
    @Index(name = "idx_teacher_prof_rank_user_id", columnList = "user_id")
})
public class TeachersProfessionalRankEntity extends BaseEntity {
    private String typeOfProfessionalRank; // ប្រភេទឋានៈវិជ្ជាជីវៈ
    private String description; // បរិយាយ
    private String announcementNumber; // ប្រកាសលេខ
    private LocalDate dateAccepted; // កាលបរិច្ឆេទទទួល

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
}
