"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileIcon as FilePdf,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  Download,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import StudentScoreHeader from "@/components/dashboard/student-scores/layout/header-section";
import {
  getConfigurationScoreService,
  getSubmissionScoreByIdService,
  submittedScoreService,
} from "@/service/score/score.service";
import { toast } from "sonner";
import { SubmissionEnum } from "@/constants/constant";
import { ScoreSubmitConfirmDialog } from "@/components/dashboard/student-scores/layout/submit-confirm-dialog";
import { ReturnDialog } from "@/components/dashboard/scores-submitted/return-dialog";
import { SubmitScoreModel } from "@/model/score/student-score/student-score.request";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "date-fns";
import { ROUTE } from "@/constants/routes";
import { useExportScoreHandlers } from "@/components/shared/export/score-export-handler";
import { getDetailScheduleService } from "@/service/schedule/schedule.service";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { AppIcons } from "@/constants/icons/icon";
import { ScoreConfigurationModel } from "@/model/score/submitted-score/submitted-score.response.model";
import { DataTable, TableColumn } from "@/components/shared/data-table";

export default function ScoreSubmissionDetailPage() {
  const [submission, setSubmissions] = useState<SubmissionScoreModel | null>(
    null
  );
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleModel | null>(
    null
  );
  const [scoreData, setScoreData] = useState<ScoreConfigurationModel | null>(
    null
  );
  const [approveDialog, setApproveDialog] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScoreApproval, setIsScoreApproval] = useState(false);

  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { handleExportToPDF, handleExportToExcelWithSchedule } =
    useExportScoreHandlers(submission, scheduleDetail);

  // Computed values for better readability
  const isSubmitted = submission?.status === SubmissionEnum.SUBMITTED;
  const isApproved = submission?.status === SubmissionEnum.APPROVED;
  const isRejected = submission?.status === SubmissionEnum.REJECTED;
  const canShowApprovalActions = !isScoreApproval && isSubmitted;
  const canShowExportActions = isScoreApproval || !isSubmitted;
  const totalStudents = submission?.studentScores?.length || 0;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await getConfigurationScoreService();
        setScoreData(response);
      } catch (error) {
        toast.error("Failed to fetch score settings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const loadStudentSubmittedScore = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSubmissionScoreByIdService(Number(id));

      if (response) {
        setSubmissions(response);
      } else {
      }
    } catch (error) {
      toast.error("An error occurred while loading student");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadSchedule = useCallback(async () => {
    if (!submission?.scheduleId) {
      setScheduleDetail(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getDetailScheduleService(submission.scheduleId);
      setScheduleDetail(response);
    } catch (error) {
      toast.error("An error occurred while loading schedule");
      setScheduleDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [submission?.scheduleId]);

  useEffect(() => {
    loadStudentSubmittedScore();
  }, [loadStudentSubmittedScore]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleReturn = async () => {
    try {
      const response = await submittedScoreService({
        id: submission?.id ?? 0,
        status: SubmissionEnum.DRAFT,
      });

      if (response) {
        setIsScoreApproval(true);
        setReturnDialog(false);
        toast.success("Score successfully return!", {
          duration: 3000,
          icon: <CheckCircle className="h-4 w-4" />,
        });
        router.push(ROUTE.SCORES.SUBMITTED);
      } else {
        toast.error("Failed to return score");
      }
    } catch (error) {
      toast.error("Failed to return score");
    }
  };

  const handleApproval = async () => {
    try {
      const payload: SubmitScoreModel = {
        id: submission?.id ?? 0,
        status: SubmissionEnum.APPROVED,
      };

      const response = await submittedScoreService(payload);

      if (response) {
        setIsScoreApproval(true);
        setApproveDialog(false);
        toast.success("Score successfully approved to staff officer!", {
          duration: 3000,
          icon: <CheckCircle className="h-4 w-4" />,
        });
        router.push(ROUTE.SCORES.SUBMITTED);
      } else {
        toast.error("Failed to approve score");
      }
    } catch (error) {
      toast.error("Failed to approve score to staff");
    }
  };

  const getGradeStyles = (grade: string) => {
    const gradeStyleMap = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
    };
    return (
      gradeStyleMap[grade as keyof typeof gradeStyleMap] ||
      "bg-red-100 text-red-800"
    );
  };

  // Status Alert Components
  const ApprovedAlert = () => (
    <div className="flex justify-center bg-green-50 p-4 rounded-md mt-6">
      <div className="flex items-center gap-2 text-green-700">
        <Check className="h-5 w-5" />
        <span>
          This submission has been approved and the scores have been recorded in
          the system.
        </span>
      </div>
    </div>
  );

  const RejectedAlert = () => (
    <div className="flex justify-center bg-red-50 p-4 rounded-md mt-6">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        <span>
          This submission has been rejected. Please contact the administrator
          for more information.
        </span>
      </div>
    </div>
  );

  // Approval Actions Component
  const ApprovalActionsCard = () => (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-bold">Submitting Approval</CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => setReturnDialog(true)} variant="outline">
            Return
          </Button>
          <Button onClick={() => setApproveDialog(true)}>Approve</Button>
        </div>
      </CardHeader>
    </Card>
  );

  // Export Actions Component
  const ExportActions = () => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6">
      <span className="text-muted-foreground font-medium text-sm sm:text-base lg:text-sm">
        Export Data By Class:
      </span>
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-2">
        <Button
          size="sm"
          onClick={() =>
            handleExportToExcelWithSchedule({
              includeComments: false,
              includeCreatedAt: true,
            })
          }
          variant="outline"
          className="gap-2 text-sm sm:text-base lg:text-lg px-3 sm:px-4 lg:px-6 py-2 lg:py-3"
        >
          <img
            src={AppIcons.Excel}
            alt="excel Icon"
            className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
          />
          <span className="text-base">Excel</span>
          <Download className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
        </Button>
        <Button
          onClick={() =>
            handleExportToPDF({
              includeComments: false,
            })
          }
          size="sm"
          variant="outline"
          className="gap-2 text-sm sm:text-base lg:text-lg px-3 sm:px-4 lg:px-6 py-2 lg:py-3"
        >
          <img
            src={AppIcons.Pdf}
            alt="pdf Icon"
            className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
          />
          <span className="text-base">PDF</span>
          <Download className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
        </Button>
      </div>
    </div>
  );

  type StudentScore = NonNullable<SubmissionScoreModel["studentScores"]>[number];

  const columns: TableColumn<StudentScore>[] = [
    { key: "no", label: "#", width: "50px", render: (_, i) => i + 1 },
    {
      key: "studentIdentityNumber",
      label: "Student IdentifyNumber",
      render: (item) => item.studentIdentityNumber || "---",
    },
    {
      key: "studentNameKhmer",
      label: "Fullname (KH)",
      render: (item) => item.studentNameKhmer?.trim() || "---",
    },
    {
      key: "studentNameEnglish",
      label: "Fullname (EN)",
      render: (item) => item.studentNameEnglish?.trim() || "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (item) => item.gender ?? "---",
    },
    {
      key: "dateOfBirth",
      label: "Birth Date",
      render: (item) => item.dateOfBirth ?? "---",
    },
    {
      key: "attendanceScore",
      label: `Att. (${scoreData?.attendancePercentage}%)`,
      render: (item) => item.attendanceScore ?? "---",
    },
    {
      key: "assignmentScore",
      label: `Ass. (${scoreData?.assignmentPercentage}%)`,
      render: (item) => item.assignmentScore ?? "---",
    },
    {
      key: "midtermScore",
      label: `Mid. (${scoreData?.midtermPercentage}%)`,
      render: (item) => item.midtermScore ?? "---",
    },
    {
      key: "finalScore",
      label: `Final (${scoreData?.finalPercentage}%)`,
      render: (item) => item.finalScore ?? "---",
    },
    {
      key: "totalScore",
      label: "Total",
      render: (item) => (
        <span className="text-center font-bold block">
          {item.totalScore ?? "---"}
        </span>
      ),
    },
    {
      key: "grade",
      label: "Grade",
      render: (item) => (
        <span
          className={`font-bold px-2 py-1 rounded text-sm ${getGradeStyles(item.grade)}`}
        >
          {item.grade ?? "---"}
        </span>
      ),
    },
  ];

  return (
    <div className="container space-y-4">
      <StudentScoreHeader
        schedule={scheduleDetail}
        title="Score Submitted Detail"
      />

      {canShowApprovalActions && <ApprovalActionsCard />}

      <Card>
        <CardHeader className="flex flex-col lg:flex-row sm:items-center sm:justify-between w-full gap-4">
          <div>
            <CardTitle className="font-bold text-xl">Student List</CardTitle>
          </div>
          {canShowExportActions && <ExportActions />}
        </CardHeader>

        <div className="w-full px-4">
          <Separator className="bg-gray-300" />
        </div>

        <CardContent className="p-4">
          <div className="flex flex-row gap-2">
            <p className="mb-4">
              <span className="text-gray-500">Total Students: </span>
              <span className="font-semibold">{totalStudents}</span>
            </p>
            <span className="text-gray-500">|</span>
            <p className="mb-4">
              <span className="text-gray-500">Submit Date:</span>{" "}
              <span className="font-semibold">
                {submission?.submissionDate
                  ? formatDate(new Date(submission.submissionDate), "PP")
                  : "N/A"}
              </span>
            </p>
          </div>

          <DataTable
            data={submission?.studentScores ?? null}
            columns={columns}
            loading={isLoading}
            currentPage={1}
            totalPages={0}
            onPageChange={() => {}}
            showPagination={false}
            emptyMessage="No student scores found"
            getRowKey={(item) => item.id}
          />
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {isApproved && <ApprovedAlert />}
      {isRejected && <RejectedAlert />}

      {/* Dialogs */}
      <ScoreSubmitConfirmDialog
        open={approveDialog}
        title="Confirm Approve!"
        description="Are u sure u want to approve the students score?"
        onConfirm={handleApproval}
        cancelText="Discard"
        confirmText="Approve"
        onOpenChange={() => setApproveDialog(false)}
      />

      <ReturnDialog
        open={returnDialog}
        title="Confirm Return!"
        description="Are u sure u want to return the students score?"
        onConfirm={handleReturn}
        confirmText="Return"
        cancelText="Discard"
        onOpenChange={() => setReturnDialog(false)}
      />
    </div>
  );
}
