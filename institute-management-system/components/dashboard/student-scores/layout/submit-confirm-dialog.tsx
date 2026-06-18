import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SendHorizonal, X, Loader2 } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  subDescription?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ScoreSubmitConfirmDialog({ open, onOpenChange, title, description, onConfirm, subDescription, confirmText = "Confirm", cancelText = "Discard", isLoading = false }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isLoading) onOpenChange(v); }}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title={title}
          description={description}
          icon={<SendHorizonal className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />
        <FormBody>
          {subDescription && (
            <p className="text-sm font-medium text-green-700">{subDescription}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Once submitted, scores will be sent for review. Please ensure all scores are correct before proceeding.
          </p>
        </FormBody>
        <FormFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading} className="h-9 px-4 gap-1.5 text-muted-foreground hover:text-foreground border-border/60">
            <X className="h-3.5 w-3.5" />
            {cancelText}
          </Button>
          <Button size="sm" className="h-9 px-4 gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SendHorizonal className="h-3.5 w-3.5" />}
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
