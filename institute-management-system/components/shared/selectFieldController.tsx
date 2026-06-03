import { Controller } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const SelectFieldController = ({
  control,
  name,
  label,
  disabled,
  placeholder = "សូមជ្រើសរើស",
  options,
}: {
  control: any;
  name: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}) => (
  <div>
    <label htmlFor={name} className="mb-1 block text-sm font-bold">
      {label}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          onValueChange={field.onChange}
          value={field.value}
          disabled={disabled}
        >
          <SelectTrigger className="bg-gray-100">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-gray-100">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  </div>
);

export default SelectFieldController;
