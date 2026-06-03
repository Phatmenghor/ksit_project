package com.menghor.ksit.feature.auth.models;

import com.menghor.ksit.enumations.EducationLevelEnum;
import com.menghor.ksit.enumations.ParentEnum;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

// ព័ត៌មានគ្រួសារ
@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "student_parent", indexes = {
    @Index(name = "idx_student_parent_user_id", columnList = "user_id"),
    @Index(name = "idx_student_parent_type", columnList = "parentType")
})
public class StudentParentEntity extends BaseEntity {

    private String name; // ឈ្មោះឪពុកម្តាយ
    private String phone; // លេខទូរស័ព្ទ
    private String job; // មុខរបរ
    private String address; // អាសយដ្ឋាន
    private String age; // អាយុ

    @Enumerated(EnumType.STRING)
    private ParentEnum parentType; // ប្រភេទឪពុកម្តាយ

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
}

