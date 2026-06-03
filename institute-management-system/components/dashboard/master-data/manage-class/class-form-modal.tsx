"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Constants } from "@/constants/text-string";
import { MajorModel } from "@/model/master-data/major/all-major-model";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DegreeEnum,
  degrees,
  Degrees,
  YearLevelEnum,
} from "@/constants/constant";
import { ComboboxSelectMajor } from "@/components/shared/ComboBox/combobox-major";
import { YearSelector } from "@/components/shared/year-selector";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Define the schema once in a shared location
export const classFormSchema = z.object({
  code: z
    .string()
    .min(1, { message: "Class code is required" })
    .max(7, { message: "Class code should be less than 7 characters" })
    .trim(),
  academyYear: z.number({
    required_error: "Academy year is required",
  }),
  degree: z.nativeEnum(DegreeEnum, {
    required_error: "Degree is required",
  }),
  yearLevel: z.nativeEnum(YearLevelEnum, {
    required_error: "Year level is required",
  }),
  majorId: z.number().min(1, { message: "Major is required" }),
  status: z.literal(Constants.ACTIVE),
});

// Export the type for use across your application
export type ClassFormData = z.infer<typeof classFormSchema> & {
  id?: number;
  selectedMajor?: MajorModel; // Add the selected major for edit mode
};

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassFormData) => void;
  initialData?: ClassFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function ClassFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isSubmitting = false,
}: ClassFormModalProps) {
  // Initialize selectedMajor with initialData.selectedMajor if available
  const [selectedMajor, setSelectedMajor] = useState<MajorModel | null>(
    initialData?.selectedMajor || null
  );
  const [isFormDirty, setIsFormDirty] = useState(false);
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();
  // Initialize the form with Zod validation
  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      code: "",
      academyYear: currentYear,
      degree: DegreeEnum.BACHELOR,
      yearLevel: YearLevelEnum.FIRST_YEAR,
      majorId: 0,
      status: Constants.ACTIVE,
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        // Set the form values
        form.reset({
          code: initialData.code || "",
          academyYear: initialData.academyYear || currentYear,
          degree: initialData.degree || DegreeEnum.BACHELOR,
          yearLevel: initialData.yearLevel || YearLevelEnum.FIRST_YEAR,
          majorId: initialData.majorId || 0,
          status: Constants.ACTIVE,
        });

        // Set the selected major if it was passed from the parent
        if (initialData.selectedMajor) {
          setSelectedMajor(initialData.selectedMajor);
        }
      } else {
        // Reset for add mode
        form.reset({
          code: "",
          academyYear: currentYear,
          degree: DegreeEnum.BACHELOR,
          yearLevel: YearLevelEnum.FIRST_YEAR,
          majorId: 0,
          status: Constants.ACTIVE,
        });
        setSelectedMajor(null);
      }
      setIsFormDirty(false);
    }
  }, [isOpen, initialData, mode, form, currentYear]);

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
      // Use native confirm for simplicity, could be replaced with a custom dialog
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  // Handle major selection from ComboboxSelectMajor
  const handleMajorChange = (major: MajorModel) => {
    setSelectedMajor(major);
    form.setValue("majorId", major.id as number, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Handle form submission
  const handleSubmit = async (data: ClassFormData) => {
    try {
      const submitData: ClassFormData = {
        ...data,
        status: Constants.ACTIVE,
      };

      if (mode === "edit" && initialData?.id) {
        submitData.id = initialData.id;
      }

      onSubmit(submitData);
    } catch (error) {
      toast.error("An error occurred while saving class");
    }
  };

  // Handle academy year change
  const handleYearChange = (year: number) => {
    form.setValue("academyYear", year, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent
        className={cn(
          "max-h-[90vh] rounded-xl flex flex-col",
          isMobile ? "max-w-sm" : "max-w-lg"
        )}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {mode === "add" ? "Add Class" : "Edit Class"}
          </DialogTitle>
          <DialogDescription>
            Fill in the information below to{" "}
            {mode === "add" ? "create" : "update"} a class.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 px-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Class Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter class code"
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
                name="majorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Major <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ComboboxSelectMajor
                        dataSelect={selectedMajor}
                        onChangeSelected={handleMajorChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Degree <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value as DegreeEnum)
                        }
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                        <SelectContent>
                          {Degrees.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Year Level <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={YearLevelEnum.FIRST_YEAR}>
                            Year 1
                          </SelectItem>
                          <SelectItem value={YearLevelEnum.SECOND_YEAR}>
                            Year 2
                          </SelectItem>
                          <SelectItem value={YearLevelEnum.THIRD_YEAR}>
                            Year 3
                          </SelectItem>
                          <SelectItem value={YearLevelEnum.FOURTH_YEAR}>
                            Year 4
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academyYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Academy Year <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <YearSelector
                        value={field.value}
                        onChange={handleYearChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4 justify-end mr-auto pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !form.formState.isDirty ||
                    !form.formState.isValid
                  }
                  className="bg-green-900 text-white hover:bg-green-950"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {mode === "add" ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    `${mode === "add" ? "Create" : "Update"} Class`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
