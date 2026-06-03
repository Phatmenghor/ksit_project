"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        console.log("response data: ", response);
        setScoreData(response);
      } catch (error) {
        console.error("Failed to fetch score settings:", error);
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
      console.log("##Submission detail: ", response);

      if (response) {
        setSubmissions(response);
      } else {
        console.error("Failed to fetch student:");
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
      console.error("Error fetching schedule data:", error);
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
      console.error("Error return score:", error);
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
      console.error("Error approving score:", error);
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-black hover:bg-black">
                  <TableHead className="text-white w-12">#</TableHead>
                  <TableHead className="text-white">
                    Student IdentifyNumber
                  </TableHead>
                  <TableHead className="text-white">Fullname (KH)</TableHead>
                  <TableHead className="text-white">Fullname (EN)</TableHead>
                  <TableHead className="text-white">Gender</TableHead>
                  <TableHead className="text-white">Birth Date</TableHead>
                  <TableHead className="text-white text-center">
                    Att. ({scoreData?.attendancePercentage}%)
                  </TableHead>
                  <TableHead className="text-white text-center">
                    Ass. ({scoreData?.assignmentPercentage}%)
                  </TableHead>
                  <TableHead className="text-white text-center">
                    Mid. ({scoreData?.midtermPercentage}%)
                  </TableHead>
                  <TableHead className="text-white text-center">
                    Final ({scoreData?.finalPercentage}%)
                  </TableHead>
                  <TableHead className="text-white text-center">
                    Total
                  </TableHead>
                  <TableHead className="text-white text-center">
                    Grade
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission?.studentScores?.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {student?.studentIdentityNumber || "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.studentNameKhmer?.trim() || "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.studentNameEnglish?.trim() || "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.gender ?? "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.dateOfBirth ?? "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.attendanceScore ?? "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.assignmentScore ?? "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.midtermScore ?? "---"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student?.finalScore ?? "---"}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {student?.totalScore ?? "---"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-bold px-2 py-1 rounded text-sm ${getGradeStyles(
                          student.grade
                        )}`}
                      >
                        {student.grade ?? "---"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
