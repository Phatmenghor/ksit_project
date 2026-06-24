"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";
import { Constants } from "@/constants/text-string";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";

const subjectFormSchema = z.object({
  name: z.string().min(1, { message: "Subject name is required" }),
  status: z.literal(Constants.ACTIVE),
});

export type SubjectFormData = z.infer<typeof subjectFormSchema> & { id?: number };

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectFormData) => void;
  initialData?: SubjectFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function SubjectModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: SubjectModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const isCreate = mode === "add";

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { name: "", status: Constants.ACTIVE },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({ name: initialData.name || "", status: Constants.ACTIVE });
    } else {
      form.reset({ name: "", status: Constants.ACTIVE });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (data: SubjectFormData) => {
    setIsUploading(true);
    try {
      const submitData: SubjectFormData = { ...data, status: Constants.ACTIVE };
      if (mode === "edit" && initialData?.id) submitData.id = initialData.id;
      onSubmit(submitData);
    } catch {
      toast.error("An error occurred while saving subject");
    } finally {
      setIsUploading(false);
    }
  };

  const submitting = isUploading || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title={isCreate ? "Add Subject" : "Edit Subject"}
          description={`Fill in the information below to ${isCreate ? "create" : "update"} a subject.`}
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter subject name" {...field} autoFocus /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </FormBody>
            <FormFooter>
              <CancelButton onClick={onClose} disabled={submitting} />
              <SubmitButton
                isSubmitting={submitting}
                isDirty={form.formState.isDirty}
                isCreate={isCreate}
                createText="Create Subject"
                updateText="Update Subject"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
                disabled={!form.formState.isValid}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              />
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
