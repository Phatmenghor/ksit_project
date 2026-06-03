"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface RequestCompletedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RequestCompletedModal({
  open,
  onOpenChange,
  onConfirm,
}: RequestCompletedModalProps) {
  const handleOkay = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center font-semibold">
            Request Completed!
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">Your request have been mark as done!</DialogDescription>
        </DialogHeader>

        <hr />

        <div className="flex justify-end">
          <Button
            onClick={handleOkay}
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            Okay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
