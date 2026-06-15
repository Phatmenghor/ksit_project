import React, { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { ScoreConfigurationModel } from "@/model/score/submitted-score/submitted-score.response.model";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/routes";
import { toast } from "sonner";

interface TableProps {
  mode: string;
  score: SubmissionScoreModel | null;
  isSubmitting: boolean;
  unsavedChanges: Set<number>;
  isSubmitted: boolean;
  handleFieldChange: (scoreId: number, field: string, value: string) => void;
  configureScore: ScoreConfigurationModel | null;
  handleRemoveFromUnsaved: (scoreId: number) => void;
}

function ScoreInput({
  value,
  max,
  disabled,
  hasChange,
  fieldLabel,
  onChange,
}: {
  value: number | string;
  max: number;
  disabled: boolean;
  hasChange: boolean;
  fieldLabel: string;
  onChange: (val: string) => void;
}) {
  const prevValidRef = useRef<string>(String(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty string or valid decimal-in-progress (e.g. "1.", "0.")
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      const num = parseFloat(raw);

      if (isNaN(num)) {
        // Still typing (e.g. "1." or empty) — pass through
        onChange(raw);
        return;
      }

      if (num > max) {
        // Clamp to max and toast
        toast.warning(`${fieldLabel} score cannot exceed ${max}%`, {
          description: `Value reset to maximum ${max}`,
          duration: 2500,
        });
        onChange(String(max));
        prevValidRef.current = String(max);
        return;
      }

      prevValidRef.current = raw;
      onChange(raw);
    }
    // else: ignore non-numeric characters entirely
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // On blur, fix leading zeros like "02" → "2", or empty / "." → "0"
    if (raw === "" || raw === ".") {
      onChange("0");
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num)) {
      onChange("0");
      return;
    }

    // Remove leading zeros: "02" → "2", "00.5" → "0.5"
    const cleaned = String(num);
    if (cleaned !== raw) {
      onChange(cleaned);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      disabled={disabled}
      onChange={handleChange}
      onBlur={handleBlur}
      className={[
        "h-9 w-16 rounded-lg border px-2 text-sm text-center font-medium transition-all duration-150",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasChange
          ? "border-amber-400 ring-1 ring-amber-300 bg-amber-50 text-amber-900"
          : "border-border bg-background text-foreground hover:border-primary/50",
      ].join(" ")}
    />
  );
}

const gradeStyle: Record<string, string> = {
  A: "bg-green-100 text-green-800 border border-green-200",
  B: "bg-blue-100 text-blue-800 border border-blue-200",
  C: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  D: "bg-orange-100 text-orange-800 border border-orange-200",
};

export default function StudentScoresTable({
  mode,
  score,
  isSubmitting,
  unsavedChanges,
  isSubmitted,
  configureScore,
  handleFieldChange,
  handleRemoveFromUnsaved,
}: TableProps) {
  const router = useRouter();
  const isEditing = mode === "edit-score" && !isSubmitted;

  const scoreColumns = [
    {
      field: "attendanceScore",
      label: "Att.",
      max: configureScore?.attendancePercentage ?? 100,
    },
    {
      field: "assignmentScore",
      label: "Ass.",
      max: configureScore?.assignmentPercentage ?? 100,
    },
    {
      field: "midtermScore",
      label: "Mid.",
      max: configureScore?.midtermPercentage ?? 100,
    },
    {
      field: "finalScore",
      label: "Final",
      max: configureScore?.finalPercentage ?? 100,
    },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-3 py-3 text-left font-semibold w-10">#</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Student ID</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Fullname (KH)</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Fullname (EN)</th>
              <th className="px-3 py-3 text-left font-semibold">Gender</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Birth Date</th>
              {scoreColumns.map((col) => (
                <th key={col.field} className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                  <div>{col.label}</div>
                  <div className="text-xs font-normal opacity-80">({col.max}%)</div>
                </th>
              ))}
              <th className="px-3 py-3 text-center font-semibold">Total</th>
              <th className="px-3 py-3 text-center font-semibold">Grade</th>
              <th className="px-3 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {!score || score.studentScores.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center text-muted-foreground py-12 italic">
                  No students found in this class.
                </td>
              </tr>
            ) : (
              score.studentScores.map((student, index) => {
                const hasChange = unsavedChanges.has(student.id);
                const scoreValues: Record<string, number | string> = {
                  attendanceScore: student.attendanceScore ?? 0,
                  assignmentScore: student.assignmentScore ?? 0,
                  midtermScore: student.midtermScore ?? 0,
                  finalScore: student.finalScore ?? 0,
                };
                return (
                  <tr
                    key={student.id}
                    className={[
                      "border-t border-border transition-colors",
                      hasChange
                        ? "bg-amber-50/60"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-muted/30",
                      "hover:bg-primary/5",
                    ].join(" ")}
                  >
                    <td className="px-3 py-2.5 text-muted-foreground font-medium">{index + 1}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{student.studentIdentityNumber}</td>
                    <td className="px-3 py-2.5 font-medium">{student.studentNameKhmer?.trim() || "—"}</td>
                    <td className="px-3 py-2.5">{student.studentNameEnglish?.trim() || "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{student.gender || "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{student.dateOfBirth || "—"}</td>

                    {scoreColumns.map((col) => (
                      <td key={col.field} className="px-3 py-2 text-center">
                        {isEditing ? (
                          <ScoreInput
                            value={scoreValues[col.field]}
                            max={col.max}
                            disabled={isSubmitting}
                            hasChange={hasChange}
                            fieldLabel={col.label}
                            onChange={(val) =>
                              handleFieldChange(student.id, col.field, val)
                            }
                          />
                        ) : (
                          <span className="font-medium">{scoreValues[col.field]}</span>
                        )}
                      </td>
                    ))}

                    <td className="px-3 py-2.5 text-center font-bold text-primary">
                      {student.totalScore ?? 0}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          gradeStyle[student.grade] ?? "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {student.grade || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      {mode === "view" || isSubmitted ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() =>
                                  router.push(ROUTE.USERS.VIEW_TEACHER(String(student.id)))
                                }
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-muted hover:bg-primary/10 hover:text-primary"
                                disabled={isSubmitting}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View detail</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : hasChange ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFromUnsaved(student.id)}
                                className="h-8 w-8 rounded-full text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Discard changes</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-50 text-green-700 border border-green-200"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
