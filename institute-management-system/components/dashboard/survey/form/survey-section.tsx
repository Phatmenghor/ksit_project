"use client";

import { Card } from "@/components/ui/card";
import { Section, SurveyFormDataModel } from "@/model/survey/survey-main-model";
import { Control } from "react-hook-form";
import QuestionRenderer from "./survey-question-renderer";

interface SurveySectionProps {
  section: Section;
  control: Control<SurveyFormDataModel>;
}

export default function SurveySection({
  section,
  control,
}: SurveySectionProps) {
  const sortedQuestions =
    section.questions?.sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    ) || [];

  return (
    <div className="space-y-5">
      {sortedQuestions.map((question, index) => {
        const questionId = question.id?.toString() || question.tempId || "";
        return (
          <QuestionRenderer
            key={questionId}
            question={question}
            questionIndex={index}
            control={control}
          />
        );
      })}
    </div>
  );
}
