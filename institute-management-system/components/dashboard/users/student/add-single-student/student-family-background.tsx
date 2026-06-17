"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import StudentSibling from "./student-sibling";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/textarea-field";

function ParentFields({ prefix, title }: { prefix: string; title: string }) {
  const { control, formState: { isSubmitting } } = useFormContext();
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground border-b pb-1">{title}</h4>
      <TextField name={`${prefix}.name`} label="ឈ្មោះ" control={control} placeholder="ឈ្មោះពេញ..." disabled={isSubmitting} />
      <div className="grid grid-cols-2 gap-3">
        <TextField name={`${prefix}.age`} label="អាយុ" control={control} placeholder="អាយុ..." disabled={isSubmitting} />
        <TextField name={`${prefix}.phone`} label="លេខទូរស័ព្ទ" control={control} placeholder="លេខទូរស័ព្ទ..." disabled={isSubmitting} />
      </div>
      <TextField name={`${prefix}.job`} label="មុខរបរ" control={control} placeholder="មុខរបរ..." disabled={isSubmitting} />
      <TextareaField name={`${prefix}.address`} label="អាសយដ្ឋាន" control={control} placeholder="ភូមិ ឃុំ/សង្កាត់ ស្រុក/ខណ្ឌ ខេត្ត..." disabled={isSubmitting} rows={2} />
      <Controller control={control} name={`${prefix}.parentType`} render={({ field }) => <input type="hidden" {...field} />} />
    </div>
  );
}

export default function StudentFamilyBackgroundSection() {
  const { setValue, watch } = useFormContext();

  useEffect(() => {
    const currentParents = watch("studentParent") || [];
    if (currentParents.length === 0) {
      setValue("studentParent", [{ parentType: "FATHER" }, { parentType: "MOTHER" }]);
    } else if (currentParents.some((p: any) => !p.parentType)) {
      setValue("studentParent", currentParents.map((p: any, i: number) => ({
        ...p,
        parentType: p.parentType || (i === 0 ? "FATHER" : "MOTHER"),
      })));
    }
  }, [setValue, watch]);

  return (
    <CollapsibleCard title="ព័ត៌មានគ្រួសារ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ParentFields prefix="studentParent.0" title="ឪពុក" />
        <ParentFields prefix="studentParent.1" title="ម្ដាយ" />
      </div>
      <div className="mt-6">
        <StudentSibling />
      </div>
    </CollapsibleCard>
  );
}
