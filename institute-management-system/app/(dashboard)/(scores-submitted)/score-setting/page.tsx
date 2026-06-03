"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Edit, AlertTriangle, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Input } from "@/components/ui/input";
import { ScoreConfigurationModel } from "@/model/score/submitted-score/submitted-score.response.model";
import { z } from "zod";
import {
  configureScoreService,
  getConfigurationScoreService,
} from "@/service/score/score.service";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile } from "@/hooks/use-mobile";
import Loading from "@/components/shared/loading";

const ConfigureScoreSchema = z
  .object({
    attendancePercentage: z
      .number()
      .min(0, "Attendance percentage must be at least 0")
      .max(100, "Attendance percentage cannot exceed 100"),
    assignmentPercentage: z
      .number()
      .min(0, "Assignment percentage must be at least 0")
      .max(100, "Assignment percentage cannot exceed 100"),
    midtermPercentage: z
      .number()
      .min(0, "Midterm percentage must be at least 0")
      .max(100, "Midterm percentage cannot exceed 100"),
    finalPercentage: z
      .number()
      .min(0, "Final percentage must be at least 0")
      .max(100, "Final percentage cannot exceed 100"),
  })
  .refine(
    (data) => {
      const total =
        data.attendancePercentage +
        data.assignmentPercentage +
        data.midtermPercentage +
        data.finalPercentage;
      return total <= 100;
    },
    {
      message: "Total percentage cannot exceed 100%",
      path: ["totalPercentage"],
    }
  );

type ScoreFormData = z.infer<typeof ConfigureScoreSchema>;

export default function ScoreSettingPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreConfigurationModel | null>(
    null
  );
  const [originalValues, setOriginalValues] = useState<ScoreFormData | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
    setValue,
  } = useForm<ScoreFormData>({
    resolver: zodResolver(ConfigureScoreSchema),
    defaultValues: {
      assignmentPercentage: 0,
      attendancePercentage: 0,
      midtermPercentage: 0,
      finalPercentage: 0,
    },
    mode: "onChange", // Enable real-time validation
  });

  // Watch all form values to calculate total
  const watchedValues = watch();
  const isMobile = useIsMobile();

  // Fetch initial configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await getConfigurationScoreService();
        console.log("response data: ", response);

        setScoreData(response);

        // Reset form with fetched data, ensuring we handle undefined/null values
        const formData = {
          attendancePercentage: response?.attendancePercentage ?? 0,
          assignmentPercentage: response?.assignmentPercentage ?? 0,
          midtermPercentage: response?.midtermPercentage ?? 0,
          finalPercentage: response?.finalPercentage ?? 0,
        };

        console.log("Setting form data:", formData);
        reset(formData);
      } catch (error) {
        console.error("Failed to fetch score settings:", error);
        toast.error("Failed to fetch score settings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [reset]);

  // Calculate total percentage from watched values
  const calculateTotal = useCallback(() => {
    return (
      (watchedValues.attendancePercentage || 0) +
      (watchedValues.assignmentPercentage || 0) +
      (watchedValues.midtermPercentage || 0) +
      (watchedValues.finalPercentage || 0)
    );
  }, [watchedValues]);

  const totalPercentage = calculateTotal();

  const handleEdit = () => {
    // Capture current form values before entering edit mode
    const currentFormValues = {
      attendancePercentage: watchedValues.attendancePercentage ?? 0,
      assignmentPercentage: watchedValues.assignmentPercentage ?? 0,
      midtermPercentage: watchedValues.midtermPercentage ?? 0,
      finalPercentage: watchedValues.finalPercentage ?? 0,
    };

    console.log("Capturing original values for discard:", currentFormValues);
    setOriginalValues(currentFormValues);
    setIsEditing(true);
  };

  const handleDiscard = () => {
    console.log("Discarding changes, restoring to:", originalValues);

    // Reset form to the captured original values
    if (originalValues) {
      reset(originalValues);
    } else {
      // Fallback to scoreData if originalValues is somehow null
      const fallbackValues = {
        attendancePercentage: scoreData?.attendancePercentage ?? 0,
        assignmentPercentage: scoreData?.assignmentPercentage ?? 0,
        midtermPercentage: scoreData?.midtermPercentage ?? 0,
        finalPercentage: scoreData?.finalPercentage ?? 0,
      };
      console.log("Using fallback values:", fallbackValues);
      reset(fallbackValues);
    }

    setIsEditing(false);
    setOriginalValues(null);
  };

  const onSubmit = async (data: ScoreFormData) => {
    try {
      setIsSaving(true);
      const response = await configureScoreService(data);

      if (response) {
        toast.success("Score settings updated successfully!");
        setScoreData(response);

        // Update form with new data
        reset({
          attendancePercentage: response.attendancePercentage || 0,
          assignmentPercentage: response.assignmentPercentage || 0,
          midtermPercentage: response.midtermPercentage || 0,
          finalPercentage: response.finalPercentage || 0,
        });

        setIsEditing(false);
      } else {
        toast.error("Failed to update score settings.");
      }
    } catch (error) {
      console.error("Error saving score settings:", error);
      toast.error("Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = isValid && totalPercentage <= 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading score settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-start justify-start p-6 space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={ROUTE.DASHBOARD}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Score Setting</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-2xl font-bold text-gray-900">Score Setting</h1>

            <div className="flex items-start gap-3 rounded-lg p-4 bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> The total score setting cannot exceed
                100%. Make sure all components add up to a maximum of 100%.
              </p>
            </div>

            {/* Total Percentage Indicator */}
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                totalPercentage > 100
                  ? "bg-red-50 border-red-200 text-red-700"
                  : totalPercentage === 100
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              {totalPercentage > 100 ? (
                <X className="w-4 h-4" />
              ) : totalPercentage === 100 ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                Total: {totalPercentage}%
                {totalPercentage > 100 && " (Exceeds limit!)"}
                {totalPercentage === 100 && " (Perfect!)"}
                {totalPercentage < 100 &&
                  ` (${100 - totalPercentage}% remaining)`}
              </span>
            </div>
          </CardContent>
        </Card>
        <div className={`overflow-x-auto mt-4 ${isMobile ? "pl-4" : ""}`}>
          {isLoading ? (
            <Loading />
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-900 text-white">
                  <TableHead className="text-white">#</TableHead>
                  <TableHead className="text-white">Attendance (%)</TableHead>
                  <TableHead className="text-white">Assignment (%)</TableHead>
                  <TableHead className="text-white">Midterm (%)</TableHead>
                  <TableHead className="text-white">Final (%)</TableHead>
                  {!isEditing && (
                    <TableHead className="text-white">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    {scoreData?.id || 1}
                  </TableCell>

                  <TableCell>
                    <Controller
                      name="attendancePercentage"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          {isEditing ? (
                            <Input
                              {...field}
                              type="number"
                              className={`h-8 px-2 text-sm ${
                                errors.attendancePercentage
                                  ? "border-red-500"
                                  : ""
                              }`}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                if (value >= 0 && value <= 100) {
                                  field.onChange(value);
                                }
                              }}
                              min={0}
                              max={100}
                              placeholder="0"
                            />
                          ) : (
                            <span className="font-medium">
                              {field.value || 0}%
                            </span>
                          )}
                          {errors.attendancePercentage && (
                            <p className="text-xs text-red-500">
                              {errors.attendancePercentage.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <Controller
                      name="assignmentPercentage"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          {isEditing ? (
                            <Input
                              {...field}
                              type="number"
                              className={`h-8 px-2 text-sm ${
                                errors.assignmentPercentage
                                  ? "border-red-500"
                                  : ""
                              }`}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                if (value >= 0 && value <= 100) {
                                  field.onChange(value);
                                }
                              }}
                              min={0}
                              max={100}
                              placeholder="0"
                            />
                          ) : (
                            <span className="font-medium">
                              {field.value || 0}%
                            </span>
                          )}
                          {errors.assignmentPercentage && (
                            <p className="text-xs text-red-500">
                              {errors.assignmentPercentage.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <Controller
                      name="midtermPercentage"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          {isEditing ? (
                            <Input
                              {...field}
                              type="number"
                              className={`h-8 px-2 text-sm ${
                                errors.midtermPercentage ? "border-red-500" : ""
                              }`}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                if (value >= 0 && value <= 100) {
                                  field.onChange(value);
                                }
                              }}
                              min={0}
                              max={100}
                              placeholder="0"
                            />
                          ) : (
                            <span className="font-medium">
                              {field.value || 0}%
                            </span>
                          )}
                          {errors.midtermPercentage && (
                            <p className="text-xs text-red-500">
                              {errors.midtermPercentage.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <Controller
                      name="finalPercentage"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1">
                          {isEditing ? (
                            <Input
                              {...field}
                              type="number"
                              className={`h-8 px-2 text-sm ${
                                errors.finalPercentage ? "border-red-500" : ""
                              }`}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                if (value >= 0 && value <= 100) {
                                  field.onChange(value);
                                }
                              }}
                              min={0}
                              max={100}
                              placeholder="0"
                            />
                          ) : (
                            <span className="font-medium">
                              {field.value || 0}%
                            </span>
                          )}
                          {errors.finalPercentage && (
                            <p className="text-xs text-red-500">
                              {errors.finalPercentage.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </TableCell>

                  {!isEditing && (
                    <TableCell>
                      <Button onClick={handleEdit} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>

        {/* Validation Error Summary */}
        {isEditing && errors.root && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {errors.root.message}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons (shown only in edit mode) */}
        {isEditing && (
          <Card className="w-full">
            <CardContent className="flex justify-end gap-3 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                className="px-6"
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Discard
              </Button>
              <Button
                type="submit"
                className="px-6 bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                disabled={!isFormValid || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  );
}
