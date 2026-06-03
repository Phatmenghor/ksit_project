"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Constants } from "@/constants/text-string";
import { YearSelector } from "@/components/shared/year-selector";
import { SemesterEnum } from "@/constants/constant";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { useIsMobile } from "@/hooks/use-mobile";

const semesterFormSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z
    .date({
      required_error: "End date is required",
    })
    .refine((endDate) => endDate, { message: "End date is required" }),
  academyYear: z.number({
    required_error: "Academy year is required",
  }),
  semester: z.nativeEnum(SemesterEnum, {
    required_error: "Semester is required",
  }),
  status: z.literal(Constants.ACTIVE),
});

export type SemesterFormData = z.infer<typeof semesterFormSchema> & {
  id?: number;
};

interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SemesterModel) => void;
  initialData?: SemesterModel;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function SemesterFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isSubmitting = false,
}: SemesterModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<SemesterFormData>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      academyYear: new Date().getFullYear(),
      semester: SemesterEnum.SEMESTER_1,
      status: Constants.ACTIVE,
    },
  });

  const isMobile = useIsMobile();

  // Helper function to safely parse date strings
  const parseDateString = (dateString: string | undefined): Date => {
    if (!dateString) return new Date();

    // Try parsing with various formats
    try {
      // First try ISO format (yyyy-MM-dd)
      const parsedDate = new Date(dateString);
      if (isValid(parsedDate)) return parsedDate;

      // Try specific format parsing
      const formatPatterns = ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"];

      for (const pattern of formatPatterns) {
        try {
          const date = parse(dateString, pattern, new Date());
          if (isValid(date)) return date;
        } catch (e) {
          // Continue to next pattern if this one fails
        }
      }
    } catch (e) {
      console.error("Error parsing date:", e);
    }

    // Fallback to current date
    return new Date();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        console.log("Initializing form with data:", initialData);

        // Parse dates properly
        const startDate = parseDateString(initialData.startDate);
        const endDate = parseDateString(initialData.endDate);

        form.reset({
          startDate: startDate,
          endDate: endDate,
          academyYear: initialData.academyYear || new Date().getFullYear(),
          semester: initialData.semester || SemesterEnum.SEMESTER_1,
          status: Constants.ACTIVE,
        });
      } else {
        form.reset({
          startDate: new Date(),
          endDate: new Date(),
          academyYear: new Date().getFullYear(),
          semester: SemesterEnum.SEMESTER_1,
          status: Constants.ACTIVE,
        });
      }
    }
  }, [isOpen, initialData, mode, form]);

  const handleYearChange = (year: number) => {
    form.setValue("academyYear", year, {
      shouldValidate: true,
    });
  };

  const handleSubmit = async (data: SemesterFormData) => {
    setIsUploading(true);
    try {
      // Format dates to YYYY-MM-DD string format
      const formattedStartDate = format(data.startDate, "yyyy-MM-dd");
      const formattedEndDate = format(data.endDate, "yyyy-MM-dd");

      const submitData: SemesterModel = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        academyYear: data.academyYear,
        semester: data.semester,
        status: Constants.ACTIVE,
      };

      if (mode === "edit" && initialData?.id) {
        submitData.id = initialData.id;
      }

      onSubmit(submitData);
    } catch (error) {
      toast.error("An error occurred while saving semester");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-h-[90vh] rounded-xl overflow-y-auto ${
          isMobile ? "max-w-sm" : "max-w-lg"
        }`}
      >
        {" "}
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Semester" : "Edit Semester"}
          </DialogTitle>
          <DialogDescription>
            Fill in the information below to{" "}
            {mode === "add" ? "create" : "update"} a semester.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Start Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    End Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < form.getValues().startDate}
                      />
                    </PopoverContent>
                  </Popover>
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

            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Semester <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value as SemesterEnum)
                    }
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a semester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SemesterEnum.SEMESTER_1}>
                        Semester 1
                      </SelectItem>
                      <SelectItem value={SemesterEnum.SEMESTER_2}>
                        Semester 2
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 justify-end mr-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || isSubmitting}
                className="bg-green-900 text-white hover:bg-green-950"
              >
                {isUploading || isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  "Save Semester"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
