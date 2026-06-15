"use client";

import { Controller, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TextFormFieldProps } from "./form-field-types";

export function TextField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  type = "text",
  placeholder = "",
  className = "",
  valueAsNumber = false,
  min,
  max,
  step,
  inputClassName = "",
  labelClassName = "",
}: TextFormFieldProps<T>) {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <Label htmlFor={name} className={cn("text-sm font-medium text-foreground", labelClassName)}>
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            autoComplete="off"
            onChange={(e) => {
              if (valueAsNumber && type === "number") {
                const val = e.target.valueAsNumber;
                field.onChange(isNaN(val) ? undefined : val);
              } else {
                field.onChange(e.target.value);
              }
            }}
            className={cn(
              "transition-all duration-200",
              disabled && "bg-muted/50",
              error
                ? "border-red-500 focus-visible:ring-red-500/30"
                : "focus-visible:border-primary focus-visible:ring-primary/20",
              inputClassName
            )}
          />
        )}
      />
      {error?.message && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
