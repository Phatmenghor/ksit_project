import { Control, FieldError, FieldValues, Path } from "react-hook-form";

export interface BaseFormFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export interface TextFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  type?: "text" | "email" | "tel" | "password" | "number" | "url";
  valueAsNumber?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
}

export interface TextareaFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  rows?: number;
}

export interface SelectFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  options: Array<{ label: string; value: string | number }>;
  onValueChange?: (value: string | number) => void;
}

export interface DatePickerFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  mode?: "date" | "datetime";
}
