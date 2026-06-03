"use client";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import Loading from "@/components/shared/loading";
import { ROUTE } from "@/constants/routes";
import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentSurveyHeader } from "@/constants/table/user";
import { StudentSurveyModel } from "@/model/survey/student-survey-model";
import { getAllStudentSurveyService } from "@/service/survey/history-survey.service";
import { toast } from "sonner";
import { useParams, useSearchParams } from "next/navigation";

const AllStduentView = () => {
  const params = useParams();
  const rawId = params?.id;
  const id = rawId && !isNaN(Number(rawId)) ? Number(rawId) : null;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentData, setStudentData] = useState<StudentSurveyModel | null>(
    null
  );

  // Fetch student data from server
  const loadStudents = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!id) {
        toast.error("Invalid schedule ID");
        return;
      }
      const response = await getAllStudentSurveyService({
        scheduleId: id,
      });

      if (response) {
        setStudentData(response);
      } else {
        console.error("Failed to fetch student:");
      }
    } catch (error) {
      toast.error("An error occurred while loading student");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents, id]);

  return (
    <div className="space-y-4">
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "All Student", href: ROUTE.SURVEY.STUDENT },
        ]}
        buttonHref={ROUTE.SURVEY.STUDENT}
        title="All Student"
        back
      />

      <div className={`overflow-x-auto mt-4`}>
        {isLoading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {StudentSurveyHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentData?.students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={StudentSurveyHeader.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No student found
                  </TableCell>
                </TableRow>
              ) : (
                studentData?.students?.map((student, index) => {
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.username || "---"}</TableCell>
                      <TableCell>
                        {`${student.khmerFirstName || ""} ${
                          student.khmerLastName || ""
                        }`.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        {`${student.englishFirstName || ""} ${
                          student.englishLastName || ""
                        }`.trim() || "---"}
                      </TableCell>
                      <TableCell>{student.gender || "---"}</TableCell>
                      <TableCell>{student.dateOfBirth || "---"}</TableCell>
                      <TableCell>
                        {student.studentClass?.code || "---"}
                      </TableCell>

                      <TableCell>
                        {(() => {
                          const getStatusConfig = (status: string) => {
                            switch (status) {
                              case "COMPLETED":
                                return {
                                  text: "Completed",
                                  bgColor: "bg-green-100",
                                  textColor: "text-green-800",
                                  borderColor: "border-green-200",
                                };
                              case "NOT_STARTED":
                                return {
                                  text: "Not Started",
                                  bgColor: "bg-red-100",
                                  textColor: "text-red-800",
                                  borderColor: "border-red-200",
                                };
                              case "NONE":
                              default:
                                return {
                                  text: "Pending",
                                  bgColor: "bg-yellow-100",
                                  textColor: "text-yellow-800",
                                  borderColor: "border-yellow-200",
                                };
                            }
                          };

                          const config = getStatusConfig(student.surveyStatus);

                          return (
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
                            >
                              {config.text}
                            </span>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AllStduentView;
