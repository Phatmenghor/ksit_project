"use client";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import { Input } from "@/components/ui/input";
import React from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

export default function ExperienceForm() {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  useFieldArray({
    control: control,
    name: "teacherExperience",
  });

  return (
    <div>
      <CollapsibleCard title="ប្រវត្តិការងារបន្តបន្ទាប់">
        <div className="space-y-2 grid grid-cols-1 mb-3 w-full">
          <label
            htmlFor="latin-full-name"
            className="mb-1 block text-sm font-bold"
          >
            ស្ថានភាព
          </label>
          <Controller
            control={control}
            name="workHistory"
            render={({ field }) => (
              <Input
                id="latin-first-name"
                {...field}
                disabled={isSubmitting}
                placeholder="ស្ថានភាព..."
                className="w-3/6 bg-gray-100"
              />
            )}
          />
        </div>

        <DynamicInputGrid
          labels={[
            "ការងារបន្តបន្ទាប់",
            "អង្គភាពបម្រើការងារបច្ចុប្បន្ទ",
            "ថ្ងៃចាប់ផ្តើម",
            "ថ្ងៃបញ្ចប់",
          ]}
          isSubmitting={isSubmitting}
          fields={[
            {
              name: "continuousEmployment",
              type: "text",
              placeholder: "ការងារបន្តបន្ទាប់",
            },
            {
              name: "workPlace",
              type: "text",
              placeholder: "អង្គភាពបម្រើការងារបច្ចុប្បន្ទ",
            },
            {
              name: "startDate",
              type: "date",
              placeholder: "ថ្ងៃចាប់ផ្តើម",
            },
            {
              name: "endDate",
              type: "date",
              placeholder: "ថ្ងៃបញ្ចប់",
            },
          ]}
          defaultRows={1}
          namePrefix="teacherExperience"
        />
      </CollapsibleCard>
    </div>
  );
}
