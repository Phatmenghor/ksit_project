import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  subDescription?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function HelpDialog({ open, onOpenChange, title, description, onConfirm, subDescription, confirmText = "Confirm" }: HelpDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title={title}
          icon={<HelpCircle className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-50 border-yellow-200"
        />
        <FormBody>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex gap-3">
              <div className="w-1 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-sm text-foreground">{description}</p>
            </div>
          </div>
          {subDescription && (
            <p className="text-sm text-foreground">{subDescription}</p>
          )}
        </FormBody>
        <FormFooter>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => { onConfirm(); onOpenChange(false); }}>
            {confirmText}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
