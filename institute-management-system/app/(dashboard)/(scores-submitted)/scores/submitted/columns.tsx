import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { ROUTE } from "@/constants/routes";
import { formatSemester } from "@/utils/map-helper/schedule";
import { TableColumn } from "@/components/shared/data-table";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface SubmittedScoresColumnsProps {
  getDisplayIndex: (index: number) => number;
  router: AppRouterInstance;
}

export function createSubmittedScoresColumns({
  getDisplayIndex,
  router,
}: SubmittedScoresColumnsProps): TableColumn<SubmissionScoreModel>[] {
  return [
    { key: "no", label: "#", width: "50px", render: (_, index) => getDisplayIndex(index) },
    { key: "teacherName", label: "Teacher Name", render: (s) => s.teacherName },
    { key: "courseName", label: "Course Name", render: (s) => s.courseName },
    { key: "semester", label: "Semester", render: (s) => formatSemester(s.semester) },
    { key: "classCode", label: "Class", render: (s) => s.classCode },
    { key: "submissionDate", label: "Submission Date", render: (s) => DateTimeFormatter(s.submissionDate) },
    {
      key: "action",
      label: "Action",
      width: "80px",
      render: (s) => (
        <Button
          onClick={() => router.push(ROUTE.SCORES.SUBMITTED_DETAIL(String(s.id)))}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
