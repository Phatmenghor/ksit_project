import { useState } from "react";
import { toast } from "sonner";
import { TranscriptModel } from "@/model/request/request-transcript";

interface UseStudentExportProps {
  transcriptData?: TranscriptModel | null;
}

export const useStudentExport = ({ transcriptData }: UseStudentExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"pdf" | null>(null);

  const exportTranscriptAsPDF = async (customFilename?: string) => {
    if (!transcriptData) {
      toast.error("No academic data available for export");
      return;
    }
    setIsExporting(true);
    setExportType("pdf");
    const loadingToast = toast.loading("Generating PDF transcript...");
    try {
      const { exportTranscriptToPDF } = await import("@/utils/pdf/transcript-pdf-exporter");

      // Live API data — all transcript fields (including nationality, place of
      // birth, admission/graduation, grades and totals) come from the backend.
      const data = transcriptData;

      const filename =
        (typeof customFilename === "string" ? customFilename : undefined) ||
        `${data.studentCode}_transcript_${new Date().toISOString().split("T")[0]}.pdf`;

      await exportTranscriptToPDF(data, {}, filename);
      toast.dismiss(loadingToast);
      toast.success("PDF transcript exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to export PDF transcript");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return {
    exportTranscriptAsPDF,
    isExporting,
    exportType,
    canExport: !!transcriptData,
  };
};
