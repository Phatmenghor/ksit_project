package com.menghor.ksit.feature.auth.models;

import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

// វគ្គគរុកោសល្យ
@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "teacher_vocational", indexes = {
    @Index(name = "idx_teacher_vocational_user_id", columnList = "user_id")
})
public class TeacherVocationalEntity extends BaseEntity {
    private String culturalLevel; // កម្រិតវិជ្ជាជីវៈ
    private String skillOne; // ឯកទេសទី១
    private String skillTwo; // ឯកទេសទី២
    private String trainingSystem; // ប្រព័ន្ធបណ្តុះបណ្តាល
    private LocalDate dateAccepted; // ថ្ងៃខែបានទទួល

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
}

