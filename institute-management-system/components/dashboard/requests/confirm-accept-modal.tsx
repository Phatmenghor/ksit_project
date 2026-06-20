"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const acceptFormSchema = z.object({
  staffComment: z.string().optional(),
});

type AcceptFormData = z.infer<typeof acceptFormSchema>;

interface ConfirmAcceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string) => void;
  isSubmitting?: boolean;
}

export function ConfirmAcceptModal({ open, onOpenChange, onConfirm, isSubmitting = false }: ConfirmAcceptModalProps) {
  const form = useForm<AcceptFormData>({
    resolver: zodResolver(acceptFormSchema),
    defaultValues: { staffComment: "" },
  });

  const handleSubmit = (data: AcceptFormData) => {
    onConfirm(data.staffComment || "");
  };

  const handleDiscard = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) form.reset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title="Confirm Accept"
          description="Review the action before confirming."
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50 border-green-200"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
            <FormBody className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to <strong className="text-foreground">accept</strong> this student request? This action will approve the request and notify the student.
              </p>
              <FormField control={form.control} name="staffComment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Add comments <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write message..." className="min-h-[80px] resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </FormBody>
            <FormFooter>
              <Button type="button" variant="outline" size="sm" onClick={handleDiscard} disabled={isSubmitting} className="h-9 px-4 gap-1.5 text-muted-foreground hover:text-foreground border-border/60">
                <X className="h-3.5 w-3.5" />
                Discard
              </Button>
              <Button type="submit" size="sm" className="h-9 px-4 gap-1.5 bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                {isSubmitting ? "Accepting..." : "Accept"}
              </Button>
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
