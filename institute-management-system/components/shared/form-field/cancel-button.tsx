import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function CancelButton({ onClick, disabled, label = "Cancel", className }: CancelButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn("h-9 px-4 text-muted-foreground hover:text-foreground border-border/60", className)}
    >
      {label}
    </Button>
  );
}
