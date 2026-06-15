"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RotateCcw } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

const returnFormSchema = z.object({
  staffComment: z.string().min(1, { message: "Staff comment is required" }).min(10, { message: "Comment must be at least 10 characters long" }),
});

type ReturnFormData = z.infer<typeof returnFormSchema>;

interface ConfirmReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string) => void;
}

export function ConfirmReturnModal({ open, onOpenChange, onConfirm }: ConfirmReturnModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: { staffComment: "" },
  });

  const handleSubmit = async (data: ReturnFormData) => {
    try {
      setIsSubmitting(true);
      await onConfirm(data.staffComment);
      form.reset();
      onOpenChange(false);
    } catch {} finally { setIsSubmitting(false); }
  };

  const handleDiscard = () => { form.reset(); onOpenChange(false); };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) form.reset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <FormHeader
          title="Confirm Return"
          description="Please provide a reason for returning this submission."
          icon={<RotateCcw className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-50 border-orange-200"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
            <FormBody>
              <p className="text-sm text-muted-foreground">Are you sure you want to return this submission back to the requestor?</p>
              <FormField control={form.control} name="staffComment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Add suggestions or comments <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write message... (minimum 10 characters)" className="min-h-[100px] resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </FormBody>
            <FormFooter>
              <Button type="button" variant="outline" onClick={handleDiscard} disabled={isSubmitting}>Discard</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Returning..." : "Return"}
              </Button>
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
