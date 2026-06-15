"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react";
import { Constants } from "@/constants/text-string";
import { MajorModel } from "@/model/master-data/major/all-major-model";
import { DegreeEnum, Degrees, YearLevelEnum } from "@/constants/constant";
import { ComboboxSelectMajor } from "@/components/shared/ComboBox/combobox-major";
import { YearSelector } from "@/components/shared/year-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";

export const classFormSchema = z.object({
  code: z.string().min(1, { message: "Class code is required" }).max(7, { message: "Class code should be less than 7 characters" }).trim(),
  academyYear: z.number({ required_error: "Academy year is required" }),
  degree: z.nativeEnum(DegreeEnum, { required_error: "Degree is required" }),
  yearLevel: z.nativeEnum(YearLevelEnum, { required_error: "Year level is required" }),
  majorId: z.number().min(1, { message: "Major is required" }),
  status: z.literal(Constants.ACTIVE),
});

export type ClassFormData = z.infer<typeof classFormSchema> & {
  id?: number;
  selectedMajor?: MajorModel;
};

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassFormData) => void;
  initialData?: ClassFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function ClassFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: ClassFormModalProps) {
  const isCreate = mode === "add";
  const [selectedMajor, setSelectedMajor] = useState<MajorModel | null>(initialData?.selectedMajor || null);
  const currentYear = new Date().getFullYear();

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: { code: "", academyYear: currentYear, degree: DegreeEnum.BACHELOR, yearLevel: YearLevelEnum.FIRST_YEAR, majorId: 0, status: Constants.ACTIVE },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({ code: initialData.code || "", academyYear: initialData.academyYear || currentYear, degree: initialData.degree || DegreeEnum.BACHELOR, yearLevel: initialData.yearLevel || YearLevelEnum.FIRST_YEAR, majorId: initialData.majorId || 0, status: Constants.ACTIVE });
      if (initialData.selectedMajor) setSelectedMajor(initialData.selectedMajor);
    } else {
      form.reset({ code: "", academyYear: currentYear, degree: DegreeEnum.BACHELOR, yearLevel: YearLevelEnum.FIRST_YEAR, majorId: 0, status: Constants.ACTIVE });
      setSelectedMajor(null);
    }
  }, [isOpen, initialData, mode]);

  const handleMajorChange = (major: MajorModel) => {
    setSelectedMajor(major);
    form.setValue("majorId", major.id as number, { shouldValidate: true, shouldDirty: true });
  };

  const handleSubmit = (data: ClassFormData) => {
    try {
      const submitData: ClassFormData = { ...data, status: Constants.ACTIVE };
      if (mode === "edit" && initialData?.id) submitData.id = initialData.id;
      onSubmit(submitData);
    } catch {
      toast.error("An error occurred while saving class");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title={isCreate ? "Add Class" : "Edit Class"}
          description={`Fill in the information below to ${isCreate ? "create" : "update"} a class.`}
          icon={<GraduationCap className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Code <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter class code" {...field} autoFocus maxLength={50} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="majorId" render={() => (
                <FormItem>
                  <FormLabel>Major <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <ComboboxSelectMajor dataSelect={selectedMajor} onChangeSelected={handleMajorChange} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="degree" render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select onValueChange={(v) => field.onChange(v as DegreeEnum)} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                      <SelectContent>
                        {Degrees.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="yearLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Level <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger><SelectValue placeholder="Select year level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={YearLevelEnum.FIRST_YEAR}>Year 1</SelectItem>
                        <SelectItem value={YearLevelEnum.SECOND_YEAR}>Year 2</SelectItem>
                        <SelectItem value={YearLevelEnum.THIRD_YEAR}>Year 3</SelectItem>
                        <SelectItem value={YearLevelEnum.FOURTH_YEAR}>Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="academyYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Academy Year <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <YearSelector value={field.value} onChange={(y) => form.setValue("academyYear", y, { shouldValidate: true, shouldDirty: true })} />
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
                createText="Create Class"
                updateText="Update Class"
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
