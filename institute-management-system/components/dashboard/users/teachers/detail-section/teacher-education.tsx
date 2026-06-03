"use client";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function EducatonForm() {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  useFieldArray({
    control: control,
    name: "teacherEducation",
  });

  return (
    <CollapsibleCard title="កម្រិតវប្បធម៌">
      <DynamicInputGrid
        isSubmitting={isSubmitting}
        labels={["កម្រិតវប្បធម៌​", "ឈ្មោះជំនាញ", "កាលបរិច្ឆេទទទួល", "ប្រទេស"]}
        fields={[
          {
            name: "culturalLevel",
            type: "text",
            placeholder: "កម្រិតវប្បធម៌​",
          },
          {
            name: "skillName",
            type: "text",
            placeholder: "ឈ្មោះជំនាញ", // Textarea not yet supported directly
          },
          {
            name: "dateAccepted",
            type: "date",
            placeholder: "កាលបរិច្ឆេទទទួល",
          },
          {
            name: "country",
            type: "text",
            placeholder: "ប្រទេស",
          },
        ]}
        defaultRows={2}
        namePrefix="teacherEducation"
      />
    </CollapsibleCard>
  );
}
