import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { FormHeader } from "./form-field/form-header";
import { FormBody } from "./form-field/form-body";
import { FormFooter } from "./form-field/form-footer";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "danger" | "info";
}

const variantConfig = {
  warning: { icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />, bg: "bg-yellow-50 border-yellow-200", btn: "bg-yellow-600 hover:bg-yellow-700 text-white" },
  danger:  { icon: <AlertTriangle className="h-5 w-5 text-red-500" />,    bg: "bg-red-50 border-red-200",       btn: "bg-red-600 hover:bg-red-700 text-white" },
  info:    { icon: <AlertTriangle className="h-5 w-5 text-primary" />,    bg: "bg-primary/10 border-primary/20", btn: "bg-primary hover:bg-primary/90 text-primary-foreground" },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title={title}
          icon={cfg.icon}
          iconBg={cfg.bg}
        />
        <FormBody>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </FormBody>
        <FormFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            className={cfg.btn}
            onClick={() => { onConfirm(); onOpenChange(false); }}
          >
            {confirmText}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
