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
import { Input } from "@/components/ui/input";
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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-black hover:bg-black">
            <TableHead className="text-white w-12">#</TableHead>
            <TableHead className="text-white">Student IdentifyNumber</TableHead>
            <TableHead className="text-white">Fullname (KH)</TableHead>
            <TableHead className="text-white">Fullname (EN)</TableHead>
            <TableHead className="text-white">Gender</TableHead>
            <TableHead className="text-white">Birth Date</TableHead>
            <TableHead className="text-white text-center">
              Att. ({configureScore?.attendancePercentage}%)
            </TableHead>
            <TableHead className="text-white text-center">
              Ass. ({configureScore?.assignmentPercentage}%)
            </TableHead>

            <TableHead className="text-white text-center">
              Mid. ({configureScore?.midtermPercentage}%)
            </TableHead>
            <TableHead className="text-white text-center">
              Final ({configureScore?.finalPercentage}%)
            </TableHead>

            <TableHead className="text-white text-center">Total</TableHead>
            <TableHead className="text-white text-center">Grade</TableHead>
            <TableHead className="text-white text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {score?.studentScores.length === 0 || score === null ? (
            <TableRow>
              <TableCell
                colSpan={15}
                className="text-center italic text-gray-500"
              >
                No students found in this class.
              </TableCell>
            </TableRow>
          ) : (
            score?.studentScores?.map((student, index) => {
              const indexDisplay = index + 1;
              return (
                <TableRow key={indexDisplay} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{indexDisplay}</TableCell>
                  <TableCell>{student?.studentIdentityNumber}</TableCell>
                  <TableCell className="font-medium">
                    {student?.studentNameKhmer?.trim() ?? "---"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student?.studentNameEnglish?.trim() ?? "---"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student?.gender ?? "---"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student?.dateOfBirth ?? "---"}
                  </TableCell>
                  <TableCell className="text-center">
                    {student?.attendanceScore ?? 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {mode === "edit-score" ? (
                      <Input
                        type="number"
                        value={student.assignmentScore}
                        disabled={isSubmitting}
                        className={`h-8 text-sm w-full transition-all duration-100 ease-in-out ${
                          unsavedChanges.has(student.id)
                            ? "border-yellow-300 ring-1 ring-yellow-200"
                            : ""
                        } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                        onChange={(e) =>
                          handleFieldChange(
                            student.id,
                            "assignmentScore",
                            e.target.value
                          )
                        }
                        min="0"
                        max={configureScore?.assignmentPercentage}
                      />
                    ) : (
                      <span>{student?.assignmentScore ?? 0}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {mode === "edit-score" ? (
                      <Input
                        type="number"
                        disabled={isSubmitting}
                        value={student.midtermScore}
                        className={`h-8 text-sm w-full transition-all duration-100 ease-in-out ${
                          unsavedChanges.has(student.id)
                            ? "border-yellow-300 ring-1 ring-yellow-200"
                            : ""
                        } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                        onChange={(e) =>
                          handleFieldChange(
                            student.id,
                            "midtermScore",
                            e.target.value
                          )
                        }
                        min="0"
                        max={configureScore?.midtermPercentage}
                      />
                    ) : (
                      <span>{student?.midtermScore ?? 0}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {mode === "edit-score" ? (
                      <Input
                        type="number"
                        value={student.finalScore}
                        disabled={isSubmitting}
                        className={`h-8 text-sm w-full transition-all duration-100 ease-in-out ${
                          unsavedChanges.has(student.id)
                            ? "border-yellow-300 ring-1 ring-yellow-200"
                            : ""
                        } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                        onChange={(e) =>
                          handleFieldChange(
                            student.id,
                            "finalScore",
                            e.target.value
                          )
                        }
                        min="0"
                        max={configureScore?.finalPercentage}
                      />
                    ) : (
                      <span>{student?.finalScore ?? 0}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center font-bold">
                    <span>{student?.totalScore ?? 0}</span>
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
                      {student?.grade ?? "---"}
                    </span>
                  </TableCell>

                  {mode === "view" ? (
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => {
                                router.push(
                                  `${ROUTE.USERS.VIEW_TEACHER(
                                    String(student.id)
                                  )}`
                                );
                              }}
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
                    </TableCell>
                  ) : mode === "edit-score" ? (
                    <TableCell>
                      {isSubmitted ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Submitted
                        </Badge>
                      ) : unsavedChanges.has(student.id) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromUnsaved(student.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Saved
                        </Badge>
                      )}
                    </TableCell>
                  ) : (
                    <></>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
