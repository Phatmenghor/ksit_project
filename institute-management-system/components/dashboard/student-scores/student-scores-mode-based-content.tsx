import { useExportScoreHandlers } from "@/components/shared/export/score-export-handler";
import { Button } from "@/components/ui/button";
import { AppIcons } from "@/constants/icons/icon";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { Download, Edit, Eye } from "lucide-react";

interface ModeBasedContentProps {
  mode: "view" | "edit-score";
  score: SubmissionScoreModel | null;
  scheduleDetail: ScheduleModel | null;
  setMode: (mode: "view" | "edit-score") => void;
  isSubmittingToStaff: boolean;
  setIsSubmittedDialogOpen: (open: boolean) => void;
}

export default function RenderModeBasedContent({
  mode,
  setMode,
  score,
  isSubmittingToStaff,
  scheduleDetail,
  setIsSubmittedDialogOpen,
}: ModeBasedContentProps) {
  const { handleExportToExcel, handleExportToPDF } = useExportScoreHandlers(
    score,
    scheduleDetail
  );

  if (isSubmittingToStaff) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm font-medium">Export:</span>
        <Button
          onClick={() =>
            handleExportToExcel({ includeComments: false, customFileName: "Student Score" })
          }
          variant="outline"
          className="gap-2"
        >
          <img src={AppIcons.Excel} alt="Excel" className="h-4 w-4" />
          <span>Excel</span>
          <Download className="w-4 h-4" />
        </Button>
        <Button
          onClick={() =>
            handleExportToPDF({ customFileName: "Student Score", includeComments: false })
          }
          variant="outline"
          className="gap-2"
        >
          <img src={AppIcons.Pdf} alt="PDF" className="h-4 w-4" />
          <span>PDF</span>
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {mode === "view" ? (
        <Button variant="outline" onClick={() => setMode("edit-score")} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Score
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setMode("view")} className="gap-2">
          <Eye className="h-4 w-4" />
          View
        </Button>
      )}
      <Button onClick={() => setIsSubmittedDialogOpen(true)} className="gap-2">
        <img
          src={AppIcons.score_submit}
          alt="Submit"
          className="h-4 w-4"
        />
        Submit Score
      </Button>
    </div>
  );
}
