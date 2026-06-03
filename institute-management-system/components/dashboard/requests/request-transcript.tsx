import Loading from "@/components/shared/loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDegree } from "@/constants/format-enum/format-degree";
import { formatSemester } from "@/constants/format-enum/format-semester";
import { formatYearLevel } from "@/constants/format-enum/format-year-level";
import { RequestTranscriptTableHeader } from "@/constants/table/request";
import { TranscriptModel } from "@/model/request/request-transcript";
import { getDetailRequestTranscriptService } from "@/service/request/request.service";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface RequestParam {
  studentId?: number;
}

export function RequestTranscript(param: RequestParam) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transcriptReqData, setTranscriptReqData] =
    useState<TranscriptModel | null>(null);

  const fetchTranscriptReq = useCallback(async () => {
    // Check if studentId exists and is valid
    if (!param.studentId || param.studentId <= 0) {
      console.warn("Invalid or missing studentId:", param.studentId);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching transcript for studentId:", param.studentId);
      const response = await getDetailRequestTranscriptService(param.studentId);

      // Check if response is valid
      if (!response) {
        console.warn("No data received from service");
        toast.error("No transcript data found");
        return;
      }

      console.log("Transcript data received:", response);
      setTranscriptReqData(response);
    } catch (error: any) {
      console.error("Error fetching transcript requests:", error);
      toast.error("Error occurred while loading transcript");
    } finally {
      setIsLoading(false);
    }
  }, [param.studentId]);

  useEffect(() => {
    fetchTranscriptReq();
  }, [fetchTranscriptReq]);

  const leftColumnData = [
    { label: "Student ID", value: transcriptReqData?.studentCode || "---" },
    { label: "Student Name", value: transcriptReqData?.studentName || "---" },
    {
      label: "Date of Birth",
      value: transcriptReqData?.dateOfBirth
        ? formatDate(transcriptReqData.dateOfBirth)
        : "---",
    },
  ];

  const rightColumnData = [
    { label: "Department", value: transcriptReqData?.departmentName || "---" },
    { label: "Major", value: transcriptReqData?.majorName || "---" },
    {
      label: "Degree",
      value: formatDegree(transcriptReqData?.degree) || "---",
    },
  ];

  const summaryItems = [
    {
      label: "Number of Credits Studied",
      value: transcriptReqData?.numberOfCreditsStudied?.toString() || "---",
    },
    {
      label: "Number of Credits Transferred",
      value: transcriptReqData?.numberOfCreditsTransferred?.toString() || "---",
    },
    {
      label: "Total Number of Credits Earned",
      value: transcriptReqData?.totalNumberOfCreditsEarned?.toString() || "---",
    },
    {
      label: "Cumulative grade point average",
      value:
        transcriptReqData?.cumulativeGradePointAverage?.toFixed(2) || "---",
    },
  ];

  return (
    <div className="overflow-x-auto p-8 space-y-6">
      {isLoading ? (
        <Loading />
      ) : (
        <Card
          className="p-6 space-y-6 bg-gray-100 border-emerald-800 shadow-[6px_6px_0px_0px_rgba(20,83,45,1)]"
        >
          {/* Student Information Header */}
          <Card className="bg-emerald-800 border-none">
            <CardHeader className="text-white">
              <h2 className="text-xl font-bold text-center">
                Student Information
              </h2>
              <div className="pt-4">
                <hr className="border-gray-300" />
              </div>
            </CardHeader>

            <CardContent className="px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left Main Column */}
                <div className="space-y-4 md:space-y-5">
                  {leftColumnData.map((item, index) => (
                    <div
                      key={`left-${index}`}
                      className="flex justify-between items-center"
                    >
                      <p className="text-sm pr-4 text-white">{item.label}:</p>
                      <p className="text-sm text-white text-right">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Right Main Column */}
                <div className="space-y-4 md:space-y-5">
                  {rightColumnData.map((item, index) => (
                    <div
                      key={`right-${index}`}
                      className="flex justify-between items-center"
                    >
                      <p className="text-sm text-white pr-4">{item.label}:</p>
                      <p className="text-sm text-white text-right">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semester Tables */}
          {transcriptReqData?.semesters &&
          transcriptReqData.semesters.length > 0 ? (
            transcriptReqData.semesters.map((transcript, index) => (
              <Card key={index} className="border-none">
                <CardHeader className="py-3">
                  <h3 className="text-lg font-semibold text-center">
                    {formatSemester(transcript?.semester)},{" "}
                    {formatYearLevel(transcript?.yearLevel)}
                  </h3>
                </CardHeader>
                <CardContent className="px-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {RequestTranscriptTableHeader.map(
                          (header, headerIndex) => (
                            <TableHead
                              key={headerIndex}
                              className={header.className}
                            >
                              {header.label}
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transcript.courses && transcript.courses.length > 0 ? (
                        transcript.courses.map((course, courseIndex) => (
                          <TableRow key={courseIndex}>
                            <TableCell className="font-medium">
                              {course.courseCode || "---"}
                            </TableCell>
                            <TableCell>{course.courseName || "---"}</TableCell>
                            <TableCell>{course.credit || "---"}</TableCell>
                            <TableCell>{course.gradePoints || "---"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-gray-500 py-8"
                          >
                            No Record
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="px-4 pt-5 flex justify-end space-x-8 border-t">
                    <span>
                      Total{" "}
                      <span className="font-semibold ps-3">
                        Credit: {transcript.totalCredits || 0}
                      </span>
                    </span>
                    <span className="font-semibold">
                      GPA: {transcript.gpa ? transcript.gpa.toFixed(1) : "0.0"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-none">
              <CardHeader className="py-3">
                <h3 className="text-lg font-semibold text-center">
                  Semester, Year Record
                </h3>
              </CardHeader>
              <CardContent className="px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {RequestTranscriptTableHeader.map(
                        (header, headerIndex) => (
                          <TableHead
                            key={headerIndex}
                            className={header.className}
                          >
                            {header.label}
                          </TableHead>
                        )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500 py-8"
                      >
                        No Record
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="text-sm px-4 pt-5 flex justify-end space-x-8 border-t">
                  <span>
                    Total <span className="font-semibold ps-3">Credit: 0</span>
                  </span>
                  <span className="font-semibold">GPA: 0.0</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Section */}
          <Card className="border-none">
            <CardHeader className="pt-5 pb-3">
              <h3 className="text-lg font-semibold text-center">
                Total for first and second semester
              </h3>
              <div className="pt-2">
                <hr className="border-gray-300" />
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-3">
                {summaryItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex text-sm justify-between items-center"
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
}
