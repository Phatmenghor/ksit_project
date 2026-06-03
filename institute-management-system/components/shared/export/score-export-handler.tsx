import { useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { exportSubmissionStudentsToPDF } from "@/utils/generate-file/score/pdf-submission-score";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { exportApprovedStudentsToExcelWithSchedule } from "@/utils/generate-file/score/excel-submission-score";

// Enhanced export handlers with improved functionality
export const useExportScoreHandlers = (
  submission: SubmissionScoreModel | null,
  schedule: ScheduleModel | null
) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf" | null>(null);

  // Validation helper
  const validateData = () => {
    if (!submission?.studentScores || submission.studentScores.length === 0) {
      toast.error("No student data available to export");
      return false;
    }
    return true;
  };

  // Generate dynamic filename based on submission data
  const generateFileName = (type: "excel" | "pdf") => {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const courseName =
      submission?.courseName?.replace(/[^a-zA-Z0-9]/g, "_") || "Course";
    const classCode = submission?.classCode || "Class";
    const extension = type === "excel" ? "xlsx" : "pdf";

    return `${courseName}_${classCode}_Scores_${timestamp}.${extension}`;
  };

  const handleExportToExcelWithSchedule = async (options?: {
    includeComments?: boolean;
    includeCreatedAt?: boolean;
    customFileName?: string;
  }) => {
    if (!validateData()) return;
    if (!schedule) {
      toast.error("Schedule information is missing");
      return;
    }

    setIsExporting(true);
    setExportType("excel");

    try {
      const fileName = options?.customFileName || generateFileName("excel");

      toast.loading("Preparing Excel export with schedule...", {
        id: "excel-export",
      });

      await exportApprovedStudentsToExcelWithSchedule(
        submission?.studentScores ?? [],
        schedule, // Pass schedule model
        fileName,
        {
          includeComments: options?.includeComments ?? true,
          includeCreatedAt: options?.includeCreatedAt ?? false,
        }
      );

      toast.success(
        `Excel file exported successfully! (${submission?.studentScores.length} students)`,
        { id: "excel-export" }
      );
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel file. Please try again.", {
        id: "excel-export",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Enhanced Excel export handler
  const handleExportToExcel = async (options?: {
    includeComments?: boolean;
    includeCreatedAt?: boolean;
    customFileName?: string;
  }) => {
    if (!validateData()) return;

    setIsExporting(true);
    setExportType("excel");

    try {
      const fileName = options?.customFileName || generateFileName("excel");

      toast.loading("Preparing Excel export...", { id: "excel-export" });

      await exportApprovedStudentsToExcelAdvanced(
        submission?.studentScores ?? [],
        fileName,
        {
          includeComments: options?.includeComments ?? true,
          includeCreatedAt: options?.includeCreatedAt ?? false,
          title: `${submission?.courseName || "Course"} - Score Report`,
          sheetName: submission?.classCode || "Student Scores",
        }
      );

      toast.success(
        `Excel file exported successfully! (${submission?.studentScores.length} students)`,
        { id: "excel-export" }
      );
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel file. Please try again.", {
        id: "excel-export",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Enhanced PDF export handler
  const handleExportToPDF = async (options?: {
    orientation?: "portrait" | "landscape";
    includeComments?: boolean;
    includeCreatedAt?: boolean;
    customFileName?: string;
    pageSize?: "a4" | "a3" | "letter";
  }) => {
    if (!validateData()) return;

    setIsExporting(true);
    setExportType("pdf");

    try {
      const fileName = options?.customFileName || generateFileName("pdf");

      toast.loading("Generating PDF report...", { id: "pdf-export" });

      console.log("##Schedule: ", schedule);
      await exportSubmissionStudentsToPDF(
        submission?.studentScores ?? [],
        fileName,
        {
          title: `${submission?.courseName ?? "Course"} Score Report`,
          subtitle: `Class: ${submission?.classCode ?? "N/A"} | Semester: ${
            schedule?.semester?.semester ?? "N/A"
          }`,
          instructor: submission?.teacherName ?? "N/A",
          courseName: submission?.courseName ?? "N/A",
          courseCode: schedule?.course?.code ?? "N/A",
          totalStudent: submission?.studentScores?.length ?? 0,
          semester: schedule?.semester?.semester ?? "N/A",
          credit: schedule?.course?.credit ?? 0,
          degree: schedule?.classes?.degree ?? "N/A",
          department: schedule?.classes?.major?.department?.name ?? "N/A",
          levelYear: schedule?.classes.academyYear ?? "N/A",
          major: schedule?.classes?.major?.name ?? "N/A",
          yearOfStudy: new Date().getFullYear().toString(),
          orientation: options?.orientation ?? "landscape",
          pageSize: options?.pageSize ?? "a4",
          includeComments: options?.includeComments ?? true,
          includeCreatedAt: options?.includeCreatedAt ?? false,
          showGradeColors: true,
        }
      );

      toast.success(
        `PDF report generated successfully! (${submission?.studentScores.length} students)`,
        { id: "pdf-export" }
      );
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF report. Please try again.", {
        id: "pdf-export",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Quick export handlers for default options
  const handleQuickExcelExport = () => handleExportToExcel();
  const handleQuickPDFExport = () => handleExportToPDF();

  // Batch export both formats
  const handleExportBoth = async () => {
    if (!validateData()) return;

    setIsExporting(true);
    toast.loading("Exporting both Excel and PDF...", { id: "batch-export" });

    try {
      await Promise.all([
        handleExportToExcel({ customFileName: generateFileName("excel") }),
        handleExportToPDF({ customFileName: generateFileName("pdf") }),
      ]);

      toast.success("Both Excel and PDF files exported successfully!", {
        id: "batch-export",
      });
    } catch (error) {
      console.error("Batch export error:", error);
      toast.error("Failed to export files. Please try again.", {
        id: "batch-export",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportType,
    handleExportToExcel,
    handleExportToPDF,
    handleQuickExcelExport,
    handleQuickPDFExport,
    handleExportBoth,
    handleExportToExcelWithSchedule,
    hasData: (submission?.studentScores?.length ?? 0) > 0,
  };
};

// Export Button Component with Dropdown Options
export const ExportButtonGroup = ({
  submission,
  schedule,
}: {
  submission: SubmissionScoreModel;
  schedule: ScheduleModel;
}) => {
  const {
    isExporting,
    exportType,
    handleExportToExcel,
    handleExportToPDF,
    handleExportBoth,
    hasData,
  } = useExportScoreHandlers(submission, schedule);

  if (!hasData) {
    return (
      <Button variant="outline" disabled>
        <Download className="h-4 w-4 mr-2" />
        No Data to Export
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {/* Quick Export Buttons */}
      <Button
        onClick={() => handleExportToExcel()}
        variant="outline"
        size="sm"
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {isExporting && exportType === "excel" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Excel
      </Button>

      <Button
        onClick={() => handleExportToPDF()}
        variant="outline"
        size="sm"
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {isExporting && exportType === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        PDF
      </Button>

      {/* Advanced Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            More Options
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => handleExportToExcel({ includeComments: false })}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel (No Comments)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExportToExcel({ includeCreatedAt: true })}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel (with Dates)
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleExportToPDF({ orientation: "portrait" })}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF Portrait
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExportToPDF({ pageSize: "a3" })}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF A3 Size
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExportToPDF({ includeComments: false })}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF (No Comments)
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleExportBoth}>
            <Download className="h-4 w-4 mr-2" />
            Export Both Formats
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Simple Export Buttons (Alternative Implementation)
export const SimpleExportButtons = ({
  submission,
  schedule,
}: {
  submission: SubmissionScoreModel;
  schedule: ScheduleModel;
}) => {
  const {
    isExporting,
    exportType,
    handleQuickExcelExport,
    handleQuickPDFExport,
    hasData,
  } = useExportScoreHandlers(submission, schedule);

  if (!hasData) return null;

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleQuickExcelExport}
        variant="outline"
        size="sm"
        disabled={isExporting}
      >
        {isExporting && exportType === "excel" ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        Export Excel
      </Button>

      <Button
        onClick={handleQuickPDFExport}
        variant="outline"
        size="sm"
        disabled={isExporting}
      >
        {isExporting && exportType === "pdf" ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        Export PDF
      </Button>
    </div>
  );
};
