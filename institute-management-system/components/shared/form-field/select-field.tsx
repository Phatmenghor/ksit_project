"use client";

import { useState } from "react";
import { Controller, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectFormFieldProps } from "./form-field-types";

export function SelectField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  options,
  placeholder = "Select...",
  onValueChange,
  className = "",
}: SelectFormFieldProps<T>) {
  const [open, setOpen] = useState(false);

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
        render={({ field }) => {
          const currentValue = field.value ?? "";
          const selectedOption = options.find((opt) => opt.value === currentValue);

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={name as string}
                  variant="outline"
                  role="combobox"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between h-10 px-3 font-normal transition-all duration-200",
                    !selectedOption && "text-muted-foreground",
                    "hover:bg-primary/10 hover:border-primary",
                    open && "border-primary bg-primary/5",
                    error && "border-red-500",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className={cn("text-sm truncate", selectedOption ? "text-foreground" : "text-muted-foreground")}>
                    {selectedOption?.label ?? placeholder}
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
                      open && "rotate-180 opacity-100"
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[200]">
                <div className="max-h-60 overflow-y-auto">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        field.onChange(option.value);
                        onValueChange?.(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left cursor-pointer transition-colors",
                        "hover:bg-primary/10 hover:text-primary",
                        currentValue === option.value && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Check
                        className={cn("h-4 w-4 shrink-0", currentValue === option.value ? "opacity-100" : "opacity-0")}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {error?.message && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
