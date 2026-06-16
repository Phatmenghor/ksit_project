import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Check } from "lucide-react";
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
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 px-4 gap-1.5 text-muted-foreground hover:text-foreground border-border/60">
            <X className="h-3.5 w-3.5" />
            {cancelText}
          </Button>
          <Button size="sm" className={`h-9 px-4 gap-1.5 ${cfg.btn}`} onClick={() => { onConfirm(); onOpenChange(false); }}>
            <Check className="h-3.5 w-3.5" />
            {confirmText}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
