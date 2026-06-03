import React from "react";
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
import { CheckCircle, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { ScoreConfigurationModel } from "@/model/score/submitted-score/submitted-score.response.model";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/routes";

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

/** Inline score input — text field that only accepts valid numbers within the max limit */
function ScoreInput({
  value,
  max,
  disabled,
  hasChange,
  onChange,
}: {
  value: number | string;
  max: number;
  disabled: boolean;
  hasChange: boolean;
  onChange: (val: string) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty or valid decimal number format
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      const num = parseFloat(raw);
      // Block if the number exceeds the max (allow empty / incomplete like "1.")
      if (isNaN(num) || num <= max) {
        onChange(raw);
      }
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      disabled={disabled}
      onChange={handleChange}
      className={[
        "h-8 w-full rounded-md border px-2 text-sm text-center transition-colors",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50 bg-background text-foreground",
        hasChange
          ? "border-yellow-400 ring-1 ring-yellow-300 bg-yellow-50"
          : "border-border",
      ].join(" ")}
    />
  );
}

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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-black hover:bg-black">
            <TableHead className="text-white w-12">#</TableHead>
            <TableHead className="text-white">Student ID</TableHead>
            <TableHead className="text-white">Fullname (KH)</TableHead>
            <TableHead className="text-white">Fullname (EN)</TableHead>
            <TableHead className="text-white">Gender</TableHead>
            <TableHead className="text-white">Birth Date</TableHead>
            <TableHead className="text-white text-center">
              Att. ({configureScore?.attendancePercentage ?? 0}%)
            </TableHead>
            <TableHead className="text-white text-center">
              Ass. ({configureScore?.assignmentPercentage ?? 0}%)
            </TableHead>
            <TableHead className="text-white text-center">
              Mid. ({configureScore?.midtermPercentage ?? 0}%)
            </TableHead>
            <TableHead className="text-white text-center">
              Final ({configureScore?.finalPercentage ?? 0}%)
            </TableHead>
            <TableHead className="text-white text-center">Total</TableHead>
            <TableHead className="text-white text-center">Grade</TableHead>
            <TableHead className="text-white text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!score || score.studentScores.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={13}
                className="text-center italic text-gray-500 py-8"
              >
                No students found in this class.
              </TableCell>
            </TableRow>
          ) : (
            score.studentScores.map((student, index) => {
              const hasChange = unsavedChanges.has(student.id);
              return (
                <TableRow key={student.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{student.studentIdentityNumber}</TableCell>
                  <TableCell className="font-medium">
                    {student.studentNameKhmer?.trim() || "---"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.studentNameEnglish?.trim() || "---"}
                  </TableCell>
                  <TableCell>{student.gender || "---"}</TableCell>
                  <TableCell>{student.dateOfBirth || "---"}</TableCell>

                  {/* Attendance — editable in edit mode */}
                  <TableCell className="text-center">
                    {isEditing ? (
                      <ScoreInput
                        value={student.attendanceScore ?? 0}
                        max={configureScore?.attendancePercentage ?? 100}
                        disabled={isSubmitting}
                        hasChange={hasChange}
                        onChange={(val) =>
                          handleFieldChange(student.id, "attendanceScore", val)
                        }
                      />
                    ) : (
                      <span>{student.attendanceScore ?? 0}</span>
                    )}
                  </TableCell>

                  {/* Assignment */}
                  <TableCell className="text-center">
                    {isEditing ? (
                      <ScoreInput
                        value={student.assignmentScore ?? 0}
                        max={configureScore?.assignmentPercentage ?? 100}
                        disabled={isSubmitting}
                        hasChange={hasChange}
                        onChange={(val) =>
                          handleFieldChange(student.id, "assignmentScore", val)
                        }
                      />
                    ) : (
                      <span>{student.assignmentScore ?? 0}</span>
                    )}
                  </TableCell>

                  {/* Midterm */}
                  <TableCell className="text-center">
                    {isEditing ? (
                      <ScoreInput
                        value={student.midtermScore ?? 0}
                        max={configureScore?.midtermPercentage ?? 100}
                        disabled={isSubmitting}
                        hasChange={hasChange}
                        onChange={(val) =>
                          handleFieldChange(student.id, "midtermScore", val)
                        }
                      />
                    ) : (
                      <span>{student.midtermScore ?? 0}</span>
                    )}
                  </TableCell>

                  {/* Final */}
                  <TableCell className="text-center">
                    {isEditing ? (
                      <ScoreInput
                        value={student.finalScore ?? 0}
                        max={configureScore?.finalPercentage ?? 100}
                        disabled={isSubmitting}
                        hasChange={hasChange}
                        onChange={(val) =>
                          handleFieldChange(student.id, "finalScore", val)
                        }
                      />
                    ) : (
                      <span>{student.finalScore ?? 0}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center font-bold">
                    {student.totalScore ?? 0}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={`font-bold px-2 py-1 rounded text-sm ${
                        student.grade === "A"
                          ? "bg-green-100 text-green-800"
                          : student.grade === "B"
                          ? "bg-blue-100 text-blue-800"
                          : student.grade === "C"
                          ? "bg-yellow-100 text-yellow-800"
                          : student.grade === "D"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.grade || "---"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    {mode === "view" || isSubmitted ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() =>
                                router.push(
                                  ROUTE.USERS.VIEW_TEACHER(String(student.id))
                                )
                              }
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                              disabled={isSubmitting}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Detail</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : hasChange ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromUnsaved(student.id)}
                        className="text-red-500 hover:text-red-700 h-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
