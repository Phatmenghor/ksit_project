"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppIcons } from "@/constants/icons/icon";

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

export function ResetPasswordDialog({
  open,
  onOpenChange,
  onDiscard,
  title,
  description,
  cancelText = "Discard",
  onConfirm,
  subDescription,
  confirmText = "Reset",
}: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      setShowSuccess(true);
    } catch (error) {
      console.error("Reset failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
    onDiscard();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] mx-auto rounded-2xl border-0 shadow-2xl bg-white p-0">
        <div className="p-8 space-y-4">
          {showSuccess ? (
            // Success Dialog
            <>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center">
                  <img
                    src={AppIcons.Circle_alert_teal}
                    alt="success icon"
                    className="h-10 w-10 text-muted-foreground"
                  />
                </div>
                <div className="text-center space-y-1">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Password Reset!
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-base">
                    User password has been reset to default password
                  </DialogDescription>
                </div>
              </div>

              <Separator className="bg-slate-400" />

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleClose}
                  className="bg-teal-900 hover:bg-teal-950 text-white font-medium px-8 py-2 rounded-lg"
                >
                  Okay
                </Button>
              </div>
            </>
          ) : (
            // Confirmation Dialog
            <>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center">
                  <img
                    src={AppIcons.reset}
                    alt="reset icon"
                    className="h-10 w-10 text-muted-foreground"
                  />
                </div>
                <div className="text-center space-y-1">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-base">
                    Are you sure you want to reset user password?
                  </DialogDescription>
                </div>
              </div>

              <div className="bg-amber-50 border-amber-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-center items-center">
                  <div className="flex gap-4">
                    <DialogDescription className="text-yellow-600 text-sm">
                      <span>{description}</span>
                      {subDescription && (
                        <>
                          <br />
                          <span>{subDescription}</span>
                        </>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Action buttons */}
              <DialogFooter className="flex flex-row justify-end items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium min-w-[100px]"
                >
                  {isSubmitting ? "Resetting..." : confirmText}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
