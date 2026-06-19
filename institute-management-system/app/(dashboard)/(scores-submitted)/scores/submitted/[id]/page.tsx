"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  Download,
  ArrowLeft,
  RotateCcw,
  User,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Users,
  FileText,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubmissionEnum } from "@/constants/constant";
import { ScoreSubmitConfirmDialog } from "@/components/dashboard/student-scores/layout/submit-confirm-dialog";
import { ReturnDialog } from "@/components/dashboard/scores-submitted/return-dialog";
import { SubmitScoreModel } from "@/model/score/student-score/student-score.request";
import { formatDate } from "date-fns";
import { ROUTE } from "@/constants/routes";
import { useExportScoreHandlers } from "@/components/shared/export/score-export-handler";
import { AppIcons } from "@/constants/icons/icon";
import { DataTable } from "@/components/shared/data-table";
import { createSubmittedScoreDetailColumns } from "./columns";
import { formatSemester, formatTime12h } from "@/utils/map-helper/schedule";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSubmittedScoreConfiguration,
  selectSelectedSubmission,
  selectSubmittedScoreIsLoading,
  selectSubmittedScoreOperations,
} from "@/features/scores/store/selectors/score-selectors";
import {
  getConfigurationScoreThunk,
  getSubmissionScoreByIdThunk,
  submittedScoreThunk,
} from "@/features/scores/store/thunks/submitted-score-thunks";
import { fetchScheduleByIdService } from "@/features/schedules/store/thunks/schedule-thunks";
import {
  selectSelectedSchedule,
  selectScheduleIsLoading,
} from "@/features/schedules/store/selectors/schedule-selectors";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  [SubmissionEnum.SUBMITTED]: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [SubmissionEnum.APPROVED]: {
    label: "Approved",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  [SubmissionEnum.REJECTED]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  [SubmissionEnum.DRAFT]: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  [SubmissionEnum.PENDING]: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground truncate">{value || "---"}</span>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-6 w-20 rounded-full ml-2" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ScoreSubmissionDetailPage() {
  const dispatch = useAppDispatch();
  const submission = useAppSelector(selectSelectedSubmission);
  const scheduleDetail = useAppSelector(selectSelectedSchedule);
  const scoreData = useAppSelector(selectSubmittedScoreConfiguration);
  const isLoadingSubmission = useAppSelector(selectSubmittedScoreIsLoading);
  const isLoadingSchedule = useAppSelector(selectScheduleIsLoading);
  const operations = useAppSelector(selectSubmittedScoreOperations);

  const [approveDialog, setApproveDialog] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { handleExportToPDF, handleExportToExcelWithSchedule } =
    useExportScoreHandlers(submission, scheduleDetail);

  const status = submission?.status as SubmissionEnum | undefined;
  const isSubmitted = status === SubmissionEnum.SUBMITTED;
  const isApproved = status === SubmissionEnum.APPROVED;
  const isRejected = status === SubmissionEnum.REJECTED;
  const statusCfg = status ? STATUS_CONFIG[status] ?? null : null;
  const totalStudents = submission?.studentScores?.length ?? 0;
  const isHeaderLoading = isLoadingSubmission;

  // ── Data loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        await dispatch(getConfigurationScoreThunk()).unwrap();
      } catch {
        toast.error("Failed to load score configuration.");
      } finally {
        setIsLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [dispatch]);

  const loadSubmission = useCallback(async () => {
    try {
      await dispatch(getSubmissionScoreByIdThunk(Number(id))).unwrap();
    } catch {
      toast.error("Failed to load submission.");
    }
  }, [id, dispatch]);

  const loadSchedule = useCallback(async () => {
    if (!submission?.scheduleId) {
      return;
    }
    try {
      await dispatch(fetchScheduleByIdService(submission.scheduleId)).unwrap();
    } catch {
      // Ignore
    }
  }, [submission?.scheduleId, dispatch]);

  useEffect(() => { loadSubmission(); }, [loadSubmission]);
  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleApproval = async () => {
    try {
      const payload: SubmitScoreModel = { id: submission?.id ?? 0, status: SubmissionEnum.APPROVED };
      const response = await dispatch(submittedScoreThunk(payload)).unwrap();
      if (response) {
        setApproveDialog(false);
        toast.success("Score approved successfully.", { icon: <CheckCircle className="h-4 w-4" /> });
        router.push(ROUTE.SCORES.SUBMITTED);
      } else {
        toast.error("Failed to approve score.");
      }
    } catch {
      toast.error("Failed to approve score.");
    }
  };

  const handleReturn = async () => {
    try {
      const response = await dispatch(submittedScoreThunk({ id: submission?.id ?? 0, status: SubmissionEnum.DRAFT })).unwrap();
      if (response) {
        setReturnDialog(false);
        toast.success("Score returned to teacher.", { icon: <CheckCircle className="h-4 w-4" /> });
        router.push(ROUTE.SCORES.SUBMITTED);
      } else {
        toast.error("Failed to return score.");
      }
    } catch {
      toast.error("Failed to return score.");
    }
  };

  // ── Table ───────────────────────────────────────────────────────────────────

  const columns = createSubmittedScoreDetailColumns({ scoreData });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      {isHeaderLoading ? (
        <HeaderSkeleton />
      ) : (
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-6 space-y-4">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <span>/</span>
              <Link href={ROUTE.SCORES.SUBMITTED} className="hover:text-foreground transition-colors">Score Submitted</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Detail</span>
            </nav>

            {/* Title row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full shrink-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">
                {submission?.courseName || "Score Submission Detail"}
              </h1>
              {statusCfg && (
                <Badge variant="outline" className={cn("text-xs font-semibold", statusCfg.className)}>
                  {statusCfg.label}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Submission meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetaItem icon={User} label="Teacher" value={submission?.teacherName} />
              <MetaItem icon={GraduationCap} label="Class" value={submission?.classCode} />
              <MetaItem icon={BookOpen} label="Semester" value={formatSemester(submission?.semester)} />
              <MetaItem
                icon={Calendar}
                label="Submitted"
                value={submission?.submissionDate ? formatDate(new Date(submission.submissionDate), "PP") : null}
              />
            </div>

            {/* Schedule detail panel */}
            {(scheduleDetail || isLoadingSchedule) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                {isLoadingSchedule ? (
                  <div className="flex gap-6">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-sm font-semibold text-amber-700">
                        {scheduleDetail?.course?.code}
                      </span>
                      <span className="text-sm text-amber-800">
                        {scheduleDetail?.course?.nameEn || scheduleDetail?.course?.nameKH}
                      </span>
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-white">
                        {scheduleDetail?.day}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      <span className="flex items-center gap-1.5 text-sm text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime12h(scheduleDetail?.startTime)} – {formatTime12h(scheduleDetail?.endTime)}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-amber-700">
                        <Users className="h-3.5 w-3.5" />
                        {[scheduleDetail?.teacher?.khmerFirstName, scheduleDetail?.teacher?.khmerLastName].filter(Boolean).join(" ") ||
                          [scheduleDetail?.teacher?.englishFirstName, scheduleDetail?.teacher?.englishLastName].filter(Boolean).join(" ") ||
                          "---"}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-amber-700">
                        <MapPin className="h-3.5 w-3.5" />
                        {scheduleDetail?.room?.name || "---"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* ── Status banner ── */}
      {isApproved && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>This submission has been <strong>approved</strong> and scores have been recorded in the system.</span>
        </div>
      )}
      {isRejected && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>This submission has been <strong>rejected</strong>. Please contact the administrator for more information.</span>
        </div>
      )}

      {/* ── Approval actions ── */}
      {isSubmitted && (
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Pending Approval</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review the student scores below and approve or return this submission.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                disabled={isActioning}
                onClick={() => setReturnDialog(true)}
              >
                <RotateCcw className="h-4 w-4" />
                Return
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-green-700 hover:bg-green-800 text-white"
                disabled={isActioning}
                onClick={() => setApproveDialog(true)}
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Student scores ── */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold">Student Scores</CardTitle>
            </div>

            {/* Export buttons */}
            {(isApproved || !isSubmitted) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Export:</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => handleExportToExcelWithSchedule({ includeComments: false, includeCreatedAt: true })}
                >
                  <img src={AppIcons.Excel} alt="Excel" className="h-3.5 w-3.5" />
                  Excel
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => handleExportToPDF({ includeComments: false })}
                >
                  <img src={AppIcons.Pdf} alt="PDF" className="h-3.5 w-3.5" />
                  PDF
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 text-sm">
          <span className="text-muted-foreground">
            Total students: <strong className="text-foreground">{totalStudents}</strong>
          </span>
          {submission?.submissionDate && (
            <>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">
                Submitted:{" "}
                <strong className="text-foreground">
                  {formatDate(new Date(submission.submissionDate), "PP")}
                </strong>
              </span>
            </>
          )}
        </div>

        <CardContent className="px-6 pb-6 pt-0">
          <DataTable
            data={submission?.studentScores ?? null}
            columns={columns}
            loading={isLoadingSubmission || isLoadingConfig}
            currentPage={1}
            totalPages={0}
            onPageChange={() => {}}
            showPagination={false}
            emptyMessage="No student scores found."
            getRowKey={(s) => s.id}
          />
        </CardContent>
      </Card>

      {/* ── Dialogs ── */}
      <ScoreSubmitConfirmDialog
        open={approveDialog}
        title="Confirm Approval"
        description="Are you sure you want to approve these student scores? This action will record the scores in the system."
        onConfirm={handleApproval}
        cancelText="Cancel"
        confirmText="Approve"
        isLoading={operations.isSubmitting}
        onOpenChange={(v) => { if (!operations.isSubmitting) setApproveDialog(v); }}
      />

      <ReturnDialog
        open={returnDialog}
        title="Return Submission"
        description="Are you sure you want to return this submission to the teacher for revision?"
        onConfirm={handleReturn}
        confirmText="Return"
        cancelText="Cancel"
        isLoading={operations.isSubmitting}
        onOpenChange={(v) => { if (!operations.isSubmitting) setReturnDialog(v); }}
      />
    </div>
  );
}
