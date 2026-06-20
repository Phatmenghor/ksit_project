"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Info, X, Check, Trash2 } from "lucide-react";
import { RequestModel } from "@/model/request/request-model";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { useAppDispatch } from "@/store";
import { deleteRequestThunk } from "@/features/requests/store/thunks/request-thunks";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

interface MyRequestDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestModel | null;
  onSuccess?: () => void;
}

export function MyRequestDetailModal({
  open,
  onOpenChange,
  request,
  onSuccess,
}: MyRequestDetailModalProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  if (!request) return null;

  function getStatusDisplayName(status: string = "") {
    switch (status.toUpperCase()) {
      case "PENDING": return "Pending";
      case "ACCEPTED": return "Accepted";
      case "REJECTED": return "Rejected";
      case "RETURN": return "Returned";
      case "DONE": return "Done";
      default: return status;
    }
  }

  const handleCancelConfirm = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteRequestThunk(request.id)).unwrap();
      toast.success("Request cancelled successfully");
      setIsCancelConfirmOpen(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-xl border border-gray-100 shadow-xl bg-white">
          <DialogHeader className="hidden">
            <DialogTitle>Request Detail</DialogTitle>
          </DialogHeader>

          {/* Header */}
          <div className="bg-[#024D3E] p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 opacity-90" />
              <h1 className="text-base font-bold">Request Detail</h1>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status Bar */}
          <div className="bg-[#024D3E] px-5 pb-5 pt-1 text-white">
            <hr className="border-white/20 mb-4" />
            <div className="bg-white/15 rounded-lg p-3 px-4 flex items-center justify-between">
              <span className="text-xs text-white/60 font-medium">Status</span>
              <span className="text-xs font-normal px-3 py-1 bg-white/10 rounded-full border border-white/20">
                {getStatusDisplayName(request.status)}
              </span>
            </div>
          </div>

          {/* Alert Status Banners */}
          {request.status === "RETURN" && (
            <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-700">
                <Info className="h-4 w-4" /> Request Returned for Changes
              </div>
              <p className="text-amber-600 pl-5 leading-relaxed">
                {request.staffComment || "No comment provided."}
              </p>
            </div>
          )}
          {request.status === "REJECTED" && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-700">
                <X className="h-4 w-4" /> Request Rejected
              </div>
              <p className="text-red-600 pl-5 leading-relaxed">
                {request.staffComment || "No comment provided."}
              </p>
            </div>
          )}
          {request.status === "DONE" && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-green-700">
                <Check className="h-4 w-4" /> Request Completed
              </div>
              <p className="text-green-600 pl-5 leading-relaxed">
                Your request has been successfully processed.
              </p>
            </div>
          )}

          {/* Details Section */}
          <div className="p-6 space-y-1 max-h-[50vh] overflow-y-auto">
            {[
              {
                label: "Submit Date",
                value: request.createdAt ? formatDate(request.createdAt) : "---",
              },
              {
                label: "Item Name",
                value: request.title || "---",
              },
              {
                label: "Comments",
                value: request.requestComment || "---",
              },
              {
                label: "Comment by staff",
                value: request.staffComment || "N/A",
              },
              {
                label: "Staff Action",
                value: request.updatedAt ? formatDate(request.updatedAt) : (request.createdAt ? formatDate(request.createdAt) : "---"),
              },
            ].map((row, index) => (
              <div
                key={index}
                className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0"
              >
                <span className="text-xs font-semibold text-gray-500 w-32 shrink-0">
                  {row.label}
                </span>
                <span className="text-xs text-gray-800 text-right font-medium max-w-[320px] break-words">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Actions (Cancel Request if Pending) */}
          {request.status === "PENDING" && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isDeleting}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700 gap-1.5 h-9"
                onClick={() => setIsCancelConfirmOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Cancel Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onDelete={handleCancelConfirm}
        title="Cancel Request"
        description="Are you sure you want to cancel this request?"
        isSubmitting={isDeleting}
      />
    </>
  );
}
