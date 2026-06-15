"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  title: string;
  description: string;
  subDescription?: string;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
}

export function ResetPasswordDialog({ open, onOpenChange, onDiscard, title, description, cancelText = "Discard", onConfirm, subDescription, confirmText = "Reset" }: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try { await onConfirm(); setShowSuccess(true); }
    catch {} finally { setIsSubmitting(false); }
  };

  const handleClose = () => { setShowSuccess(false); onOpenChange(false); onDiscard(); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        {showSuccess ? (
          <>
            <FormHeader
              title="Password Reset!"
              description="User password has been reset to the default password."
              icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
              iconBg="bg-green-50 border-green-200"
            />
            <FormBody>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The password has been successfully reset. Please inform the user of their new default password.
              </p>
            </FormBody>
            <FormFooter>
              <Button type="button" onClick={handleClose} className="bg-primary text-primary-foreground hover:bg-primary/90">Okay</Button>
            </FormFooter>
          </>
        ) : (
          <>
            <FormHeader
              title={title}
              description="This will reset the user's password to the default value."
              icon={<KeyRound className="h-5 w-5 text-yellow-600" />}
              iconBg="bg-yellow-50 border-yellow-200"
            />
            <FormBody>
              <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 space-y-1">
                <p className="text-sm text-yellow-800 font-medium">Are you sure you want to reset the password?</p>
                <p className="text-sm text-yellow-700">{description}</p>
                {subDescription && <p className="text-sm text-yellow-700">{subDescription}</p>}
              </div>
            </FormBody>
            <FormFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>{cancelText}</Button>
              <Button type="button" onClick={handleConfirm} disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                {isSubmitting ? "Resetting..." : confirmText}
              </Button>
            </FormFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
