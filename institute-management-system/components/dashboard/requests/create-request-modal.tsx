"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { Loader2, Send, X, PlusCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { createRequestThunk } from "@/features/requests/store/thunks/request-thunks";
import { selectMyRequestIsCreating } from "@/features/requests/store/selectors/my-request-selectors";

interface CreateRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateRequestModal({ open, onOpenChange, onSuccess }: CreateRequestModalProps) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector(selectMyRequestIsCreating);
  const [title, setTitle] = useState("");
  const [requestComment, setRequestComment] = useState("");

  const handleClose = () => {
    if (isCreating) return;
    setTitle("");
    setRequestComment("");
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.warning("Please enter a request title.");
      return;
    }

    try {
      await dispatch(
        createRequestThunk({
          title: title.trim(),
          requestComment: requestComment.trim() || undefined,
        })
      ).unwrap();

      toast.success("Request submitted successfully.");
      setTitle("");
      setRequestComment("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to submit request.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col gap-0">
        <FormHeader
          title="Create New Request"
          description="Fill in the details and submit your request."
          icon={<PlusCircle className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50 border-amber-200"
        />

        <FormBody className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="req-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="req-title"
              placeholder="Enter request title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req-comment">Message / Comment</Label>
            <Textarea
              id="req-comment"
              placeholder="Describe your request in detail..."
              value={requestComment}
              onChange={(e) => setRequestComment(e.target.value)}
              disabled={isCreating}
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {requestComment.length} / 2000
            </p>
          </div>
        </FormBody>

        <FormFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isCreating}
            className="h-9 px-4 gap-1.5 text-muted-foreground hover:text-foreground border-border/60"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isCreating || !title.trim()}
            className="h-9 px-4 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isCreating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isCreating ? "Submitting..." : "Submit Request"}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
