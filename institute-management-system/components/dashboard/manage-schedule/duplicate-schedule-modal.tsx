import React, { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { YearSelector } from "@/components/shared/year-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusEnum } from "@/constants/constant";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { DuplicateFilterModel } from "@/model/attendance/schedule/schedule-filter";
import { toast } from "sonner";
import { duplicateScheduleService } from "@/service/schedule/schedule.service";
import { DuplicateScheduleResponse } from "@/model/attendance/schedule/schedule-model";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { getAllSemesterService } from "@/service/master-data/semester.service";
import { Copy, Loader2, X } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

type DuplicateScheduleModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sources: { sourceClassId: number; sourceSemesterId: number }[];
  onSuccess?: (response: DuplicateScheduleResponse & { summary?: { success: number; total: number; failed: number; skipped: number }; errors?: string[] }) => void;
};

export default function DuplicateScheduleModal({ isOpen, onOpenChange, sources, onSuccess }: DuplicateScheduleModalProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [semesters, setSemesters] = useState<SemesterModel[]>([]);

  const fetchSemesters = useCallback(async (academyYear: number) => {
    if (!academyYear) return;
    setIsLoadingSemesters(true);
    try {
      const result = await getAllSemesterService({ academyYear, status: StatusEnum.ACTIVE });
      if (result?.content) setSemesters(result.content);
      else { setSemesters([]); toast.warning("No semesters found for the selected year"); }
    } catch { toast.error("Failed to load semesters"); setSemesters([]); }
    finally { setIsLoadingSemesters(false); }
  }, []);

  useEffect(() => {
    if (isOpen && selectedYear) { fetchSemesters(selectedYear); setSelectedSemester(""); }
  }, [isOpen, selectedYear, fetchSemesters]);

  const getSemesterEnum = useCallback((id: number) => {
    const semester = semesters.find((s) => s.id === id);
    return semester?.semester || "SEMESTER_1";
  }, [semesters]);

  const handleSave = async () => {
    if (!selectedClass || !selectedSemester || sources.length === 0) { toast.error("Please select all required fields."); return; }
    setIsSubmitting(true);
    try {
      const results: DuplicateScheduleResponse[] = [];
      const errors: string[] = [];
      for (const source of sources) {
        const data: DuplicateFilterModel = { sourceClassId: source.sourceClassId, sourceSemesterId: source.sourceSemesterId, targetClassId: selectedClass.id, targetSemesterId: parseInt(selectedSemester) };
        try {
          const result = await duplicateScheduleService(data);
          if (result) results.push(result);
          else errors.push(`Failed to duplicate from source class ${source.sourceClassId}`);
        } catch { errors.push(`Error duplicating from source class ${source.sourceClassId}`); }
      }

      if (results.length === 0) { toast.error("No schedules were successfully duplicated. Please try again."); return; }

      const duplicatedSchedules = results.flatMap((r) => r.data?.duplicatedSchedules || []);
      const total = results.reduce((acc, r) => {
        const data = r.data;
        acc.success += data?.successfullyDuplicated || 0;
        acc.total += data?.totalSourceSchedules || 0;
        acc.failed += data?.failed || 0;
        acc.skipped += data?.skipped || 0;
        if (data?.errors?.length) errors.push(...data.errors);
        return acc;
      }, { success: 0, total: 0, failed: 0, skipped: 0 });

      if (total.success > 0) {
        if (total.failed === 0 && errors.length === 0) toast.success(`Duplicated ${total.success} schedule${total.success > 1 ? "s" : ""} to ${selectedClass.code || "selected class"}${total.skipped > 0 ? ` (${total.skipped} already existed)` : ""}`);
        else toast.success([total.success > 0 && `Duplicated ${total.success}`, total.skipped > 0 && `Skipped ${total.skipped}`, total.failed > 0 && `Failed ${total.failed}`].filter(Boolean).join(" • "));
      } else {
        toast.warning("No new schedules were created. All schedules may already exist or have failed.");
      }

      if (onSuccess && results.length > 0) {
        onSuccess({
          ...results[0],
          data: { ...results[0].data, duplicatedSchedules },
          summary: total,
          errors: errors.length > 0 ? errors : undefined,
        });
      }
      onOpenChange(false);
      resetForm();
    } catch { toast.error("An unexpected error occurred while duplicating schedules. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedSemester("");
    setSelectedClass(null);
  };

  const handleDiscard = () => { resetForm(); onOpenChange(false); };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title="Duplicate Schedule"
          description="Select the target class and semester to duplicate the schedule."
          icon={<Copy className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />

        <FormBody>
          <div className="space-y-1">
            <label className="text-sm font-medium">Academic Year <span className="text-red-500">*</span></label>
            <YearSelector value={selectedYear} onChange={setSelectedYear} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Semester <span className="text-red-500">*</span></label>
            <Select onValueChange={setSelectedSemester} value={selectedSemester} disabled={isSubmitting || isLoadingSemesters}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingSemesters ? "Loading semesters..." : "Select a semester"} />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id?.toString() ?? ""}>
                    {getSemesterEnum(semester.id ?? 0).replace("_", " ")} - {semester.semesterType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Class <span className="text-red-500">*</span></label>
            <ComboboxSelectClass disabled={isSubmitting} dataSelect={selectedClass} onChangeSelected={setSelectedClass} />
          </div>
        </FormBody>

        <FormFooter>
          <Button variant="outline" size="sm" onClick={handleDiscard} disabled={isSubmitting} className="h-9 px-4 gap-1.5 text-muted-foreground hover:text-foreground border-border/60">
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="h-9 px-4 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
            {isSubmitting ? "Duplicating..." : "Duplicate Schedule"}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
