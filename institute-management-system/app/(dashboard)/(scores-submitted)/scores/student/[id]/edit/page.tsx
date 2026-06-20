"use client";

import StudentScoreHeader from "@/components/dashboard/student-scores/layout/header-section";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, Users, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import {
  StudentScoreModel,
} from "@/model/score/student-score/student-score.response";
import { ScoreSubmittedModel } from "@/model/score/submitted-score/submitted-score.response.model";
import { toast } from "sonner";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { ScoreSubmitConfirmDialog } from "@/components/dashboard/student-scores/layout/submit-confirm-dialog";
import { SubmissionEnum } from "@/constants/constant";
import { formatDate } from "date-fns";
import StudentScoresTable from "@/components/dashboard/student-scores/student-scores-table";
import { EmptyState } from "@/components/shared/empty-state";
import StudentScoresQuickAction from "@/components/dashboard/student-scores/student-scores-quick-action";
import StudentScoreAlert from "@/components/dashboard/student-scores/student-scores-alert";
import RenderModeBasedContent from "@/components/dashboard/student-scores/student-scores-mode-based-content";
import Loading from "@/components/shared/loading";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSubmittedScoreConfiguration,
} from "@/features/scores/store/selectors/score-selectors";
import {
  getConfigurationScoreThunk,
  intiStudentsScoreThunk,
  updateStudentsScoreThunk,
  submittedScoreThunk,
} from "@/features/scores/store/thunks/submitted-score-thunks";
import { fetchScheduleByIdService } from "@/features/schedules/store/thunks/schedule-thunks";
import { selectSelectedSchedule } from "@/features/schedules/store/selectors/schedule-selectors";

// ─── Types ───────────────────────────────────────────────────────────────────

type OriginalSnapshot = {
  attendanceScore: number;
  assignmentScore: number;
  midtermScore: number;
  finalScore: number;
  grade: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toNum = (v: unknown): number => {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
};

const isEditingAllowed = (status: string) => status === SubmissionEnum.DRAFT;

const getModeFromStatus = (status: string): "view" | "edit-score" =>
  isEditingAllowed(status) ? "edit-score" : "view";

const buildSnapshot = (s: StudentScoreModel): OriginalSnapshot => ({
  attendanceScore: toNum(s.attendanceScore),
  assignmentScore: toNum(s.assignmentScore),
  midtermScore: toNum(s.midtermScore),
  finalScore: toNum(s.finalScore),
  grade: s.grade,
});

const isDirtyRow = (row: StudentScoreModel, original: OriginalSnapshot): boolean =>
  toNum(row.attendanceScore) !== original.attendanceScore ||
  toNum(row.assignmentScore) !== original.assignmentScore ||
  toNum(row.midtermScore) !== original.midtermScore ||
  toNum(row.finalScore) !== original.finalScore;

// ─── Local grade calculator (mirrors backend GradeLevel enum exactly) ─────────

const calcLocalGrade = (total: number): string => {
  if (total === 0)           return "I";
  if (total >= 85)           return "A";
  if (total >= 80)           return "B+";
  if (total >= 70)           return "B";
  if (total >= 65)           return "C+";
  if (total >= 50)           return "C";
  if (total >= 45)           return "D";
  if (total >= 40)           return "E";
  return "F";
};

// ─── Score config summary card ────────────────────────────────────────────────

function ScoreConfigBadges({ config }: { config: any | null }) {
  if (!config) return null;
  const items = [
    { label: "Attendance", value: config.attendancePercentage },
    { label: "Assignment", value: config.assignmentPercentage },
    { label: "Midterm", value: config.midtermPercentage },
    { label: "Final", value: config.finalPercentage },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/20 text-xs"
        >
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-bold text-primary">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentScoreDetailsPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;

  const dispatch = useAppDispatch();
  const scheduleDetail = useAppSelector(selectSelectedSchedule);
  const configureScore = useAppSelector(selectSubmittedScoreConfiguration);

  const [score, setScore] = useState<ScoreSubmittedModel | null>(null);
  const [originalData, setOriginalData] = useState<Map<number, OriginalSnapshot>>(new Map());

  const [mode, setMode] = useState<"view" | "edit-score">("view");
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmittingToStaff, setIsSubmittingToStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isSubmittedDialogOpen, setIsSubmittedDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<number>>(new Set());

  const initCalledRef = useRef(false);

  // ─── Apply session ────────────────────────────────────────────────────────

  const applySession = useCallback((response: ScoreSubmittedModel) => {
    setScore(response);
    setIsInitialized(true);
    setMode(getModeFromStatus(response.status));
    const notEditable = !isEditingAllowed(response.status);
    setIsSubmitted(notEditable);
    setIsSubmittingToStaff(notEditable);
    const map = new Map<number, OriginalSnapshot>();
    response.studentScores?.forEach((s) => map.set(s.id, buildSnapshot(s)));
    setOriginalData(map);
    setUnsavedChanges(new Set());
  }, []);

  // ─── Loaders ─────────────────────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    try {
      await dispatch(getConfigurationScoreThunk()).unwrap();
    } catch {
      toast.error("Failed to load score configuration");
    }
  }, [dispatch]);

  const loadSchedule = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      await dispatch(fetchScheduleByIdService(id)).unwrap();
    } catch {
      toast.error("Failed to load schedule details");
    } finally {
      setIsLoading(false);
    }
  }, [id, dispatch]);

  const initializeSession = useCallback(
    async (scheduleId: number, silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const res = await dispatch(intiStudentsScoreThunk({ scheduleId })).unwrap();
        applySession(res);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load student scores");
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [applySession, dispatch]
  );

  // ─── Effects ─────────────────────────────────────────────────────────────

  useEffect(() => {
    loadSchedule();
    loadConfig();
  }, [loadSchedule, loadConfig]);

  useEffect(() => {
    if (!scheduleDetail?.id || initCalledRef.current) return;
    initCalledRef.current = true;
    initializeSession(scheduleDetail.id);
  }, [scheduleDetail?.id, initializeSession]);

  useEffect(() => {
    if (!score?.status) return;
    setMode(getModeFromStatus(score.status));
    const notEditable = !isEditingAllowed(score.status);
    setIsSubmitted(notEditable);
    setIsSubmittingToStaff(notEditable);
  }, [score?.status]);

  // ─── Field change ─────────────────────────────────────────────────────────

  const handleFieldChange = useCallback(
    (scoreId: number, field: string, value: string) => {
      if (isSubmitted) return;
      const original = originalData.get(scoreId);

      setScore((prev) => {
        if (!prev) return prev;
        const studentScores = prev.studentScores.map((s) => {
          if (s.id !== scoreId) return s;
          const updated = { ...s, [field]: value };
          // Real-time local preview — backend recalculates officially on save
          const total =
            toNum(updated.attendanceScore) +
            toNum(updated.assignmentScore) +
            toNum(updated.midtermScore) +
            toNum(updated.finalScore);
          return {
            ...updated,
            totalScore: total,
            grade: calcLocalGrade(total),
          };
        });
        return { ...prev, studentScores };
      });

      setScore((prev) => {
        const row = prev?.studentScores.find((s) => s.id === scoreId);
        if (!row) return prev;
        const dirty = !original || isDirtyRow(row, original);
        setUnsavedChanges((prevSet) => {
          const next = new Set(prevSet);
          dirty ? next.add(scoreId) : next.delete(scoreId);
          return next;
        });
        return prev;
      });
    },
    [originalData, isSubmitted]
  );

  // ─── Save all ─────────────────────────────────────────────────────────────

  const handleSaveAllChanges = useCallback(async () => {
    if (unsavedChanges.size === 0 || isSubmitted || !score) return;
    setIsSavingAll(true);
    try {
      const changed = score.studentScores.filter((s) => unsavedChanges.has(s.id));
      const responses = await Promise.all(
        changed.map((item) =>
          dispatch(
            updateStudentsScoreThunk({
              id: item.id,
              attendanceScore: toNum(item.attendanceScore),
              assignmentScore: toNum(item.assignmentScore),
              midtermScore: toNum(item.midtermScore),
              finalScore: toNum(item.finalScore),
              comments: item.comments || "",
            })
          ).unwrap()
        )
      );

      setScore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          studentScores: prev.studentScores.map((s) => {
            const updated = responses.find((r) => r.id === s.id);
            return updated ? { ...s, ...updated } : s;
          }),
        };
      });

      const newOriginal = new Map(originalData);
      responses.forEach((r) => newOriginal.set(r.id, buildSnapshot(r)));
      setOriginalData(newOriginal);
      setUnsavedChanges(new Set());

      toast.success(
        `${responses.length} score${responses.length !== 1 ? "s" : ""} saved`,
        { duration: 2000, description: "Grades and totals recalculated" }
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to save scores");
    } finally {
      setIsSavingAll(false);
    }
  }, [score, unsavedChanges, originalData, isSubmitted, dispatch]);

  // ─── Reset ────────────────────────────────────────────────────────────────

  const handleResetChanges = useCallback(() => {
    if (isSubmitted) return;
    setScore((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        studentScores: prev.studentScores.map((s) => {
          const orig = originalData.get(s.id);
          if (!orig) return s;
          return {
            ...s,
            attendanceScore: orig.attendanceScore,
            assignmentScore: orig.assignmentScore,
            midtermScore: orig.midtermScore,
            finalScore: orig.finalScore,
            grade: orig.grade,
          };
        }),
      };
    });
    setUnsavedChanges(new Set());
    toast.info("Changes discarded");
  }, [originalData, isSubmitted]);

  // ─── Remove single row ────────────────────────────────────────────────────

  const handleRemoveFromUnsaved = useCallback(
    (scoreId: number) => {
      const orig = originalData.get(scoreId);
      if (orig) {
        setScore((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            studentScores: prev.studentScores.map((s) =>
              s.id === scoreId
                ? {
                    ...s,
                    attendanceScore: orig.attendanceScore,
                    assignmentScore: orig.assignmentScore,
                    midtermScore: orig.midtermScore,
                    finalScore: orig.finalScore,
                    grade: orig.grade,
                  }
                : s
            ),
          };
        });
      }
      setUnsavedChanges((prev) => {
        const next = new Set(prev);
        next.delete(scoreId);
        return next;
      });
    },
    [originalData]
  );

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!score) return;
    if (unsavedChanges.size > 0) {
      toast.error("Please save all changes before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(
        submittedScoreThunk({
          id: score.id ?? 0,
          status: SubmissionEnum.SUBMITTED,
        })
      ).unwrap();
      setScore((prev) => prev ? { ...prev, status: SubmissionEnum.SUBMITTED } : prev);
      setMode("view");
      setIsSubmitted(true);
      setIsSubmittingToStaff(true);
      toast.success("Scores submitted to staff officer!", {
        duration: 3000,
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit scores");
    } finally {
      setIsSubmitting(false);
    }
  }, [score, unsavedChanges.size, dispatch]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const showLoading = isLoading && !isInitialized;
  const totalStudents = score?.studentScores.length ?? 0;
  const hasUnsaved = unsavedChanges.size > 0;

  return (
    <div className="space-y-4">
      <StudentScoreHeader schedule={scheduleDetail} title="View Class Detail" />

      {showLoading ? (
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      ) : (
        <Card className="shadow-sm border border-border">
          {/* Card header */}
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Student Score List</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{totalStudents} students</span>
                  </span>
                  {isSubmittingToStaff && score?.submissionDate && (
                    <>
                      <span className="text-border">|</span>
                      <span>
                        Submitted:{" "}
                        <span className="font-semibold text-foreground">
                          {formatDate(new Date(score.submissionDate), "PP")}
                        </span>
                      </span>
                    </>
                  )}
                  {isSubmittingToStaff && (
                    <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Submitted
                    </Badge>
                  )}
                </div>
              </div>
              <RenderModeBasedContent
                isSubmittingToStaff={isSubmittingToStaff}
                mode={mode}
                scheduleDetail={scheduleDetail}
                score={score}
                setIsSubmittedDialogOpen={setIsSubmittedDialogOpen}
                setMode={setMode}
              />
            </div>
          </CardHeader>

          <div className="px-6 pt-4">
            <Separator />
          </div>

          {/* Score weight badges */}
          <div className="px-6 pt-4">
            <ScoreConfigBadges config={configureScore} />
          </div>

          {isRefreshing && (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          )}

          <CardContent className="p-4 pt-4 space-y-4">
            <StudentScoresTable
              configureScore={configureScore}
              handleFieldChange={handleFieldChange}
              handleRemoveFromUnsaved={handleRemoveFromUnsaved}
              isSubmitted={isSubmitted}
              isSubmitting={isSubmitting}
              mode={mode}
              score={score}
              unsavedChanges={unsavedChanges}
            />

            {isInitialized && totalStudents === 0 && (
              <EmptyState
                icon={UserX}
                message="No students enrolled"
                description="No students are enrolled in this class yet."
              />
            )}
          </CardContent>
        </Card>
      )}

      {hasUnsaved && !isSubmitted && (
        <StudentScoresQuickAction
          handleResetChanges={handleResetChanges}
          handleSaveScores={handleSaveAllChanges}
          isSavingAll={isSavingAll}
          unsavedChanges={unsavedChanges}
        />
      )}

      {hasUnsaved && (
        <StudentScoreAlert unsavedChanges={unsavedChanges} />
      )}

      <ScoreSubmitConfirmDialog
        open={isSubmittedDialogOpen}
        title="Confirm Submit"
        description="Are you sure you want to submit student scores to the staff officer?"
        subDescription="This action cannot be undone once confirmed."
        onConfirm={handleSubmit}
        confirmText="Submit"
        cancelText="Cancel"
        onOpenChange={setIsSubmittedDialogOpen}
      />
    </div>
  );
}
