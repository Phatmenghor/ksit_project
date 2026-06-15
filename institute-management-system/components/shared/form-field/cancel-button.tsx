import { Button } from "@/components/ui/button";

interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function CancelButton({ onClick, disabled, label = "Cancel" }: CancelButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}
