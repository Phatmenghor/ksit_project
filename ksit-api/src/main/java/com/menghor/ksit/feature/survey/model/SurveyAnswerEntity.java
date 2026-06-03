package com.menghor.ksit.feature.survey.model;

import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "survey_answers", indexes = {
    @Index(name = "idx_survey_answer_response_id", columnList = "response_id"),
    @Index(name = "idx_survey_answer_question_id", columnList = "question_id"),
    @Index(name = "idx_survey_answer_rating", columnList = "ratingAnswer")
})
public class SurveyAnswerEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private SurveyResponseEntity response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SurveyQuestionEntity question;

    @Column(columnDefinition = "text") // Fixed: lowercase 'text'
    private String textAnswer;

    private Integer ratingAnswer;
}