"use client";
import { useFormContext } from "react-hook-form";
import { TextField } from "@/components/shared/form-field/text-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-time-picker-field";

export default function TeachingDetailForm() {
  const { control, formState: { isSubmitting } } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <TextField name="rankAndClass" label="ឋាននន្តរស័ក្តិ និងថ្នាក់" control={control} placeholder="ឋាននន្តរស័ក្តិ និងថ្នាក់..." disabled={isSubmitting} />
        <TextField name="taughtEnglish" label="បង្រៀនភាសាអង់គ្លេស" control={control} placeholder="បង្រៀនភាសាអង់គ្លេស..." disabled={isSubmitting} />
        <TextField name="threeLevelClass" label="ថ្នាក់គួបបីកម្រិត" control={control} placeholder="ថ្នាក់គួបបីកម្រិត..." disabled={isSubmitting} />
        <TextField name="referenceNote" label="យោង" control={control} placeholder="យោង..." disabled={isSubmitting} />
        <TextField name="technicalTeamLeader" label="ប្រធានក្រុមបច្ចេកទេស" control={control} placeholder="ប្រធានក្រុមបច្ចេកទេស..." disabled={isSubmitting} />
        <TextField name="assistInTeaching" label="ជួយបង្រៀន" control={control} placeholder="ជួយបង្រៀន..." disabled={isSubmitting} />
        <TextField name="serialNumber" label="លេខរៀង" control={control} placeholder="លេខរៀង..." disabled={isSubmitting} />
        <TextField name="twoLevelClass" label="ពីរថ្នាក់ណីរពេល" control={control} placeholder="ពីរថ្នាក់ណីរពេល..." disabled={isSubmitting} />
        <TextField name="classResponsibility" label="ទទួលបន្ទុកថ្នាក់" control={control} placeholder="ទទួលបន្ទុកថ្នាក់..." disabled={isSubmitting} />
        <DateTimePickerField name="lastSalaryIncrementDate" label="ថ្ងៃខែឡើងការប្រាក់ចុងក្រោយ" control={control} disabled={isSubmitting} placeholder="ជ្រើសរើសថ្ងៃខែ..." />
        <TextField name="teachAcrossSchools" label="បង្រៀនឆ្លងសាលា" control={control} placeholder="បង្រៀនឆ្លងសាលា..." disabled={isSubmitting} />
        <TextField name="overtimeHours" label="ម៉ោងលើស" control={control} placeholder="ម៉ោងលើស..." disabled={isSubmitting} />
        <DateTimePickerField name="issuedDate" label="ចុះថ្ងៃទី" control={control} disabled={isSubmitting} placeholder="ជ្រើសរើសថ្ងៃខែ..." />
        <TextField name="suitableClass" label="ថ្នាក់គួប" control={control} placeholder="ថ្នាក់គួប..." disabled={isSubmitting} />
        <TextField name="bilingual" label="ពីរភាសា" control={control} placeholder="ពីរភាសា..." disabled={isSubmitting} />
      </div>
      <TextField name="academicYearTaught" label="បង្រៀននៅឆ្នាំសិក្សា" control={control} placeholder="បង្រៀននៅឆ្នាំសិក្សា..." disabled={isSubmitting} />
    </div>
  );
}
