import { paymentTypes } from "@/constants/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { z } from "zod";

export const paymentFormSchema = z.object({
  item: z.string().min(1, { message: "Item is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  percentage: z
    .string()
    .min(1, { message: "Percentage is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Percentage must be a non-negative number",
    })
    .optional(),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Amount must be a non-negative number",
    })
    .optional(),
  comment: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema> & {
  id?: number;
};

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
  initialData?: PaymentFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function PaymentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isSubmitting = false,
}: PaymentFormModalProps) {
  const [isFormDirty, setIsFormDirty] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      item: "",
      type: "",
      percentage: "0",
      amount: "0",
      comment: "",
    },
    mode: "onChange",
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        form.reset({
          item: initialData.item || "",
          type: initialData.type || "",
          percentage: initialData.percentage || "0",
          amount: initialData.amount || "0",
          comment: initialData.comment || "",
        });
      } else {
        form.reset({
          item: "",
          type: "",
          percentage: "0",
          amount: "0",
          comment: "",
        });
      }
      setIsFormDirty(false);
    }
  }, [isOpen, initialData, mode, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() =>
      setIsFormDirty(form.formState.isDirty)
    );
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle close with confirmation if form is dirty
  const handleCloseModal = () => {
    if (isFormDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  // Handle form submission
  const handleSubmit = async (data: PaymentFormData) => {
    try {
      const submitData: PaymentFormData = {
        ...data,
      };

      if (mode === "edit" && initialData?.id) {
        submitData.id = initialData.id;
      }

      onSubmit(submitData);
    } catch (error) {
      toast.error("An error occurred while saving payment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Record" : "Edit Record"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Item <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter item"
                      {...field}
                      autoFocus
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Amount ($) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Percentage (%) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter percentage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Comment <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter comment"
                      {...field}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 sticky -bottom-8 z-10 bg-white py-4">
              <Button
                type="button"
                className="bg-white border text-gray-700 border-gray-300 hover:bg-transparent"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="bg-green-900 text-white hover:bg-green-950"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {mode === "add" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  `${mode === "add" ? "Save" : "Update"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
