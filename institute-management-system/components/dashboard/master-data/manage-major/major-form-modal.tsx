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
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { useIsMobile } from "@/hooks/use-mobile";

const majorFormSchema = z.object({
  name: z.string().min(1, { message: "Room name is required" }),
  code: z.string().min(1, { message: "Room code is required" }),
  departmentId: z.number().min(1, { message: "Department is required" }),
  status: z.literal(Constants.ACTIVE),
});

export type MajorFormData = z.infer<typeof majorFormSchema> & {
  id?: number;
};

interface MajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MajorFormData) => void;
  initialData?: MajorFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function MajorFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isSubmitting = false,
}: MajorModalProps) {
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentModel | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isMobile = useIsMobile();
  const form = useForm<MajorFormData>({
    resolver: zodResolver(majorFormSchema),
    defaultValues: {
      name: "",
      code: "",
      departmentId: 0,
      status: Constants.ACTIVE,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        form.reset({
          name: initialData.name || "",
          code: initialData.code || "",
          departmentId: initialData.departmentId || 0,
          status: Constants.ACTIVE,
        });
      } else {
        form.reset({
          name: "",
          code: "",
          departmentId: 0,
          status: Constants.ACTIVE,
        });
        setSelectedDepartment(null);
      }
    }
  }, [isOpen, initialData, mode, form]);

  const handleDepartmentChange = (department: DepartmentModel) => {
    setSelectedDepartment(department);
    form.setValue("departmentId", department.id as number, {
      shouldValidate: true,
    });
  };

  const handleSubmit = async (data: MajorFormData) => {
    setIsUploading(true);
    try {
      const submitData: MajorFormData = {
        ...data,
        status: Constants.ACTIVE,
      };

      if (mode === "edit" && initialData?.id) {
        submitData.id = initialData.id;
      }

      onSubmit(submitData);
    } catch (error) {
      toast.error("An error occurred while saving major");
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
            {mode === "add" ? "Add Major" : "Edit Major"}
          </DialogTitle>
          <DialogDescription>
            Fill in the information below to{" "}
            {mode === "add" ? "create" : "update"} a room.
          </DialogDescription>
        </DialogHeader>
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
                    Major Code <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter major code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Major Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter major name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Department <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboboxSelectDepartment
                      dataSelect={selectedDepartment}
                      onChangeSelected={handleDepartmentChange}
                    />
                  </FormControl>
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
                  "Save Major"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
