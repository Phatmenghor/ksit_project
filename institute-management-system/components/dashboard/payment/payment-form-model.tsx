import { paymentTypes } from "@/constants/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { CreditCard, Loader2 } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";

export const paymentFormSchema = z.object({
  item: z.string().min(1, { message: "Item is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  percentage: z
    .string()
    .min(1, { message: "Percentage is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, { message: "Percentage must be a non-negative number" })
    .optional(),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, { message: "Amount must be a non-negative number" })
    .optional(),
  comment: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema> & { id?: number };

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
  initialData?: PaymentFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function PaymentFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: PaymentFormModalProps) {
  const isCreate = mode === "add";

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { item: "", type: "", percentage: "0", amount: "0", comment: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({ item: initialData.item || "", type: initialData.type || "", percentage: initialData.percentage || "0", amount: initialData.amount || "0", comment: initialData.comment || "" });
    } else {
      form.reset({ item: "", type: "", percentage: "0", amount: "0", comment: "" });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      const submitData: PaymentFormData = { ...data };
      if (mode === "edit" && initialData?.id) submitData.id = initialData.id;
      onSubmit(submitData);
    } catch {
      toast.error("An error occurred while saving payment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xl p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title={isCreate ? "Add Payment Record" : "Edit Payment Record"}
          description={`Fill in the information below to ${isCreate ? "create" : "update"} a payment record.`}
          icon={<CreditCard className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              <FormField control={form.control} name="item" render={({ field }) => (
                <FormItem>
                  <FormLabel>Item <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter item" {...field} autoFocus maxLength={50} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {paymentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($) <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Enter amount" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="percentage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage (%) <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Enter percentage" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="comment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl><Input placeholder="Enter comment" {...field} maxLength={50} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </FormBody>

            <FormFooter>
              <CancelButton onClick={onClose} disabled={isSubmitting} />
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreate ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  isCreate ? "Create Record" : "Update Record"
                )}
              </Button>
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
