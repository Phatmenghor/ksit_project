"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTE } from "@/constants/routes";
import { createRequestThunk } from "@/features/requests/store/thunks/request-thunks";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";

export default function CreateRequestPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector((state) => state.requests.isCreating);
  const [title, setTitle] = useState("");
  const [requestComment, setRequestComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Please enter a request title.");
      return;
    }

    try {
      await dispatch(createRequestThunk({ title: title.trim(), requestComment: requestComment.trim() || undefined })).unwrap();
      toast.success("Request submitted successfully.");
      router.push(ROUTE.REQUESTS);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit request. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0">
          <PageBreadcrumb
            items={[
              { label: "Requests", href: ROUTE.REQUESTS },
              { label: "Create Request" },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">New Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter request title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                maxLength={255}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comment">Message / Comment</Label>
              <Textarea
                id="comment"
                placeholder="Describe your request in detail..."
                value={requestComment}
                onChange={(e) => setRequestComment(e.target.value)}
                disabled={isSubmitting}
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {requestComment.length} / 2000
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !title.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
