"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface ConfirmAcceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmAcceptModal({ open, onOpenChange, onConfirm }: ConfirmAcceptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title="Confirm Accept"
          description="Review the action before confirming."
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50 border-green-200"
        />
        <FormBody>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to <strong className="text-foreground">accept</strong> this student request? This action will approve the request and notify the student.
          </p>
        </FormBody>
        <FormFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { onConfirm(); onOpenChange(false); }}>Accept</Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
