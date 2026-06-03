import React, { useCallback, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { YearSelector } from "@/components/shared/year-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusEnum } from "@/constants/constant";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { Separator } from "@/components/ui/separator";
import { DuplicateFilterModel } from "@/model/attendance/schedule/schedule-filter";
import { toast } from "sonner";
import { duplicateScheduleService } from "@/service/schedule/schedule.service";
import { DuplicateScheduleResponse } from "@/model/attendance/schedule/schedule-model";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { getAllSemesterService } from "@/service/master-data/semester.service";

type DuplicateScheduleModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sources: { sourceClassId: number; sourceSemesterId: number }[];
  onSuccess?: (
    response: DuplicateScheduleResponse & {
      summary?: {
        success: number;
        total: number;
        failed: number;
        skipped: number;
      };
      errors?: string[];
    }
  ) => void;
};

export default function DuplicateScheduleModal({
  isOpen,
  onOpenChange,
  sources,
  onSuccess,
}: DuplicateScheduleModalProps) {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [semesters, setSemesters] = useState<SemesterModel[]>([]);

  const fetchSemesters = useCallback(async (academyYear: number) => {
    if (!academyYear) return;

    setIsLoadingSemesters(true);
    try {
      const result = await getAllSemesterService({
        academyYear,
        status: StatusEnum.ACTIVE,
      });

      if (result?.content) {
        setSemesters(result.content);
      } else {
        setSemesters([]);
        toast.warning("No semesters found for the selected year");
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Failed to load semesters");
      setSemesters([]);
    } finally {
      setIsLoadingSemesters(false);
    }
  }, []);

  // Load semesters when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchSemesters(selectedYear);
      // Reset semester selection when year changes
      setSelectedSemester("");
    }
  }, [selectedYear, fetchSemesters]);

  // Load semesters when modal opens
  useEffect(() => {
    if (isOpen && selectedYear) {
      fetchSemesters(selectedYear);
    }
  }, [isOpen, selectedYear, fetchSemesters]);

  const getSemesterEnum = useCallback(
    (id: number) => {
      const semester = semesters.find((s) => s.id === id);
      return semester?.semester || "SEMESTER_1";
    },
    [semesters]
  );

  const handleSave = async () => {
    if (!selectedClass || !selectedSemester || sources.length === 0) {
      toast.error("Please select all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const results: DuplicateScheduleResponse[] = [];
      const errors: string[] = [];

      // Process each source
      for (const source of sources) {
        const data: DuplicateFilterModel = {
          sourceClassId: source.sourceClassId,
          sourceSemesterId: source.sourceSemesterId,
          targetClassId: selectedClass.id,
          targetSemesterId: parseInt(selectedSemester),
        };

        try {
          const result = await duplicateScheduleService(data);
          if (result) {
            results.push(result);
          } else {
            errors.push(
              `Failed to duplicate from source class ${source.sourceClassId}`
            );
          }
        } catch (sourceError) {
          console.error("Error duplicating from source:", source, sourceError);
          errors.push(
            `Error duplicating from source class ${source.sourceClassId}`
          );
        }
      }

      // Check if we have any successful results
      if (results.length === 0) {
        toast.error(
          "No schedules were successfully duplicated. Please try again."
        );
        return;
      }

      // Combine all results
      const total = results.reduce(
        (acc, r) => {
          // Handle different possible response structures
          const data = r?.data || r;
          acc.success += data?.successfullyDuplicated || 0;
          acc.total += data?.totalSourceSchedules || 0;
          acc.failed += data?.failed || 0;
          acc.skipped += data?.skipped || 0;
          return acc;
        },
        { success: 0, total: 0, failed: 0, skipped: 0 }
      );

      // Create comprehensive success message
      const getSuccessMessage = () => {
        const parts = [];

        if (total.success > 0) {
          parts.push(
            `Successfully duplicated ${total.success} schedule${
              total.success > 1 ? "s" : ""
            }`
          );
        }

        if (total.skipped > 0) {
          parts.push(
            `Skipped ${total.skipped} (already exist${
              total.skipped > 1 ? "" : "s"
            })`
          );
        }

        if (total.failed > 0) {
          parts.push(`Failed ${total.failed}`);
        }

        if (errors.length > 0) {
          parts.push(
            `${errors.length} source error${errors.length > 1 ? "s" : ""}`
          );
        }

        return parts.join(" • ");
      };

      // Show appropriate toast based on results
      if (total.success > 0) {
        if (total.failed === 0 && errors.length === 0) {
          // Perfect success
          toast.success(
            `Perfect! Duplicated ${total.success} schedule${
              total.success > 1 ? "s" : ""
            } to ${selectedClass.code || "selected class"}${
              total.skipped > 0 ? ` (${total.skipped} already existed)` : ""
            }`
          );
        } else {
          // Partial success
          toast.success(getSuccessMessage());
        }
      } else {
        // No successful duplications
        toast.warning(
          "No new schedules were created. All schedules may already exist or have failed."
        );
      }

      // Log detailed results for debugging
      console.log("Duplication Results:", {
        total,
        results,
        errors,
        targetClass: selectedClass.code,
        targetSemester: selectedSemester,
      });

      // Call success callback with comprehensive data
      if (onSuccess && results.length > 0) {
        onSuccess({
          ...results[0], // Original response structure
          summary: total, // Add summary for better handling
          errors: errors.length > 0 ? errors : undefined,
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Unexpected error during duplication:", error);
      toast.error(
        "An unexpected error occurred while duplicating schedules. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedSemester("");
    setSelectedClass(null);
  };

  const handleDiscard = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-lg max-w-sm w-full p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Duplicate Schedule</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          {/* Academic Year Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <YearSelector value={selectedYear} onChange={handleYearChange} />
            </div>
          </div>

          {/* Semester Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Semester <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Select
                onValueChange={setSelectedSemester}
                value={selectedSemester}
                disabled={isSubmitting || isLoadingSemesters}
              >
                <SelectTrigger className="flex gap-2">
                  <SelectValue
                    placeholder={
                      isLoadingSemesters
                        ? "Loading semesters..."
                        : "Select a semester"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem
                      key={semester.id}
                      value={semester.id?.toString() ?? ""}
                    >
                      {getSemesterEnum(semester.id ?? 0).replace("_", " ")} -{" "}
                      {semester.semesterType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Class <span className="text-red-500">*</span>
            </label>
            <ComboboxSelectClass
              disabled={isSubmitting}
              dataSelect={selectedClass}
              onChangeSelected={setSelectedClass}
            />
          </div>
        </div>

        <Separator className="bg-gray-300" />

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-green-900 hover:bg-green-950 text-white"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Duplicating..." : "Duplicate Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
