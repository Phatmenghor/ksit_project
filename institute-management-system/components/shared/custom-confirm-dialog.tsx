import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Separator } from "../ui/separator";
import { AppIcons } from "@/constants/icons/icon";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Discard",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-md max-w-sm mx-auto border-r-2 p-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Info Icon */}
          <div className="flex items-center justify-center">
            <img
              src={AppIcons.Circle_alert_teal}
              alt="back Icon"
              className="h-10 w-10 text-muted-foreground"
            />{" "}
          </div>

          {/* Title and Description */}
          <div className="space-y-3">
            <DialogTitle className="text-xl font-medium text-gray-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-base">
              {description}
            </DialogDescription>
          </div>

          <Separator className="text-gray-200" />
          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-8 py-2.5 text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="px-8 py-2.5 bg-teal-900 hover:bg-teal-950 text-white"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
