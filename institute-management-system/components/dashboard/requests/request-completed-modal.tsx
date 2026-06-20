"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface RequestCompletedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function RequestCompletedModal({ open, onOpenChange, onConfirm, isSubmitting = false }: RequestCompletedModalProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title="Request Completed"
          description="The request has been marked as done."
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50 border-green-200"
        />
        <FormBody>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your request has been successfully marked as <strong className="text-foreground">completed</strong>. The status will be updated accordingly.
          </p>
        </FormBody>
        <FormFooter>
          <Button size="sm" className="h-9 px-6 gap-1.5 bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            {isSubmitting ? "Processing..." : "Okay"}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
