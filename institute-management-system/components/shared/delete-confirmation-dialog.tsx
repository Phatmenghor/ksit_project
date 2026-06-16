"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { FormHeader } from "./form-field/form-header";
import { FormBody } from "./form-field/form-body";
import { FormFooter } from "./form-field/form-footer";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  title: string;
  description: React.ReactNode;
  isSubmitting: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onDelete,
  title,
  description,
  isSubmitting,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title={title}
          description="This action cannot be undone. Please review before confirming."
          icon={<Trash2 className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-50 border-red-200"
        />

        <FormBody>
          <div className="rounded-lg border border-red-100 bg-red-50 p-3 space-y-1">
            <p className="text-sm text-red-800 font-medium">Are you sure you want to delete?</p>
            <p className="text-sm text-red-700">
              {description}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Once deleted, this record cannot be recovered. Make sure this is the correct item before proceeding.
          </p>
        </FormBody>

        <FormFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="h-9 px-4 text-muted-foreground hover:text-foreground border-border/60">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onDelete}
            disabled={isSubmitting}
            className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
