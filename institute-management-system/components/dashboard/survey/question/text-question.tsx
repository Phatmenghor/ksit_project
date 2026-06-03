"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Question,
  SurveyFormDataModel,
} from "@/model/survey/survey-main-model";
import { Control, Controller } from "react-hook-form";

interface TextQuestionProps {
  question: Question;
  questionIndex: number;
  control: Control<SurveyFormDataModel>;
}

export default function TextQuestion({
  question,
  questionIndex,
  control,
}: TextQuestionProps) {
  const questionId = question.id?.toString() || question.tempId || "";

  return (
    <Card className="space-y-4 p-5 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-lg text-gray-700">
          {questionIndex + 1}.
        </span>
        <span className="font-semibold text-gray-800">
          {question.questionText}
          {question.required && (
            <span className="text-red-600 ml-1" title="Required">
              *
            </span>
          )}
        </span>
      </div>
      <div className="ml-8">
        <Controller
          name={`answers.${questionId}` as any}
          control={control}
          rules={{
            required: question.required ? "This field is required" : false,
          }}
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Enter your response..."
                className="w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                aria-required={question.required}
                aria-label={`Response for question ${questionIndex + 1}`}
              />

              {fieldState.error && (
                <p className="text-red-500 text-sm">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </Card>
  );
}
