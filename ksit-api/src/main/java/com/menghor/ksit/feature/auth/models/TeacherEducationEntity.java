package com.menghor.ksit.feature.auth.models;

import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

// បកម្រិតវប្បធម៌
@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "teacher_education", indexes = {
    @Index(name = "idx_teacher_education_user_id", columnList = "user_id")
})
public class TeacherEducationEntity extends BaseEntity {

    private String culturalLevel; // កម្រិតវប្បធម៌
    private String skillName; // ឈ្មោះជំនាញ
    private LocalDate dateAccepted; // កាលបរិច្ឆេទទទួល
    private String country; // ប្រទេស

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
}

