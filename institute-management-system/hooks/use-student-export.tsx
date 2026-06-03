import { useState } from "react";
import { toast } from "sonner";
import { TranscriptModel } from "@/model/request/request-transcript";
import { AcademicTranscriptExporter } from "@/utils/excel/academic-transcript-exporter";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

interface UseStudentExportProps {
  transcriptData?: TranscriptModel | null;
  studentDetail?: StudentByIdModel;
}

export const useStudentExport = ({
  transcriptData,
  studentDetail,
}: UseStudentExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  // ========== ACADEMIC TRANSCRIPT EXPORT ==========
  const exportAcademicTranscript = async (customFilename?: string) => {
    if (!transcriptData) {
      toast.error("No academic data available for export");
      return;
    }

    setIsExporting(true);
    try {
      const loadingToast = toast.loading("Generating academic transcript...");

      const filename =
        (typeof customFilename === "string" ? customFilename : undefined) ||
        `${transcriptData.studentCode}_academic_transcript_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;

      await AcademicTranscriptExporter.exportToExcel(
        transcriptData,
        studentDetail,
        filename
      );

      toast.dismiss(loadingToast);
      toast.success("Academic transcript exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export academic transcript");
    } finally {
      setIsExporting(false);
    }
  };

  // ========== RETURN VALUES ==========
  return {
    // Academic exports
    exportAcademicTranscript,

    // Status flags
    isExporting,
    canExportAcademic: !!transcriptData,
  };
};
