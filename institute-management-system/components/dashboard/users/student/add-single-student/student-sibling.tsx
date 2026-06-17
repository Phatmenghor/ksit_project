"use client";
import { useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import { GenderEnum } from "@/constants/constant";

export default function StudentSibling() {
  const {
    control,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useFormContext();

  const { fields: siblingFields } = useFieldArray({
    control,
    name: "studentSibling",
  });

  const siblingCount = siblingFields.length;

  useEffect(() => {
    setValue("numberOfSiblings", String(siblingCount));
    setValue("memberSiblings", String(siblingCount));
  }, [siblingCount, setValue]);

  return (
    <div className="space-y-4">
      <div className="hidden">
        <Controller control={control} name="numberOfSiblings" render={({ field }) => <input {...field} readOnly />} />
        <Controller control={control} name="memberSiblings" render={({ field }) => <input {...field} readOnly />} />
      </div>

      <h4 className="text-sm font-semibold text-foreground border-b pb-1">
        ព័ត៌មានបងប្អូន (ចំនួនបងប្អូនសរុប: {siblingCount} នាក់)
      </h4>

      <DynamicInputGrid
        isSubmitting={isSubmitting}
        labels={["ឈ្មោះ", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "មុខរបរ", "លេខទូរស័ព្ទ"]}
        fields={[
          { name: "name", type: "text", placeholder: "ឈ្មោះ" },
          {
            name: "gender",
            type: "select",
            placeholder: "ភេទ",
            options: [
              { label: "ប្រុស", value: GenderEnum.MALE },
              { label: "ស្រី", value: GenderEnum.FEMALE },
            ],
          },
          { name: "dateOfBirth", type: "date", placeholder: "ថ្ងៃខែឆ្នាំកំណើត" },
          { name: "occupation", type: "text", placeholder: "មុខរបរ" },
          { name: "phoneNumber", type: "text", placeholder: "លេខទូរស័ព្ទ" },
        ]}
        namePrefix="studentSibling"
        defaultRows={1}
      />
    </div>
  );
}
