"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { educationLevels } from "@/constants/constant";

export const StudentStudiesHistorySection = () => {
  const { control, setValue, watch } = useFormContext();

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
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-semibold">ប្រវត្តិការសិក្សា</h3>

        <Card
          className="overflow-x-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#000000 #d1d5db" }}
        >
          <CardContent className="p-3">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 gap-2 font-semibold text-sm mb-4">
                <span>កម្រិតថ្នាក់</span>
                <span>ឈ្មោះសាលារៀន</span>
                <span>ខេត្ត/រាជធានី</span>
                <span>ពីឆ្នាំណា</span>
                <span>ដល់ឆ្នាំណា</span>
                <span>សញ្ញាបត្រទទួលបាន</span>
                <span>ពិន្ទុសរុប</span>
              </div>

              {educationLevels.map((level, index) => {
                const fromYear = watch(
                  `studentStudiesHistory.${index}.fromYear`
                );
                const endYear = watch(`studentStudiesHistory.${index}.endYear`);

                return (
                  <div
                    key={level.value}
                    className="grid grid-cols-7 gap-4 items-center mb-4"
                  >
                    {/* Level (static) */}
                    <div className="text-sm font-semibold">{level.label}</div>

                    {/* School Name */}
                    <Controller
                      name={`studentStudiesHistory.${index}.schoolName`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="សាលា" {...field} />
                      )}
                    />

                    {/* Location */}
                    <Controller
                      name={`studentStudiesHistory.${index}.location`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="ទីតាំង" {...field} />
                      )}
                    />

                    {/* From Year (Date Input) */}
                    <Controller
                      name={`studentStudiesHistory.${index}.fromYear`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="date"
                          className="text-sm"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />

                    {/* End Year (Date Input) */}
                    <Controller
                      name={`studentStudiesHistory.${index}.endYear`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="date"
                          className="text-sm"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />

                    {/* Obtained Certificate */}
                    <Controller
                      name={`studentStudiesHistory.${index}.obtainedCertificate`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="សញ្ញាបត្រ" {...field} />
                      )}
                    />

                    {/* Overall Grade */}
                    <Controller
                      name={`studentStudiesHistory.${index}.overallGrade`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="ពិន្ទុសរុប" {...field} />
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
