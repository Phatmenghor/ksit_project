"use client";

import { CustomDateTimePicker } from "./common/custom-date-picker";
import { cn } from "@/lib/utils";

interface AcademyYearPickerProps {
  value: number;
  onChange: (year: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AcademyYearPicker({
  value,
  onChange,
  placeholder = "Select academy year",
  className,
  disabled = false,
}: AcademyYearPickerProps) {
  return (
    <CustomDateTimePicker
      mode="academyYear"
      value={value !== 0 ? String(value) : ""}
      onChange={(v) => onChange(v ? parseInt(v) : 0)}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}
