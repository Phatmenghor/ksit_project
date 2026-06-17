"use client";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { TextField } from "@/components/shared/form-field/text-field";

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
        <div className="mb-4 w-full md:w-1/2">
          <TextField name="workHistory" label="ស្ថានភាព" control={control} placeholder="ស្ថានភាព..." disabled={isSubmitting} />
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
