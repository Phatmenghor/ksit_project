"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Info } from "lucide-react";

// Form schema with validation
const returnFormSchema = z.object({
  staffComment: z
    .string()
    .min(1, { message: "Staff comment is required" })
    .min(10, { message: "Comment must be at least 10 characters long" })
});

type ReturnFormData = z.infer<typeof returnFormSchema>;

interface ConfirmReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string) => void;
}

export function ConfirmReturnModal({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmReturnModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      staffComment: "",
    },
  });

  const handleSubmit = async (data: ReturnFormData) => {
    try {
      setIsSubmitting(true);
      await onConfirm(data.staffComment);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error returning request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <Info className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center font-semibold">
            Confirm Return!
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            Are you sure you want to return this submission back to the
            requestor?
          </DialogDescription>
        </DialogHeader>

        <hr />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="staffComment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Add suggestions or comments{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write message... (minimum 10 characters)"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="py-2">
              <hr />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                disabled={isSubmitting}
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Returning..." : "Return"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
