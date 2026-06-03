"use client";

import { useCallback } from "react";
import { Section, SurveyFormDataModel } from "@/model/survey/survey-main-model";

export function useSurveyValidation() {
  const validateSection = useCallback(
    (section: Section, formData: SurveyFormDataModel): boolean => {
      // Get all required questions in this section
      const requiredQuestions =
        section.questions?.filter((question) => question.required) || [];

      // Check if all required questions have answers
      for (const question of requiredQuestions) {
        const questionId: any =
          question.id?.toString() || question.tempId || "";
        const answer = formData.answers?.[questionId];

        // Check if answer is missing or empty
        if (
          !answer ||
          (typeof answer === "string" && answer === "") ||
          (Array.isArray(answer) && answer.length === 0) ||
          (typeof answer === "number" &&
            answer === 0 &&
            question.questionType === "rating")
        ) {
          return false;
        }
      }

      return true;
    },
    []
  );

  const getUnansweredRequiredQuestions = useCallback(
    (section: Section, formData: SurveyFormDataModel): string[] => {
      const unansweredRequired = section.questions?.filter((question) => {
        const questionId: any =
          question.id?.toString() || question.tempId || "";
        const answer = formData.answers?.[questionId];

        return (
          question.required &&
          (!answer ||
            (typeof answer === "string" && answer === "") ||
            (Array.isArray(answer) && answer.length === 0) ||
            (typeof answer === "number" &&
              answer === 0 &&
              question.questionType === "rating"))
        );
      });

      return (
        unansweredRequired?.map((q) => q.questionText || "Untitled question") ||
        []
      );
    },
    []
  );

  const validateAllSections = useCallback(
    (
      sections: Section[],
      formData: SurveyFormDataModel
    ): { isValid: boolean; errors: Record<string, string[]> } => {
      const errors: Record<string, string[]> = {};
      let isValid = true;

      sections.forEach((section, index) => {
        const sectionErrors = getUnansweredRequiredQuestions(section, formData);
        if (sectionErrors.length > 0) {
          errors[`section_${index}`] = sectionErrors;
          isValid = false;
        }
      });

      return { isValid, errors };
    },
    [getUnansweredRequiredQuestions]
  );

  const validateQuestion = useCallback(
    (
      questionId: string,
      value: any,
      questionType?: string,
      isRequired?: boolean
    ): boolean => {
      if (!isRequired) return true;

      // Check based on question type
      switch (questionType) {
        case "multiple_choice":
          return Array.isArray(value) && value.length > 0;
        case "rating":
          return typeof value === "number" && value > 0;
        case "text":
        case "textarea":
        default:
          return typeof value === "string" && value.trim() !== "";
      }
    },
    []
  );

  return {
    validateSection,
    getUnansweredRequiredQuestions,
    validateAllSections,
    validateQuestion,
  };
}
