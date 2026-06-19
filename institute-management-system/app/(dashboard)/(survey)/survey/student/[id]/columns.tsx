import { TableColumn } from "@/components/shared/data-table";
import { StudentSurveyModel } from "@/model/survey/student-survey-model";

type Student = NonNullable<StudentSurveyModel["students"]>[number];

function getStatusConfig(status: string) {
  switch (status) {
    case "COMPLETED":
      return {
        text: "Completed",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      };
    case "NOT_STARTED":
      return {
        text: "Not Started",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      };
    case "NONE":
    default:
      return {
        text: "Pending",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
      };
  }
}

export const surveyStudentColumns: TableColumn<Student>[] = [
  { key: "no", label: "#", render: (_, i) => i + 1 },
  { key: "username", label: "Username", render: (item) => item.username || "---" },
  {
    key: "khmerName",
    label: "Fullname (KH)",
    render: (item) =>
      `${item.khmerFirstName || ""} ${item.khmerLastName || ""}`.trim() || "---",
  },
  {
    key: "englishName",
    label: "Fullname (EN)",
    render: (item) =>
      `${item.englishFirstName || ""} ${item.englishLastName || ""}`.trim() || "---",
  },
  { key: "gender", label: "Gender", render: (item) => item.gender || "---" },
  { key: "dateOfBirth", label: "Date Of Birth", render: (item) => item.dateOfBirth || "---" },
  { key: "classCode", label: "Class code", render: (item) => item.studentClass?.code || "---" },
  {
    key: "surveyStatus",
    label: "Status",
    render: (item) => {
      const config = getStatusConfig(item.surveyStatus);
      return (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
        >
          {config.text}
        </span>
      );
    },
  },
];
