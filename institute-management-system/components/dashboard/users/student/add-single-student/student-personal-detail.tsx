"use client";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { studentStatuses } from "@/constants/constant";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "@/components/shared/form-field/text-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-time-picker-field";

export default function StudentPersonalDetailSection() {
  const { control, formState: { isSubmitting } } = useFormContext();

  return (
    <CollapsibleCard title="ប្រវត្តិផ្ទាល់">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">

        {/* Khmer Name (split) */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">នាមត្រកូល និងនាមខ្លួន</span>
          <div className="flex gap-2">
            <TextField name="khmerFirstName" control={control} placeholder="នាមត្រកូល..." disabled={isSubmitting} />
            <TextField name="khmerLastName" control={control} placeholder="នាមខ្លួន..." disabled={isSubmitting} />
          </div>
        </div>

        {/* English Name (split) */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">ជាអក្សរឡាតាំង</span>
          <div className="flex gap-2">
            <TextField name="englishFirstName" control={control} placeholder="First name..." disabled={isSubmitting} />
            <TextField name="englishLastName" control={control} placeholder="Last name..." disabled={isSubmitting} />
          </div>
        </div>

        <div className="flex gap-4">
          <TextField name="nationality" label="ជនជាតិ" control={control} placeholder="ជនជាតិ..." disabled={isSubmitting} className="flex-1" />
          <TextField name="ethnicity" label="សញ្ជាតិ" control={control} placeholder="សញ្ជាតិ..." disabled={isSubmitting} className="flex-1" />
        </div>

        <div className="flex gap-4">
          {/* Gender — keep shadcn Select (enum values) */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-foreground">ភេទ</label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="សូមជ្រើសរើសភេទ">
                      {field.value === "MALE" ? "ប្រុស" : field.value === "FEMALE" ? "ស្រី" : "សូមជ្រើសរើសភេទ"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">ប្រុស</SelectItem>
                    <SelectItem value="FEMALE">ស្រី</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DateTimePickerField name="dateOfBirth" label="ថ្ងៃខែឆ្នាំកំណើត" control={control} disabled={isSubmitting} placeholder="ជ្រើសរើសថ្ងៃខែ..." className="flex-1" />
        </div>

        <div className="flex gap-4">
          <TextField name="phoneNumber" label="លេខទូរស័ព្ទ" control={control} placeholder="លេខទូរស័ព្ទ..." disabled={isSubmitting} className="flex-1" />
          <TextField name="email" label="អ៊ីម៊ែល" control={control} placeholder="អ៊ីម៊ែល..." disabled={isSubmitting} className="flex-1" />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">ស្ថានភាព</label>
          <Controller
            name="studentStatus"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                </SelectTrigger>
                <SelectContent>
                  {studentStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Place of Birth */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">ទីកន្លែងកំណើត</label>
          <Controller
            name="placeOfBirth"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="ភូមិ ​ឃុំ/សង្កាត់ ស្រុក/ខណ្ច​ ខេត្ត..." disabled={isSubmitting} className="resize-none" />
            )}
          />
        </div>

        {/* Current Address */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">ទីកន្លែងបច្ចុប្បន្ន</label>
          <Controller
            control={control}
            name="currentAddress"
            render={({ field }) => (
              <Textarea {...field} placeholder="ភូមិ ​ឃុំ/សង្កាត់ ស្រុក/ខណ្ច​ ខេត្ត..." disabled={isSubmitting} className="resize-none" />
            )}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
}
