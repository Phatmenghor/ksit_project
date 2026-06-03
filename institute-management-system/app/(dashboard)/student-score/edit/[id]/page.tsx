"use client";

import StudentScoreHeader from "@/components/dashboard/student-scores/layout/header-section";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import {
  StudentScoreModel,
  SubmissionScoreModel,
} from "@/model/score/student-score/student-score.response";
import {
  getConfigurationScoreService,
  intiStudentsScoreService,
  submittedScoreService,
  updateStudentsScoreService,
} from "@/service/score/score.service";
import { toast } from "sonner";
import { getDetailScheduleService } from "@/service/schedule/schedule.service";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { ScoreSubmitConfirmDialog } from "@/components/dashboard/student-scores/layout/submit-confirm-dialog";
import { SubmissionEnum } from "@/constants/constant";
import { formatDate } from "date-fns";
import { ScoreConfigurationModel } from "@/model/score/submitted-score/submitted-score.response.model";
import StudentScoresTable from "@/components/dashboard/student-scores/student-scores-table";
import StudentScoresQuickAction from "@/components/dashboard/student-scores/student-scores-quick-action";
import StudentScoreAlert from "@/components/dashboard/student-scores/student-scores-alert";
import RenderModeBasedContent from "@/components/dashboard/student-scores/student-scores-mode-based-content";
import Loading from "@/components/shared/loading";

// ─── Types ───────────────────────────────────────────────────────────────────

type OriginalSnapshot = {
  attendanceScore: number;
  assignmentScore: number;
  midtermScore: number;
  finalScore: number;
  grade: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely parse any value to a number; empty string / NaN → 0 */
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

const isDirtyRow = (
  row: StudentScoreModel,
  original: OriginalSnapshot
): boolean =>
  toNum(row.attendanceScore) !== original.attendanceScore ||
  toNum(row.assignmentScore) !== original.assignmentScore ||
  toNum(row.midtermScore) !== original.midtermScore ||
  toNum(row.finalScore) !== original.finalScore;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentScoreDetailsPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;

  // ── Data state ──
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleModel | null>(null);
  const [configureScore, setConfigureScore] = useState<ScoreConfigurationModel | null>(null);
  const [score, setScore] = useState<SubmissionScoreModel | null>(null);
  const [originalData, setOriginalData] = useState<Map<number, OriginalSnapshot>>(new Map());

  // ── UI state ──
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

  // Prevent double-init in React Strict Mode
  const initCalledRef = useRef(false);

  // ─── Apply session response ───────────────────────────────────────────────

  const applySession = useCallback((response: SubmissionScoreModel) => {
    setScore(response);
    setIsInitialized(true);

    const newMode = getModeFromStatus(response.status);
    setMode(newMode);

    const notEditable = !isEditingAllowed(response.status);
    setIsSubmitted(notEditable);
    setIsSubmittingToStaff(notEditable);

    const map = new Map<number, OriginalSnapshot>();
    response.studentScores?.forEach((s) => map.set(s.id, buildSnapshot(s)));
    setOriginalData(map);
    setUnsavedChanges(new Set());
  }, []);

  // ─── Data loaders ─────────────────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    try {
      const res = await getConfigurationScoreService();
      setConfigureScore(res);
    } catch {
      toast.error("Failed to load score configuration");
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await getDetailScheduleService(id);
      setScheduleDetail(res);
    } catch {
      toast.error("Failed to load schedule details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const initializeSession = useCallback(
    async (scheduleId: number, silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const res = await intiStudentsScoreService({ scheduleId });
        applySession(res);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load student scores");
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [applySession]
  );

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    loadSchedule();
    loadConfig();
  }, [loadSchedule, loadConfig]);

  // Auto-init once after schedule loads
  useEffect(() => {
    if (!scheduleDetail?.id || initCalledRef.current) return;
    initCalledRef.current = true;
    initializeSession(scheduleDetail.id);
  }, [scheduleDetail?.id, initializeSession]);

  // Sync mode when status changes externally
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

      // 1. Update the score row
      setScore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          studentScores: prev.studentScores.map((s) =>
            s.id === scoreId ? { ...s, [field]: value } : s
          ),
        };
      });

      // 2. Track dirty state — build updated row from current score + new value
      setScore((prev) => {
        const row = prev?.studentScores.find((s) => s.id === scoreId);
        if (!row) return prev;

        const updatedRow = { ...row, [field]: value };
        const dirty = !original || isDirtyRow(updatedRow, original);

        setUnsavedChanges((prevSet) => {
          const next = new Set(prevSet);
          dirty ? next.add(scoreId) : next.delete(scoreId);
          return next;
        });

        return prev; // no mutation — just reading
      });
    },
    [originalData, isSubmitted]
  );

  // ─── Save all ─────────────────────────────────────────────────────────────

  const handleSaveAllChanges = useCallback(async () => {
    if (unsavedChanges.size === 0 || isSubmitted || !score) return;

    setIsSavingAll(true);
    try {
      const changed = score.studentScores.filter((s) =>
        unsavedChanges.has(s.id)
      );

      const responses = await Promise.all(
        changed.map((item) =>
          updateStudentsScoreService({
            id: item.id,
            attendanceScore: toNum(item.attendanceScore),
            assignmentScore: toNum(item.assignmentScore),
            midtermScore: toNum(item.midtermScore),
            finalScore: toNum(item.finalScore),
            comments: item.comments || "",
          })
        )
      );

      // Merge API responses back (backend recalculates grade + totalScore)
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

      // Update original snapshots so subsequent edits compare correctly
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
  }, [score, unsavedChanges, originalData, isSubmitted]);

  // ─── Reset to original values (local — no API call) ───────────────────────

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

  // ─── Remove single row from unsaved ───────────────────────────────────────

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

  // ─── Submit to staff ──────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!score) return;

    if (unsavedChanges.size > 0) {
      toast.error("Please save all changes before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await submittedScoreService({
        id: score.id ?? 0,
        status: SubmissionEnum.SUBMITTED,
      });

      setScore((prev) =>
        prev ? { ...prev, status: SubmissionEnum.SUBMITTED } : prev
      );
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
  }, [score, unsavedChanges.size]);

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
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-bold text-xl">Student List</CardTitle>
            <RenderModeBasedContent
              isSubmittingToStaff={isSubmittingToStaff}
              mode={mode}
              scheduleDetail={scheduleDetail}
              score={score}
              setIsSubmittedDialogOpen={setIsSubmittedDialogOpen}
              setMode={setMode}
            />
          </CardHeader>

          {isRefreshing && (
            <div className="flex justify-center py-4">
              <Loading />
            </div>
          )}

          <div className="px-4">
            <Separator />
          </div>

          <CardContent className="p-4 space-y-4">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <p>
                <span className="text-muted-foreground">Total Students: </span>
                <span className="font-semibold">{totalStudents}</span>
              </p>

              {isSubmittingToStaff && score?.submissionDate && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <p>
                    <span className="text-muted-foreground">Submitted: </span>
                    <span className="font-semibold">
                      {formatDate(new Date(score.submissionDate), "PP")}
                    </span>
                  </p>
                </>
              )}
            </div>

            {/* Score table */}
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
              <div className="text-center py-12 text-muted-foreground text-sm">
                No students are enrolled in this class yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Floating save/reset panel */}
      {hasUnsaved && !isSubmitted && (
        <StudentScoresQuickAction
          handleResetChanges={handleResetChanges}
          handleSaveScores={handleSaveAllChanges}
          isSavingAll={isSavingAll}
          unsavedChanges={unsavedChanges}
        />
      )}

      {/* Unsaved-changes warning banner */}
      {hasUnsaved && (
        <StudentScoreAlert unsavedChanges={unsavedChanges} />
      )}

      {/* Submit confirmation */}
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
