"use client";

import { Controller, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import type { DatePickerFormFieldProps } from "./form-field-types";

export function DatePickerField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select date",
  className = "",
}: DatePickerFormFieldProps<T>) {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const dateValue = field.value
            ? (typeof field.value === "string" ? parseISO(field.value) : field.value as Date)
            : undefined;
          const isValidDate = dateValue && isValid(dateValue);

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-start h-10 px-3 font-normal text-sm transition-all duration-200",
                    !isValidDate && "text-muted-foreground",
                    "hover:bg-primary/10 hover:border-primary",
                    error && "border-red-500",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                  <span className="flex-1 text-left">
                    {isValidDate ? format(dateValue!, "PPP") : placeholder}
                  </span>
                  {isValidDate && !disabled && (
                    <X
                      className="h-4 w-4 opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        field.onChange(undefined);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[200]" align="start">
                <Calendar
                  mode="single"
                  selected={isValidDate ? dateValue : undefined}
                  onSelect={(date) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : undefined);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {error?.message && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
