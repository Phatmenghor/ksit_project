"use client";

import { Controller, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { TextareaFormFieldProps } from "./form-field-types";

export function TextareaField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "",
  className = "",
  rows = 3,
}: TextareaFormFieldProps<T>) {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Textarea
            {...field}
            value={field.value ?? ""}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              "resize-none transition-all duration-200",
              disabled && "bg-muted/50 cursor-not-allowed",
              error
                ? "border-red-500 focus-visible:ring-red-500/30"
                : "focus-visible:border-primary focus-visible:ring-primary/20"
            )}
          />
        )}
      />
      {error?.message && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
