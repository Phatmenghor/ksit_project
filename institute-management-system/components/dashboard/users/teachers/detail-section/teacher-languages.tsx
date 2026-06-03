"use client";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function LanguageForm() {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  useFieldArray({
    control: control,
    name: "teacherLanguage",
  });

  return (
    <CollapsibleCard title="ភាសាបរទេស">
      <DynamicInputGrid
        isSubmitting={isSubmitting}
        labels={["ភាសា", "ការអាន", "ការសរសេរ", "ការសន្ទនា"]}
        fields={[
          {
            name: "language",
            type: "text",
            placeholder: "ភាសា",
          },
          {
            name: "reading",
            type: "text",
            placeholder: "ការអាន",
          },
          {
            name: "writing",
            type: "text",
            placeholder: "ការសរសេរ",
          },
          {
            name: "speaking",
            type: "text",
            placeholder: "ការសន្ទនា",
          },
        ]}
        namePrefix="teacherLanguage"
        defaultRows={2}
      />
    </CollapsibleCard>
  );
}
