"use client";

import {
  Question,
  SurveyFormDataModel,
} from "@/model/survey/survey-main-model";
import { QuestionTypeEnum } from "@/constants/constant";
import { Control } from "react-hook-form";
import RatingQuestion from "../question/rating-question";
import TextQuestion from "../question/text-question";

interface QuestionRendererProps {
  question: Question;
  questionIndex: number;
  control: Control<SurveyFormDataModel>;
}

export default function QuestionRenderer({
  question,
  questionIndex,
  control,
}: QuestionRendererProps) {
  switch (question.questionType) {
    case QuestionTypeEnum.RATING:
      return (
        <RatingQuestion
          question={question}
          questionIndex={questionIndex}
          control={control}
        />
      );

    case QuestionTypeEnum.TEXT:
      return (
        <TextQuestion
          question={question}
          questionIndex={questionIndex}
          control={control}
        />
      );

    default:
      return null;
  }
}
