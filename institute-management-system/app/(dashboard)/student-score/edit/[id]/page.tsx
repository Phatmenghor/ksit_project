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

/** Parse any value (string | number) to a safe number for API calls */
const toNumber = (v: unknown): number => {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
};

const isEditingAllowed = (status: string) => status === SubmissionEnum.DRAFT;
const getModeFromStatus = (status: string): "view" | "edit-score" =>
  isEditingAllowed(status) ? "edit-score" : "view";

type OriginalScoreSnapshot = {
  attendanceScore: number;
  assignmentScore: number;
  midtermScore: number;
  finalScore: number;
  grade: string;
};

export default function StudentScoreDetailsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittedDialogOpen, setIsSubmittedDialogOpen] = useState(false);
  const [isSubmittingToStaff, setIsSubmittingToStaff] = useState(false);

  const [configureScore, setConfigureScore] =
    useState<ScoreConfigurationModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const [scheduleDetail, setScheduleDetail] = useState<ScheduleModel | null>(
    null
  );
  const [score, setScore] = useState<SubmissionScoreModel | null>(null);
  const [mode, setMode] = useState<"view" | "edit-score">("view");
  const [originalData, setOriginalData] = useState<
    Map<number, OriginalScoreSnapshot>
  >(new Map());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Prevent double-initialization on strict mode double-render
  const initCalledRef = useRef(false);

  const params = useParams();
  const id = params?.id ? Number(params.id) : null;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const applySessionResponse = useCallback(
    (response: SubmissionScoreModel) => {
      setScore(response);
      setIsInitialized(true);
      const newMode = getModeFromStatus(response.status);
      setMode(newMode);
      const notEditable = !isEditingAllowed(response.status);
      setIsSubmitted(notEditable);
      setIsSubmittingToStaff(notEditable);

      const map = new Map<number, OriginalScoreSnapshot>();
      response.studentScores?.forEach((s: StudentScoreModel) => {
        map.set(s.id, {
          attendanceScore: toNumber(s.attendanceScore),
          assignmentScore: toNumber(s.assignmentScore),
          midtermScore: toNumber(s.midtermScore),
          finalScore: toNumber(s.finalScore),
          grade: s.grade,
        });
      });
      setOriginalData(map);
      setUnsavedChanges(new Set());
    },
    []
  );

  // ─── Data loading ────────────────────────────────────────────────────────────

  const loadScoreConfigureData = useCallback(async () => {
    try {
      const response = await getConfigurationScoreService();
      setConfigureScore(response);
    } catch {
      toast.error("Error loading score configuration");
    }
  }, []);

  /** Initialize (or refresh) the score session for the current schedule */
  const initializeSession = useCallback(
    async (scheduleId: number, silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const response = await intiStudentsScoreService({ scheduleId });
        applySessionResponse(response);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load student scores");
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [applySessionResponse]
  );

  // ─── Auto-initialize when schedule detail arrives ────────────────────────────

  const loadScheduleData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await getDetailScheduleService(Number(id));
      setScheduleDetail(response);
    } catch {
      toast.error("Error fetching schedule data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadScheduleData();
    loadScoreConfigureData();
  }, [loadScheduleData, loadScoreConfigureData]);

  // Auto-initialize once when scheduleDetail becomes available
  useEffect(() => {
    if (!scheduleDetail?.id || initCalledRef.current) return;
    initCalledRef.current = true;
    initializeSession(scheduleDetail.id);
  }, [scheduleDetail?.id, initializeSession]);

  // Sync mode when status changes externally
  useEffect(() => {
    if (score?.status) {
      setMode(getModeFromStatus(score.status));
      const notEditable = !isEditingAllowed(score.status);
      setIsSubmitted(notEditable);
      setIsSubmittingToStaff(notEditable);
    }
  }, [score?.status]);

  // ─── Field change handler ────────────────────────────────────────────────────

  const handleFieldChange = useCallback(
    (scoreId: number, field: string, value: string) => {
      if (isSubmitted) {
        toast.error("Cannot modify scores after submission");
        return;
      }

      // Optimistic UI update
      setScore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          studentScores: prev.studentScores.map((s) =>
            s.id === scoreId ? { ...s, [field]: value } : s
          ),
        };
      });

      // Determine whether this student's row is dirty vs original
      setUnsavedChanges((prevSet) => {
        const original = originalData.get(scoreId);
        if (!original) {
          if (prevSet.has(scoreId)) return prevSet;
          return new Set(prevSet).add(scoreId);
        }

        // Build the updated snapshot using current score state
        setScore((currentScore) => {
          const currentRow = currentScore?.studentScores.find(
            (s) => s.id === scoreId
          );
          if (!currentRow) return currentScore;

          const updated = { ...currentRow, [field]: value };

          const isDirty =
            toNumber(updated.attendanceScore) !== original.attendanceScore ||
            toNumber(updated.assignmentScore) !== original.assignmentScore ||
            toNumber(updated.midtermScore) !== original.midtermScore ||
            toNumber(updated.finalScore) !== original.finalScore;

          setUnsavedChanges((s) => {
            const next = new Set(s);
            isDirty ? next.add(scoreId) : next.delete(scoreId);
            return next;
          });

          return currentScore; // no state change, just reading
        });

        return prevSet; // interim — the inner setScore above handles the real update
      });
    },
    [originalData, isSubmitted]
  );

  // ─── Save all unsaved changes ────────────────────────────────────────────────

  const handleSaveAllChanges = useCallback(async () => {
    if (unsavedChanges.size === 0 || isSubmitted) return;

    setIsSavingAll(true);
    try {
      const changed = score?.studentScores.filter((s) =>
        unsavedChanges.has(s.id)
      ) ?? [];

      const updatePromises = changed.map((item) =>
        updateStudentsScoreService({
          id: item.id,
          attendanceScore: toNumber(item.attendanceScore),
          assignmentScore: toNumber(item.assignmentScore),
          midtermScore: toNumber(item.midtermScore),
          finalScore: toNumber(item.finalScore),
          comments: item.comments || "",
        })
      );

      const responses = await Promise.all(updatePromises);

      // Merge API responses back into state (grade + totalScore recalculated by backend)
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

      // Update original snapshots
      const newOriginal = new Map(originalData);
      responses.forEach((r) => {
        newOriginal.set(r.id, {
          attendanceScore: toNumber(r.attendanceScore),
          assignmentScore: toNumber(r.assignmentScore),
          midtermScore: toNumber(r.midtermScore),
          finalScore: toNumber(r.finalScore),
          grade: r.grade,
        });
      });
      setOriginalData(newOriginal);
      setUnsavedChanges(new Set());

      toast.success(`${responses.length} student score(s) saved`, {
        duration: 2000,
        description: "Grades and totals recalculated",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to save scores");
    } finally {
      setIsSavingAll(false);
    }
  }, [score, unsavedChanges, originalData, isSubmitted]);

  // ─── Submit to staff ─────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!score) return;
    if (unsavedChanges.size > 0) {
      toast.error("Please save all changes before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submittedScoreService({
        id: score.id ?? 0,
        status: SubmissionEnum.SUBMITTED,
      });

      if (response) {
        setScore((prev) =>
          prev ? { ...prev, status: SubmissionEnum.SUBMITTED } : prev
        );
        setMode("view");
        setIsSubmitted(true);
        setIsSubmittingToStaff(true);

        toast.success("Score submitted to staff officer!", {
          duration: 3000,
          icon: <CheckCircle className="h-4 w-4" />,
        });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit score");
    } finally {
      setIsSubmitting(false);
    }
  }, [score, unsavedChanges.size]);

  // ─── Helpers for quick-action panel ─────────────────────────────────────────

  const handleRemoveFromUnsaved = useCallback((scoreId: number) => {
    setUnsavedChanges((prev) => {
      if (!prev.has(scoreId)) return prev;
      const next = new Set(prev);
      next.delete(scoreId);
      return next;
    });
  }, []);

  const handleResetChanges = useCallback(() => {
    if (isSubmitted) return;
    setUnsavedChanges(new Set());
    if (scheduleDetail?.id) initializeSession(scheduleDetail.id);
  }, [initializeSession, scheduleDetail?.id, isSubmitted]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <StudentScoreHeader schedule={scheduleDetail} title="View Class Detail" />

      {isLoading && !isInitialized ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : (
        <Card className="shadow-md">
          <CardHeader className="flex flex-row justify-between w-full">
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

          <div className="w-full px-4">
            <Separator className="bg-gray-300" />
          </div>

          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6 mb-3">
              <p>
                <span className="text-gray-500">Total Students: </span>
                <span className="font-semibold">
                  {score?.studentScores.length ?? 0}
                </span>
              </p>

              {isSubmittingToStaff && score?.submissionDate && (
                <>
                  <span className="text-gray-400">|</span>
                  <p>
                    <span className="text-gray-500">Submitted Date: </span>
                    <span className="font-semibold">
                      {formatDate(new Date(score.submissionDate), "PP")}
                    </span>
                  </p>
                </>
              )}
            </div>

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

            {isInitialized &&
              (!score?.studentScores || score.studentScores.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No students in this class yet.</p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Floating save panel */}
      {score && unsavedChanges.size > 0 && !isSubmitted && (
        <StudentScoresQuickAction
          handleResetChanges={handleResetChanges}
          handleSaveScores={handleSaveAllChanges}
          isSavingAll={isSavingAll}
          setUnsavedChanges={setUnsavedChanges}
          unsavedChanges={unsavedChanges}
        />
      )}

      <ScoreSubmitConfirmDialog
        open={isSubmittedDialogOpen}
        title="Confirm Submit!"
        description="Are you sure you want to submit student scores?"
        onConfirm={handleSubmit}
        cancelText="Discard"
        subDescription="Scores will be sent to the staff officer for review."
        onOpenChange={() => setIsSubmittedDialogOpen(false)}
      />

      {score && unsavedChanges.size > 0 && (
        <StudentScoreAlert unsavedChanges={unsavedChanges} />
      )}
    </div>
  );
}
