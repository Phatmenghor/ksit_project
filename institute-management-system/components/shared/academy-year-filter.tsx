"use client";

import { AcademyYearPicker } from "./academy-year-picker";

interface AcademyYearFilterProps {
  value: number;
  onChange: (year: number) => void;
  disabled?: boolean;
  label?: string;
}

export function AcademyYearFilter({
  value,
  onChange,
  disabled = false,
  label = "Academic Year",
}: AcademyYearFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      <AcademyYearPicker value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}
