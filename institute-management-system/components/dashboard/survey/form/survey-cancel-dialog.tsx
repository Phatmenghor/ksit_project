import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

export function SurveyCancelDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  subDescription,
  confirmText = "Confirm",
  cancelText = "Discard",
}: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-xl max-w-sm mx-auto p-4 text-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Info Icon */}
          <div className="flex items-center justify-center">
            <Info className="w-10 h-10 rounded-full bg-red-600 text-white" />
          </div>

          {/* Title and Description */}
          <div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-medium text-gray-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                {description}
              </DialogDescription>
            </div>
            {subDescription && (
              <h3 className="mt-2 text-red-700">{subDescription}</h3>
            )}
          </div>

          <Separator className="bg-gray-300" />
          {/* Buttons */}
        </div>
        <div className="flex space-x-3 items-end justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setTimeout(onConfirm, 100);
            }}
            className="px-8 py-2.5 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-8 py-2.5 bg-red-600 hover:bg-emerald-900 text-white"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
