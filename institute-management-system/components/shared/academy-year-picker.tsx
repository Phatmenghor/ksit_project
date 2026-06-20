"use client";

import { YearSelector } from "./year-selector";

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
    <YearSelector
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      title=""
    />
  );
}
