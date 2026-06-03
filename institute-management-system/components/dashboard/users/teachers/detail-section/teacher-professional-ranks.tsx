"use client";
import { Separator } from "@/components/ui/separator";
import React from "react";
import TeachingDetailForm from "./teacher-detail-form";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function EducationForm() {
  const {
    control,
    register,
    formState: { isSubmitting },
  } = useFormContext();

  useFieldArray({
    control: control,
    name: "teachersProfessionalRank",
  });

  return (
    <CollapsibleCard title="ឋានៈវិជ្ជាជីវៈគ្រូបង្រៀន">
      <div className="space-y-6">
        <DynamicInputGrid
          labels={[
            "ប្រភេទឋានៈវិជ្ជាជីវៈ",
            "បរិយាយ",
            "ប្រកាសលេខ",
            "កាលបរិច្ឆេទទទួល",
          ]}
          isSubmitting={isSubmitting}
          fields={[
            {
              name: "typeOfProfessionalRank",
              type: "text",
              placeholder: "ប្រភេទឋានៈវិជ្ជាជីវៈ",
            },
            { name: "description", type: "text", placeholder: "បរិយាយ" },
            {
              name: "announcementNumber",
              type: "text",
              placeholder: "ប្រកាសលេខ",
            },
            { name: "dateAccepted", type: "date", placeholder: "mm/dd/yyyy" },
          ]}
          defaultRows={2}
          namePrefix="teachersProfessionalRank"
        />

        <Separator />

        <TeachingDetailForm />
      </div>
    </CollapsibleCard>
  );
}
