"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import {
  Question,
  SurveyFormDataModel,
} from "@/model/survey/survey-main-model";
import { Control, Controller } from "react-hook-form";

interface RatingQuestionProps {
  question: Question;
  questionIndex: number;
  control: Control<SurveyFormDataModel>;
}

export default function RatingQuestion({
  question,
  questionIndex,
  control,
}: RatingQuestionProps) {
  const questionId = question.id?.toString() || question.tempId || "";

  return (
    <Card className="space-y-4 p-5 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Question text */}
      <div className="flex gap-2">
        <span className="font-medium">{questionIndex + 1}.</span>
        <span className="font-medium">
          {question.questionText}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </div>
      <Separator className="bg-gray-300" />

      {/* Rating line */}
      <Controller
        name={`answers.${questionId}` as any}
        control={control}
        rules={{
          required: question.required ? "This field is required" : false,
        }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-4">
              {/* Min label */}
              {question.leftLabel && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  ({question.minRating}) {question.leftLabel}
                </span>
              )}

              {/* Custom toggleable "radio" group */}
              <div className="flex gap-4">
                {question.ratingOptions?.map((option) => {
                  const isSelected = field.value === option.value;

                  const handleClick = () => {
                    if (isSelected) {
                      field.onChange("");
                    } else {
                      field.onChange(option.value);
                    }
                  };

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      onClick={handleClick}
                      className={`w-5 h-5 p-0 rounded-full border flex items-center justify-center transition-colors duration-150 ${
                        isSelected
                          ? "bg-teal-600 border-teal-600 text-white"
                          : "bg-white hover:bg-gray-200 border-gray-400 text-gray-700"
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </Button>
                  );
                })}
              </div>

              {/* Max label */}
              {question.rightLabel && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  ({question.maxRating}) {question.rightLabel}
                </span>
              )}
            </div>
            {fieldState.error && (
              <p className="text-red-500 text-sm text-center">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </Card>
  );
}
