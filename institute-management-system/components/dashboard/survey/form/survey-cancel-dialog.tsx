import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  subDescription?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function SurveyCancelDialog({ open, onOpenChange, title, description, onConfirm, subDescription, confirmText = "Confirm", cancelText = "Discard" }: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title={title}
          description={description}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-50 border-red-200"
        />
        <FormBody>
          {subDescription && (
            <p className="text-sm font-medium text-red-700">{subDescription}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Any unsaved progress will be lost if you cancel now.
          </p>
        </FormBody>
        <FormFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setTimeout(onConfirm, 100); }}>{cancelText}</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmText}</Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
