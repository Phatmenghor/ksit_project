import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isDirty?: boolean;
  isCreate?: boolean;
  createText?: string;
  updateText?: string;
  submittingCreateText?: string;
  submittingUpdateText?: string;
  disabled?: boolean;
  className?: string;
  form?: string;
}

export function SubmitButton({
  isSubmitting,
  isDirty = true,
  isCreate = true,
  createText = "Create",
  updateText = "Update",
  submittingCreateText = "Creating...",
  submittingUpdateText = "Updating...",
  disabled,
  className,
  form,
}: SubmitButtonProps) {
  const isDisabled = isSubmitting || (!isDirty && !isCreate) || disabled;
  const label = isSubmitting
    ? isCreate ? submittingCreateText : submittingUpdateText
    : isCreate ? createText : updateText;

  return (
    <Button
      type="submit"
      form={form}
      disabled={isDisabled}
      className={className ?? "bg-primary text-primary-foreground hover:bg-primary/90"}
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}
