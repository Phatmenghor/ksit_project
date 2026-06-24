import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  subDescription?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ReturnDialog({ open, onOpenChange, title, description, onConfirm, subDescription, confirmText = "Confirm", cancelText = "Discard" }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title={title}
          description={description}
          icon={<RotateCcw className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-50 border-yellow-200"
        />
        <FormBody>
          {subDescription && (
            <p className="text-sm font-medium text-yellow-700">{subDescription}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please review before confirming this action.
          </p>
        </FormBody>
        <FormFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelText}</Button>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmText}</Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
