import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TableColumn } from "@/components/shared/data-table";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { ScoreConfigurationModel } from "@/model/score/submitted-score/submitted-score.response.model";

type StudentScore = NonNullable<SubmissionScoreModel["studentScores"]>[number];

export const GRADE_CONFIG: Record<string, string> = {
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-blue-100 text-blue-800 border-blue-200",
  C: "bg-yellow-100 text-yellow-800 border-yellow-200",
  D: "bg-orange-100 text-orange-800 border-orange-200",
};

export interface SubmittedScoreDetailColumnsProps {
  scoreData: ScoreConfigurationModel | null;
}

export function createSubmittedScoreDetailColumns({
  scoreData,
}: SubmittedScoreDetailColumnsProps): TableColumn<StudentScore>[] {
  return [
    { key: "no", label: "#", width: "50px", render: (_, i) => i + 1 },
    {
      key: "studentIdentityNumber",
      label: "ID",
      render: (s) => (
        <span className="font-mono text-xs text-muted-foreground">
          {s.studentIdentityNumber || "---"}
        </span>
      ),
    },
    {
      key: "studentNameKhmer",
      label: "Name (KH)",
      render: (s) => <span className="font-medium">{s.studentNameKhmer || "---"}</span>,
    },
    { key: "studentNameEnglish", label: "Name (EN)", render: (s) => s.studentNameEnglish || "---" },
    { key: "gender", label: "Gender", render: (s) => s.gender ?? "---" },
    { key: "dateOfBirth", label: "DOB", render: (s) => s.dateOfBirth ?? "---" },
    {
      key: "attendanceScore",
      label: `Att. (${scoreData?.attendancePercentage ?? "?"}%)`,
      render: (s) => <span className="tabular-nums">{s.attendanceScore ?? "---"}</span>,
    },
    {
      key: "assignmentScore",
      label: `Ass. (${scoreData?.assignmentPercentage ?? "?"}%)`,
      render: (s) => <span className="tabular-nums">{s.assignmentScore ?? "---"}</span>,
    },
    {
      key: "midtermScore",
      label: `Mid. (${scoreData?.midtermPercentage ?? "?"}%)`,
      render: (s) => <span className="tabular-nums">{s.midtermScore ?? "---"}</span>,
    },
    {
      key: "finalScore",
      label: `Final (${scoreData?.finalPercentage ?? "?"}%)`,
      render: (s) => <span className="tabular-nums">{s.finalScore ?? "---"}</span>,
    },
    {
      key: "totalScore",
      label: "Total",
      render: (s) => <span className="font-bold tabular-nums">{s.totalScore ?? "---"}</span>,
    },
    {
      key: "grade",
      label: "Grade",
      render: (s) => (
        <Badge
          variant="outline"
          className={cn(
            "font-bold text-xs",
            GRADE_CONFIG[s.grade] ?? "bg-red-100 text-red-800 border-red-200"
          )}
        >
          {s.grade ?? "---"}
        </Badge>
      ),
    },
  ];
}
