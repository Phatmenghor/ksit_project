"use client";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function PraiseCriticismForm() {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  useFieldArray({
    control: control,
    name: "teacherPraiseOrCriticism",
  });

  const isMobile = useIsMobile();

  return (
    <CollapsibleCard title="ការសរសើរ​ / ស្តីបន្ទោស">
      <DynamicInputGrid
        isSubmitting={isSubmitting}
        labels={[
          !isMobile
            ? "ប្រភេទនៃការសរសើរ/ការស្តីបន្ទោស/ទទួលអធិការកិច្ច​"
            : "ប្រភេទនៃការសរសើរ",
          "ផ្តល់ដោយ",
          "កាលបរិច្ឆេទទទួល",
        ]}
        fields={[
          {
            name: "typePraiseOrCriticism",
            type: "text",
            placeholder: "ប្រភេទ",
          },
          {
            name: "giveBy",
            type: "text",
            placeholder: "ផ្តល់ដោយ", // Textarea not yet supported directly
          },
          {
            name: "dateAccepted",
            type: "date",
            placeholder: "កាលបរិច្ឆេទទទួល",
          },
        ]}
        defaultRows={2}
        namePrefix="teacherPraiseOrCriticism"
      />
    </CollapsibleCard>
  );
}
