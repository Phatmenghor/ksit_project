"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { educationLevels } from "@/constants/constant";
import { TextField } from "@/components/shared/form-field/text-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-time-picker-field";

export const StudentStudiesHistorySection = () => {
  const {
    control,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();

  useEffect(() => {
    educationLevels.forEach((level, index) => {
      setValue(`studentStudiesHistory.${index}.typeStudies`, level.value, {
        shouldValidate: false,
        shouldDirty: false,
      });
    });
  }, [setValue]);

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 space-y-6">
        <h3 className="text-lg font-semibold">ប្រវត្តិការសិក្សា</h3>

        {educationLevels.map((level, index) => (
          <div key={level.value} className="rounded-lg border p-4 space-y-4">
            <div className="text-sm font-semibold border-b pb-2">
              {level.label}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <TextField
                name={`studentStudiesHistory.${index}.schoolName`}
                label="ឈ្មោះសាលារៀន"
                control={control}
                placeholder="ឈ្មោះសាលារៀន..."
                disabled={isSubmitting}
              />
              <TextField
                name={`studentStudiesHistory.${index}.location`}
                label="ខេត្ត/រាជធានី"
                control={control}
                placeholder="ខេត្ត/រាជធានី..."
                disabled={isSubmitting}
              />
              <TextField
                name={`studentStudiesHistory.${index}.obtainedCertificate`}
                label="សញ្ញាបត្រទទួលបាន"
                control={control}
                placeholder="សញ្ញាបត្រ..."
                disabled={isSubmitting}
              />
              <DateTimePickerField
                name={`studentStudiesHistory.${index}.fromYear`}
                label="ពីឆ្នាំណា"
                control={control}
                disabled={isSubmitting}
                placeholder="ពីឆ្នាំ..."
              />
              <DateTimePickerField
                name={`studentStudiesHistory.${index}.endYear`}
                label="ដល់ឆ្នាំណា"
                control={control}
                disabled={isSubmitting}
                placeholder="ដល់ឆ្នាំ..."
              />
              <TextField
                name={`studentStudiesHistory.${index}.overallGrade`}
                label="ពិន្ទុសរុប"
                control={control}
                placeholder="ពិន្ទុសរុប..."
                disabled={isSubmitting}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
