import { useState } from "react";
import { toast } from "sonner";
import { TranscriptModel } from "@/model/request/request-transcript";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

interface UseStudentExportProps {
  transcriptData?: TranscriptModel | null;
  studentDetail?: StudentByIdModel;
}

export const useStudentExport = ({
  transcriptData,
}: UseStudentExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"word" | "pdf" | null>(null);

  const exportTranscriptAsWord = async (customFilename?: string) => {
    if (!transcriptData) {
      toast.error("No academic data available for export");
      return;
    }
    setIsExporting(true);
    setExportType("word");
    const loadingToast = toast.loading("Generating Word transcript...");
    try {
      const filename =
        (typeof customFilename === "string" ? customFilename : undefined) ||
        `${transcriptData.studentCode}_transcript_${new Date().toISOString().split("T")[0]}.docx`;
      const res = await fetch("/api/export/transcript/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: transcriptData, extra: {}, filename }),
      });
      if (!res.ok) throw new Error("Server error");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success("Word transcript exported successfully!");
    } catch (error) {
      console.error("Word export error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to export Word transcript");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const exportTranscriptAsPDF = async (customFilename?: string) => {
    if (!transcriptData) {
      toast.error("No academic data available for export");
      return;
    }
    setIsExporting(true);
    setExportType("pdf");
    try {
      const loadingToast = toast.loading("Generating PDF transcript...");
      const filename =
        (typeof customFilename === "string" ? customFilename : undefined) ||
        `${transcriptData.studentCode}_transcript_${new Date().toISOString().split("T")[0]}.pdf`;
      const { exportTranscriptToPDF } = await import("@/utils/pdf/transcript-pdf-exporter");
      await exportTranscriptToPDF(transcriptData, {}, filename);
      toast.dismiss(loadingToast);
      toast.success("PDF transcript exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF transcript");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return {
    exportTranscriptAsWord,
    exportTranscriptAsPDF,
    isExporting,
    exportType,
    canExport: !!transcriptData,
  };
};
