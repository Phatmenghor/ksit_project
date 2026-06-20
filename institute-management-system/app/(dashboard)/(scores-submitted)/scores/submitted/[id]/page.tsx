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
  Loader2,
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
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
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
    <div className="flex items-start gap-2.5 rounded-lg bg-muted/40 border border-border/50 px-3 py-2.5">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-3" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-3" />
          <Skeleton className="h-3.5 w-14" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-muted/40 border border-border/50 px-3 py-2.5 space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
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

  const {
    handleExportToPDF,
    handleExportToExcelWithSchedule,
    isExporting,
    exportType,
  } = useExportScoreHandlers(submission, scheduleDetail);

  const status = submission?.status as SubmissionEnum | undefined;
  const isSubmitted = status === SubmissionEnum.SUBMITTED;
  const isApproved = status === SubmissionEnum.APPROVED;
  const isRejected = status === SubmissionEnum.REJECTED;
  const statusCfg = status ? STATUS_CONFIG[status] ?? null : null;
  const totalStudents = submission?.studentScores?.length ?? 0;
  const isActioning = operations.isSubmitting;

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
    if (!submission?.scheduleId) return;
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

      {/* ── Header card ── */}
      {isLoadingSubmission ? (
        <HeaderSkeleton />
      ) : (
        <Card className="border border-border/60 shadow-sm overflow-hidden">
          {/* Teal top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-teal-900 via-teal-700 to-teal-500" />

          <CardContent className="p-6 space-y-5">
            {/* Breadcrumb */}
            <PageBreadcrumb
              items={[
                { label: "Score Submitted", href: ROUTE.SCORES.SUBMITTED },
                { label: submission?.courseName || "Detail" },
              ]}
            />

            {/* Title row */}
            <div className="flex items-start gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full shrink-0 mt-0.5"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground leading-tight">
                    {submission?.courseName || "Score Submission Detail"}
                  </h1>
                  {statusCfg && (
                    <Badge variant="outline" className={cn("text-xs font-semibold shrink-0", statusCfg.className)}>
                      {statusCfg.label}
                    </Badge>
                  )}
                </div>
                {submission?.classCode && (
                  <p className="mt-0.5 text-sm text-muted-foreground">Class: {submission.classCode}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Meta grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-3.5 w-1 rounded-full bg-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Schedule Info</span>
                </div>
                {isLoadingSchedule ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="text-sm font-bold text-foreground">
                        {scheduleDetail?.course?.code}
                      </span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-sm text-foreground">
                        {scheduleDetail?.course?.nameEn || scheduleDetail?.course?.nameKH}
                      </span>
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                        {scheduleDetail?.day}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {formatTime12h(scheduleDetail?.startTime)} – {formatTime12h(scheduleDetail?.endTime)}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {[scheduleDetail?.teacher?.khmerFirstName, scheduleDetail?.teacher?.khmerLastName].filter(Boolean).join(" ") ||
                          [scheduleDetail?.teacher?.englishFirstName, scheduleDetail?.teacher?.englishLastName].filter(Boolean).join(" ") ||
                          "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {scheduleDetail?.room?.name || "—"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
                {isActioning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Return
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-green-700 hover:bg-green-800 text-white"
                disabled={isActioning}
                onClick={() => setApproveDialog(true)}
              >
                {isActioning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Student scores card ── */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title with teal accent */}
            <div className="flex items-center gap-3">
              <div className="flex h-full self-stretch w-1 rounded-full bg-teal-900 shrink-0" />
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Student Scores</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalStudents} student{totalStudents !== 1 ? "s" : ""} enrolled
                </p>
              </div>
            </div>

            {/* Export buttons */}
            {(isApproved || !isSubmitted) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground hidden sm:inline">Export:</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  disabled={isExporting}
                  onClick={() => handleExportToExcelWithSchedule({ includeComments: false, includeCreatedAt: true })}
                >
                  {isExporting && exportType === "excel" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <img src={AppIcons.Excel} alt="Excel" className="h-3.5 w-3.5" />
                  )}
                  Excel
                  {!(isExporting && exportType === "excel") && <Download className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  disabled={isExporting}
                  onClick={() => handleExportToPDF({ includeComments: false })}
                >
                  {isExporting && exportType === "pdf" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <img src={AppIcons.Pdf} alt="PDF" className="h-3.5 w-3.5" />
                  )}
                  PDF
                  {!(isExporting && exportType === "pdf") && <Download className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="px-6 pb-6 pt-4">
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
