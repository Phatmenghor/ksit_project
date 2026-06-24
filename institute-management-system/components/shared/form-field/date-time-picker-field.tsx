"use client";

import React from "react";
import { Controller, FieldValues, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CustomDateTimePicker } from "../common/custom-date-picker";
import type { DatePickerFormFieldProps } from "./form-field-types";

export function DateTimePickerField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select date",
  className = "",
  mode = "date",
  inputClassName = "",
}: DatePickerFormFieldProps<T> & { inputClassName?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <Label htmlFor={name} className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name as Path<T>}
        render={({ field }) => (
          <CustomDateTimePicker
            id={name}
            className={inputClassName}
            value={field.value ?? ""}
            onChange={field.onChange}
            disabled={disabled}
            placeholder={placeholder}
            error={!!error}
            mode={mode}
          />
        )}
      />
      {error?.message && (
        <p className="text-xs text-destructive font-medium">{error.message}</p>
      )}
    </div>
  );
}
