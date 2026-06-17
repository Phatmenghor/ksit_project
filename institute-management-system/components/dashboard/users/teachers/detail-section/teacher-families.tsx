"use client";
import React from "react";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import { useFormContext, useFieldArray } from "react-hook-form";
import { GenderEnum } from "@/constants/constant";
import { TextField } from "@/components/shared/form-field/text-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-time-picker-field";

export default function FamilyStatusForm() {
  const { control, formState: { isSubmitting } } = useFormContext();
  useFieldArray({ control, name: "teacherFamily" });

  return (
    <CollapsibleCard title="ស្ថានភាពគ្រួសារ">
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <TextField name="maritalStatus" label="ស្ថានភាពគ្រួស" control={control} placeholder="ឋានន្តរស័ក្តិ និងថ្នាក់..." disabled={isSubmitting} />

        <div className="grid grid-cols-2 gap-2">
          <TextField name="mustBe" label="ត្រូវជា" control={control} placeholder="ត្រូវជា..." disabled={isSubmitting} />
          <TextField name="affiliatedProfession" label="មុខរបរសហព័ទ្ធ" control={control} placeholder="មុខរបរ..." disabled={isSubmitting} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <TextField name="federationName" label="ឈ្មោះសហព័ទ្ធ" control={control} placeholder="នាមត្រកូល" disabled={isSubmitting} />
          <TextField name="affiliatedOrganization" label="អង្គភាពសហព័ទ្ធ" control={control} placeholder="អង្គភាពសហព័ទ្ធ" disabled={isSubmitting} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <DateTimePickerField name="federationEstablishmentDate" label="ថ្ងៃខែឆ្នាំកំណើតសហព័ទ្ធ" control={control} disabled={isSubmitting} placeholder="ជ្រើសរើសថ្ងៃខែ..." />
          <TextField name="wivesSalary" label="ប្រាក់ខែប្រពន្ធ" control={control} placeholder="ប្រាក់ខែ..." disabled={isSubmitting} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <TextField name="phoneNumber" label="លេខទូរស័ព្ទផ្ទាល់ខ្លួន" control={control} placeholder="លេខទូរស័ព្ទ..." disabled={isSubmitting} />
          <TextField name="email" label="អ៊ីមែល" control={control} placeholder="example@email.com" disabled={isSubmitting} />
        </div>

        <TextField name="currentAddress" label="អាសយដ្ឋានបច្ចុប្បន្ន" control={control} placeholder="អាសយដ្ឋាន..." disabled={isSubmitting} />
      </div>

      <div className="mt-6">
        <DynamicInputGrid
          isSubmitting={isSubmitting}
          labels={["ឈ្មោះកូន", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "មុខរបរ"]}
          fields={[
            { name: "nameChild", type: "text", placeholder: "ឈ្មោះកូន" },
            { name: "gender", type: "select", placeholder: "ភេទ", options: [{ label: "ប្រុស", value: GenderEnum.MALE }, { label: "ស្រី", value: GenderEnum.FEMALE }] },
            { name: "dateOfBirth", type: "date", placeholder: "ថ្ងៃខែឆ្នាំកំណើត" },
            { name: "working", type: "text", placeholder: "មុខរបរ" },
          ]}
          namePrefix="teacherFamily"
          defaultRows={2}
        />
      </div>
    </CollapsibleCard>
  );
}
