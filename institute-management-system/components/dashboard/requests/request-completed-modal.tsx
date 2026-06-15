"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface RequestCompletedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RequestCompletedModal({ open, onOpenChange, onConfirm }: RequestCompletedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8" onClick={() => { onConfirm(); onOpenChange(false); }}>
            Okay
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
