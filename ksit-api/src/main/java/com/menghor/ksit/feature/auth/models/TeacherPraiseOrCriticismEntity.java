package com.menghor.ksit.feature.auth.models;

import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

// ការសរសើរ/ ស្តីបន្ទោស
@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "teachers_praise_or_criticism", indexes = {
    @Index(name = "idx_teacher_praise_user_id", columnList = "user_id")
})
public class TeacherPraiseOrCriticismEntity extends BaseEntity {
    private String typePraiseOrCriticism; // ប្រភេទនៃការសរសើរ/ការស្តីបន្ទោស/ទទួលអធិការកិច្ច
    private String giveBy; // ផ្តល់ដោយ
    private LocalDate dateAccepted; // កាលបរិច្ឆេទទទួល

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
}