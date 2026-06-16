"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { Constants } from "@/constants/text-string";
import { SemesterEnum } from "@/constants/constant";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { AcademyYearPicker } from "@/components/shared/academy-year-picker";

const semesterFormSchema = z.object({
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  academyYear: z.number({ required_error: "Academy year is required" }),
  semester: z.nativeEnum(SemesterEnum, { required_error: "Semester is required" }),
  status: z.literal(Constants.ACTIVE),
});

export type SemesterFormData = z.infer<typeof semesterFormSchema> & { id?: number };

interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SemesterModel) => void;
  initialData?: SemesterModel;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function SemesterFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: SemesterModalProps) {
  const isCreate = mode === "add";
  const currentYear = new Date().getFullYear();

  const form = useForm<SemesterFormData>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: { startDate: "", endDate: "", academyYear: currentYear, semester: SemesterEnum.SEMESTER_1, status: Constants.ACTIVE },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        academyYear: initialData.academyYear || currentYear,
        semester: initialData.semester || SemesterEnum.SEMESTER_1,
        status: Constants.ACTIVE,
      });
    } else {
      form.reset({ startDate: "", endDate: "", academyYear: currentYear, semester: SemesterEnum.SEMESTER_1, status: Constants.ACTIVE });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = (data: SemesterFormData) => {
    try {
      const submitData: SemesterModel = {
        startDate: data.startDate,
        endDate: data.endDate,
        academyYear: data.academyYear,
        semester: data.semester,
        status: Constants.ACTIVE,
      };
      if (mode === "edit" && initialData?.id) submitData.id = initialData.id;
      onSubmit(submitData);
    } catch {
      toast.error("An error occurred while saving semester");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title={isCreate ? "Add Semester" : "Edit Semester"}
          description={`Fill in the information below to ${isCreate ? "create" : "update"} a semester.`}
          icon={<CalendarDays className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <CustomDateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        mode="date"
                        placeholder="Pick a date"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <CustomDateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        mode="date"
                        placeholder="Pick a date"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="academyYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Academy Year <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <AcademyYearPicker value={field.value} onChange={(y) => form.setValue("academyYear", y, { shouldValidate: true, shouldDirty: true })} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="semester" render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={(v) => field.onChange(v as SemesterEnum)} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a semester" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={SemesterEnum.SEMESTER_1}>Semester 1</SelectItem>
                      <SelectItem value={SemesterEnum.SEMESTER_2}>Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
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
                createText="Create Semester"
                updateText="Update Semester"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              />
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
