"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { StatusEnum } from "@/constants/constant";
import { GenerateMultipleStudent } from "@/model/user/student/student.request.model";
import { generateMultipleStudentService } from "@/service/user/student.service";
import { exportStudentsToExcel } from "@/utils/excel/Excel-Generate";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";

// Validation schema for generating multiple students
const generateMultipleStudentSchema = z.object({
  classId: z.object({
    id: z.number(),
    code: z.string(),
  }),
  quantity: z
    .string()
    .regex(/^\d+$/, { message: "Quantity must be a positive number" })
    .refine((val) => parseInt(val, 10) >= 1, {
      message: "Quantity must be at least 1",
    }),
  status: z.string().min(1, "Status is required"),
});

// TypeScript type inferred from the schema
export type GenerateMultipleStudentSchema = z.infer<
  typeof generateMultipleStudentSchema
>;

export default function GenerateMultiStudentForm() {
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form setup with Zod schema resolver
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<GenerateMultipleStudentSchema>({
    resolver: zodResolver(generateMultipleStudentSchema),
    defaultValues: {
      classId: undefined,
      quantity: "",
      status: StatusEnum.ACTIVE,
    },
  });

  // Submit handler for generating students and exporting to Excel
  const onSubmitStudent = async (data: GenerateMultipleStudentSchema) => {
    setIsLoading(true);
    try {
      // Check if classId is valid before proceeding
      if (!data.classId || !data.classId.id) {
        toast.error("Please select a valid class.");
        setIsLoading(false);
        return;
      }

      const payload: GenerateMultipleStudent = {
        classId: Number(data.classId.id),
        quantity: Number(data.quantity),
        status: StatusEnum.ACTIVE,
      };

      const response = await generateMultipleStudentService(payload);

      // Export generated students to Excel file
      await exportStudentsToExcel(
        response?.data ?? [],
        "generated_students.xlsx"
      );
      toast.success("Student generated successfully");
    } catch (error) {
      toast.error("Failed to generate student");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitStudent)} className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-bold">
                Generate Multiple Students
              </h2>
              <Separator />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium"
                >
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      disabled={isSubmitting}
                      placeholder="Enter number of students to generate"
                    />
                  )}
                />
                {errors.quantity?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Class */}
              <div>
                <label
                  htmlFor="classId"
                  className="mb-2 block text-sm font-medium"
                >
                  Class <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="classId"
                  render={({ field }) => (
                    <ComboboxSelectClass
                      disabled={isSubmitting}
                      dataSelect={field.value as any} // Ensure field.value is a full ClassModel object
                      onChangeSelected={(selected) => field.onChange(selected)}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Submit Actions */}
      <Card>
        <CardContent className="pt-4 flex justify-end gap-3">
          <Button
            type="submit"
            className="bg-teal-900 hover:bg-teal-950 text-white"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
