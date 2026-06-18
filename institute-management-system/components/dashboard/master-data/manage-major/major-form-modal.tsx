"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BookMarked } from "lucide-react";
import { Constants } from "@/constants/text-string";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";

const majorFormSchema = z.object({
  name: z.string().min(1, { message: "Major name is required" }),
  code: z.string().min(1, { message: "Major code is required" }),
  departmentId: z.number().min(1, { message: "Department is required" }),
  status: z.literal(Constants.ACTIVE),
});

export type MajorFormData = z.infer<typeof majorFormSchema> & { id?: number };

interface MajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MajorFormData) => void;
  initialData?: MajorFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function MajorFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: MajorModalProps) {
  const isCreate = mode === "add";
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentModel | null>(null);

  const form = useForm<MajorFormData>({
    resolver: zodResolver(majorFormSchema),
    defaultValues: { name: "", code: "", departmentId: 0, status: Constants.ACTIVE },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({ name: initialData.name || "", code: initialData.code || "", departmentId: initialData.departmentId || 0, status: Constants.ACTIVE });
    } else {
      form.reset({ name: "", code: "", departmentId: 0, status: Constants.ACTIVE });
      setSelectedDepartment(null);
    }
  }, [isOpen, initialData, mode]);

  const handleDepartmentChange = (dept: DepartmentModel | null) => {
    if (!dept) return;
    setSelectedDepartment(dept);
    form.setValue("departmentId", dept.id as number, { shouldValidate: true });
  };

  const handleSubmit = (data: MajorFormData) => {
    try {
      const submitData: MajorFormData = { ...data, status: Constants.ACTIVE };
      if (mode === "edit" && initialData?.id) submitData.id = initialData.id;
      onSubmit(submitData);
    } catch {
      toast.error("An error occurred while saving major");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title={isCreate ? "Add Major" : "Edit Major"}
          description={`Fill in the information below to ${isCreate ? "create" : "update"} a major.`}
          icon={<BookMarked className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Major Code <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter major code" {...field} autoFocus /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Major Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter major name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="departmentId" render={() => (
                <FormItem>
                  <FormLabel>Department <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <ComboboxSelectDepartment dataSelect={selectedDepartment} onChangeSelected={handleDepartmentChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </FormBody>

            <FormFooter>
              <CancelButton onClick={onClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={form.formState.isDirty}
                isCreate={isCreate}
                createText="Create Major"
                updateText="Update Major"
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
