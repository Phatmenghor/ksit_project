package com.menghor.ksit.feature.auth.dto.request;

import com.menghor.ksit.enumations.GenderEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.enumations.StudentStatus;
import com.menghor.ksit.feature.auth.dto.relationship.StudentParentDto;
import com.menghor.ksit.feature.auth.dto.relationship.StudentSiblingDto;
import com.menghor.ksit.feature.auth.dto.relationship.StudentStudiesHistoryDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentUpdateRequestDto {

    private String khmerFirstName;
    private String khmerLastName;
    private String englishFirstName;
    private String englishLastName;
    private GenderEnum gender;
    private StudentStatus studentStatus;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String currentAddress;
    private String nationality;
    private String email;
    private String ethnicity;
    private String placeOfBirth;
    private String profileUrl;

    // Student-specific fields
    private String memberSiblings;
    private String numberOfSiblings;
    private Long classId;
    
    // FIXED: Related entities with correct field names to match JSON
    @JsonProperty("studentStudiesHistory") // Maps from JSON "studentStudiesHistory"
    @Builder.Default
    private List<StudentStudiesHistoryDto> studentStudiesHistories = new ArrayList<>();
    
    @JsonProperty("studentParent") // Maps from JSON "studentParent"
    @Builder.Default
    private List<StudentParentDto> studentParents = new ArrayList<>();
    
    @JsonProperty("studentSibling") // Maps from JSON "studentSibling"
    @Builder.Default
    private List<StudentSiblingDto> studentSiblings = new ArrayList<>();

    // Status
    private Status status;
}