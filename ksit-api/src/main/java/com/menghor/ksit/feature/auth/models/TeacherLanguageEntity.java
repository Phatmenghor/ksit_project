package com.menghor.ksit.feature.auth.models;

import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;


// ភាសាបរទេស
@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "teacher_language", indexes = {
    @Index(name = "idx_teacher_language_user_id", columnList = "user_id")
})
public class TeacherLanguageEntity extends BaseEntity {
    private String language; // ផ្នែភាសា
    private String reading; // ការអាន
    private String writing; // ការសរសេរ
    private String speaking; // ការសន្ទនា

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
}


