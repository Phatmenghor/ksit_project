import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

const TextareaFieldController = ({
  control,
  name,
  label,
  placeholder,
  disabled,
  id,
}: {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}) => (
  <div>
    <label htmlFor={id || name} className="mb-1 block text-sm font-bold">
      {label}
    </label>
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Textarea
          id={id || name}
          {...field}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    />
  </div>
);

export default TextareaFieldController;
