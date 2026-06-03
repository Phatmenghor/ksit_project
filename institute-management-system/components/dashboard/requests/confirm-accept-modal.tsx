"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface ConfirmAcceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmAcceptModal({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmAcceptModalProps) {
  const handleSubmit = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleDiscard = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Info className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="font-semibold text-center">
            Confirm Accept!
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            Are you sure you want to accept student request?
          </DialogDescription>
        </DialogHeader>

        <hr />

        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="outline" onClick={handleDiscard}>
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
