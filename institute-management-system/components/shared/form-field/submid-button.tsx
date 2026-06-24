import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      size="sm"
      disabled={isDisabled}
      className={cn("h-9 px-4", className ?? "bg-primary text-primary-foreground hover:bg-primary/90")}
    >
      {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
      {label}
    </Button>
  );
}
