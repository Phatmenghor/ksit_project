"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { GenderEnum } from "@/constants/constant";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import { TextField } from "@/components/shared/form-field/text-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-time-picker-field";
import { SelectField } from "@/components/shared/form-field/select-field";

const GENDER_OPTIONS = [
  { label: "ប្រុស", value: GenderEnum.MALE },
  { label: "ស្រី", value: GenderEnum.FEMALE },
];

export default function PersonalHistoryForm() {
  const { control, formState: { isSubmitting } } = useFormContext();

  return (
    <CollapsibleCard title="ប្រវត្តិផ្ទាល់គ្រូបង្រៀន">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">

        {/* Khmer Name (split) */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">នាមត្រកូល និងនាមខ្លួន</span>
          <div className="flex gap-2">
            <TextField name="khmerFirstName" control={control} placeholder="នាមត្រកូល..." disabled={isSubmitting} />
            <TextField name="khmerLastName" control={control} placeholder="នាមខ្លួន..." disabled={isSubmitting} />
          </div>
        </div>

        <TextField name="payrollAccountNumber" label="លេខគណនីបៀវត្ស" control={control} placeholder="លេខគណនីបៀវត្ស..." disabled={isSubmitting} />

        {/* English Name (split) */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">ជាអក្សរឡាតាំង</span>
          <div className="flex gap-2">
            <TextField name="englishFirstName" control={control} placeholder="First name..." disabled={isSubmitting} />
            <TextField name="englishLastName" control={control} placeholder="Last name..." disabled={isSubmitting} />
          </div>
        </div>

        <TextField name="cppMembershipNumber" label="លេខសមាជិកបសបខ" control={control} placeholder="លេខសមាជិកបសបខ..." disabled={isSubmitting} />

        <SelectField name="gender" label="ភេទ" control={control} placeholder="សូមជ្រើសរើស" disabled={isSubmitting} options={GENDER_OPTIONS} />

        <DateTimePickerField name="startWorkDate" label="ថ្ងៃខែឆ្នាំចូលបម្រើការងារ" control={control} disabled={isSubmitting} placeholder="ជ្រើសរើសថ្ងៃខែ..." />

        <DateTimePickerField name="dateOfBirth" label="ថ្ងៃខែឆ្នាំកំណើត" control={control} disabled={isSubmitting} placeholder="ជ្រើសរើសថ្ងៃខែ..." />

        <DateTimePickerField name="currentPositionDate" label="ថ្ងៃខែឆ្នាំតែងតាំងស៊ុប" control={control} disabled={isSubmitting} placeholder="ជ្រើសរើសថ្ងៃខែ..." />

        <div className="grid grid-cols-2 gap-2">
          <TextField name="ethnicity" label="ជនជាតិ" control={control} placeholder="ជនជាតិ" disabled={isSubmitting} />
          <TextField name="disability" label="ពិការ" control={control} placeholder="បញ្ហាពិការ..." disabled={isSubmitting} />
        </div>

        <TextField name="employeeWork" label="អង្គភាពបម្រើការងារ" control={control} placeholder="អង្គភាពបម្រើការងារ..." disabled={isSubmitting} />

        <TextField name="staffId" label="អត្តលេខមន្ត្រី" control={control} placeholder="អត្តលេខមន្ត្រី..." disabled={isSubmitting} />

        <TextField name="decreeFinal" label="ប្រកាស" control={control} placeholder="ប្រកាស..." disabled={isSubmitting} />

        {/* Province / District / Commune / Village — spans full row */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          <TextField name="village" label="ភូមិ" control={control} placeholder="ភូមិ..." disabled={isSubmitting} />
          <TextField name="commune" label="ឃុំ / សង្កាត់" control={control} placeholder="ឃុំ / សង្កាត់..." disabled={isSubmitting} />
          <TextField name="district" label="ស្រុក / ខណ្ឌ" control={control} placeholder="ស្រុក / ខណ្ឌ..." disabled={isSubmitting} />
          <TextField name="province" label="ខេត្ត / រាជធានី" control={control} placeholder="ខេត្ត / រាជធានី..." disabled={isSubmitting} />
        </div>

        <TextField name="nationalId" label="លេខអត្តសញ្ញាណបណ្ណ" control={control} placeholder="លេខអត្តសញ្ញាណបណ្ណ..." disabled={isSubmitting} />
        <TextField name="officeName" label="ការិយាល័យ" control={control} placeholder="ការិយាល័យ" disabled={isSubmitting} />
        <TextField name="placeOfBirth" label="ទីកន្លែងកំណើត" control={control} placeholder="ទីកន្លែងកំណើត" disabled={isSubmitting} />
        <TextField name="currentPosition" label="មុខតំណែង" control={control} placeholder="មុខតំណែង..." disabled={isSubmitting} />
      </div>

    </CollapsibleCard>
  );
}
