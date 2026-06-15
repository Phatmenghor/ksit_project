"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CalendarDays } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Constants } from "@/constants/text-string";
import { YearSelector } from "@/components/shared/year-selector";
import { SemesterEnum } from "@/constants/constant";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";

const semesterFormSchema = z.object({
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
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

const parseDateString = (s?: string): Date => {
  if (!s) return new Date();
  const d = new Date(s);
  if (isValid(d)) return d;
  for (const fmt of ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"]) {
    try { const p = parse(s, fmt, new Date()); if (isValid(p)) return p; } catch {}
  }
  return new Date();
};

export function SemesterFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: SemesterModalProps) {
  const isCreate = mode === "add";

  const form = useForm<SemesterFormData>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: { startDate: new Date(), endDate: new Date(), academyYear: new Date().getFullYear(), semester: SemesterEnum.SEMESTER_1, status: Constants.ACTIVE },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({ startDate: parseDateString(initialData.startDate), endDate: parseDateString(initialData.endDate), academyYear: initialData.academyYear || new Date().getFullYear(), semester: initialData.semester || SemesterEnum.SEMESTER_1, status: Constants.ACTIVE });
    } else {
      form.reset({ startDate: new Date(), endDate: new Date(), academyYear: new Date().getFullYear(), semester: SemesterEnum.SEMESTER_1, status: Constants.ACTIVE });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = (data: SemesterFormData) => {
    try {
      const submitData: SemesterModel = {
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date <span className="text-red-500">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(d) => d < form.getValues().startDate} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="academyYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Academy Year <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <YearSelector value={field.value} onChange={(y) => form.setValue("academyYear", y, { shouldValidate: true })} />
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
