"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Download, ArrowLeft, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ROUTE } from "@/constants/routes";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { axiosClientWithAuth } from "@/utils/axios";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  exportGroupScoreToExcel,
  GroupScoreSubject,
  GroupScoreStudent,
} from "@/utils/generate-file/score/excel-group-score";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { getAllSubmittedScoreService } from "@/service/score/score.service";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";

interface SessionDetail {
  id: number;
  scheduleId: number;
  courseName: string;
  studentScores: {
    id: number;
    studentIdentityNumber: string;
    studentNameKhmer: string;
    gender: string;
    totalScore: number;
    grade: string;
  }[];
  semester: {
    semester: string;
    academyYear: number;
  };
}

interface DetailCache {
  subjects: GroupScoreSubject[];
  students: GroupScoreStudent[];
  classInfo: {
    classCode: string;
    majorName: string;
    departmentName: string;
    yearLevel: string;
  };
}

// Module-level cache — survives component unmount/remount (back navigation)
const detailCache = new Map<string, DetailCache>();

function semesterLabel(s: string): string {
  if (s === "SEMESTER_1") return "1st Semester";
  if (s === "SEMESTER_2") return "2nd Semester";
  return s;
}

function yearLevelDisplay(yearLevel: string): string {
  const map: Record<string, string> = {
    FIRST_YEAR: "Year 1", SECOND_YEAR: "Year 2",
    THIRD_YEAR: "Year 3", FOURTH_YEAR: "Year 4",
  };
  return map[yearLevel] ?? yearLevel;
}

function genderDisplay(g: string): string {
  const up = g?.toUpperCase();
  if (up === "MALE" || up === "M") return "ប្រុស";
  if (up === "FEMALE" || up === "F") return "ស្រី";
  return g;
}

export default function GroupScoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const classId = Number(params.classId);
  const semester = searchParams.get("semester") ?? "";
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const cacheKey = `${classId}-${semester}-${year}`;

  const [isLoading, setIsLoading] = useState(!detailCache.has(cacheKey));
  const [isExporting, setIsExporting] = useState(false);
  const [subjects, setSubjects] = useState<GroupScoreSubject[]>(
    detailCache.get(cacheKey)?.subjects ?? []
  );
  const [students, setStudents] = useState<GroupScoreStudent[]>(
    detailCache.get(cacheKey)?.students ?? []
  );
  const [classInfo, setClassInfo] = useState<DetailCache["classInfo"] | null>(
    detailCache.get(cacheKey)?.classInfo ?? null
  );

  const loadData = useCallback(async () => {
    if (!classId || !semester) return;
    if (detailCache.has(cacheKey)) return;

    setIsLoading(true);
    try {
      const result = await getAllSubmittedScoreService({
        classId,
        semester,
        academyYear: year,
        pageNo: 1,
        pageSize: 100,
      });

      const sessionList: SubmissionScoreModel[] = result?.content ?? [];

      if (sessionList.length === 0) {
        setIsLoading(false);
        return;
      }

      const [detailResults, scheduleResults] = await Promise.all([
        Promise.allSettled(
          sessionList.map((s) =>
            axiosClientWithAuth
              .get<{ data: SessionDetail }>(`/v1/score/session/${s.id}`)
              .then((r) => r.data.data)
          )
        ),
        Promise.allSettled(
          sessionList.map((s) =>
            axiosClientWithAuth
              .get<{ data: ScheduleModel }>(`/v1/schedules/${s.scheduleId}`)
              .then((r) => r.data.data)
          )
        ),
      ]);

      // Build subjects list and schedule map
      const subjectList: GroupScoreSubject[] = [];
      const scheduleMap = new Map<number, ScheduleModel>();
      scheduleResults.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          const sch = r.value;
          if (!sch.course) return;
          scheduleMap.set(sessionList[i].scheduleId, sch);
          subjectList.push({
            courseCode: sch.course.code ?? "",
            courseNameKH: sch.course.nameKH || sch.course.nameEn || sch.course.code,
            credit: sch.course.credit ?? 0,
          });
        }
      });

      // Extract class info from first available schedule
      const firstSchedule = scheduleMap.values().next().value as ScheduleModel | undefined;
      const info =
        firstSchedule?.classes
          ? {
              classCode: firstSchedule.classes.code ?? "",
              majorName: firstSchedule.classes.major?.name ?? "",
              departmentName: firstSchedule.classes.major?.department?.name ?? "",
              yearLevel: firstSchedule.classes.yearLevel ?? "",
            }
          : null;

      // Aggregate student scores across sessions
      const studentMap = new Map<string, GroupScoreStudent>();

      detailResults.forEach((r, i) => {
        if (r.status !== "fulfilled" || !r.value) return;
        const detail = r.value;
        const schedule = scheduleMap.get(sessionList[i].scheduleId);
        if (!schedule) return;
        const courseCode = schedule.course.code;

        detail.studentScores?.forEach((ss) => {
          const sid = ss.studentIdentityNumber;
          if (!studentMap.has(sid)) {
            studentMap.set(sid, {
              studentIdentityNumber: sid,
              nameKhmer: ss.studentNameKhmer ?? "",
              gender: ss.gender ?? "",
              scores: {},
            });
          }
          studentMap.get(sid)!.scores[courseCode] = {
            score: ss.totalScore,
            grade: ss.grade,
          };
        });
      });

      const studentList = Array.from(studentMap.values()).sort((a, b) =>
        a.studentIdentityNumber.localeCompare(b.studentIdentityNumber)
      );

      if (info) {
        const cached: DetailCache = { subjects: subjectList, students: studentList, classInfo: info };
        detailCache.set(cacheKey, cached);
        setClassInfo(info);
      }
      setSubjects(subjectList);
      setStudents(studentList);
    } catch (err) {
      console.error("[GroupScoreDetail] loadData error:", err);
      toast.error("Failed to load group score data.");
    } finally {
      setIsLoading(false);
    }
  }, [classId, semester, year, cacheKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const scrollTable = (dir: "left" | "right") =>
    tableScrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });

  const handleExport = async () => {
    if (!classInfo || subjects.length === 0) return;
    setIsExporting(true);
    try {
      await exportGroupScoreToExcel({
        instituteName: undefined,
        departmentName: classInfo.departmentName,
        majorName: classInfo.majorName,
        yearLevel: classInfo.yearLevel,
        semester,
        academicYear: year,
        classCode: classInfo.classCode,
        subjects,
        students,
      });
      toast.success("Excel exported successfully.");
    } catch {
      toast.error("Failed to export Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const totalCredits = subjects.reduce((sum, s) => sum + s.credit, 0);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card className="border border-border/60 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-teal-900 via-teal-700 to-teal-500" />
        <CardContent className="p-6 space-y-4">
          <PageBreadcrumb
            items={[
              { label: "Group Score Export", href: ROUTE.SCORES.GROUP },
              { label: classInfo?.classCode ?? "Detail" },
            ]}
          />

          <div className="flex items-start gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">
                  {classInfo?.classCode ?? `Class ${classId}`}
                </h1>
                <Badge variant="outline" className="text-xs">
                  {semesterLabel(semester)}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {year} – {year + 1}
                </Badge>
              </div>
              {classInfo && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {classInfo.majorName} · {yearLevelDisplay(classInfo.yearLevel)} · {classInfo.departmentName}
                </p>
              )}
            </div>

            <Button
              className="gap-2 bg-green-700 hover:bg-green-800 text-white shrink-0"
              disabled={isExporting || isLoading || students.length === 0}
              onClick={handleExport}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          </div>

          {!isLoading && classInfo && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Subjects: </span>
                  <span className="font-semibold">{subjects.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Credits: </span>
                  <span className="font-semibold">{totalCredits}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Students: </span>
                  <span className="font-semibold">{students.length}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Score preview table */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-full self-stretch w-1 rounded-full bg-teal-900 shrink-0" />
            <CardTitle className="text-base font-semibold">Score Preview</CardTitle>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {/* Scroll arrows */}
          <div className="sticky -top-2 sm:-top-4 z-10 flex items-center justify-between px-2 py-1.5 border-b border-border/50 bg-card">
            <button
              type="button"
              onClick={() => scrollTable("left")}
              aria-label="Scroll table left"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              type="button"
              onClick={() => scrollTable("right")}
              aria-label="Scroll table right"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div ref={tableScrollRef} className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileSpreadsheet}
                message="No Score Data"
                description="No approved student scores found for this class and semester."
              />
            </div>
          ) : (
            <table className="w-full min-w-max text-sm">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 text-center text-xs sticky left-0 bg-muted/50">ល.រ</TableHead>
                  <TableHead className="text-xs min-w-28">អត្តលេខ</TableHead>
                  <TableHead className="text-xs min-w-36">គោត្តនាមនិងនាម</TableHead>
                  <TableHead className="text-xs w-12 text-center">ភេទ</TableHead>
                  {subjects.map((s) => (
                    <TableHead key={s.courseCode} className="text-xs text-center min-w-24" colSpan={2}>
                      <div className="font-semibold">{s.courseNameKH || s.courseCode}</div>
                      <div className="font-normal">{s.courseCode} ({s.credit}cr)</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-xs text-center min-w-20">ពិន្ទុសរុប</TableHead>
                  <TableHead className="text-xs text-center min-w-16">GPA</TableHead>
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableHead />
                  <TableHead />
                  <TableHead />
                  <TableHead />
                  {subjects.map((s) => (
                    <React.Fragment key={s.courseCode}>
                      <TableHead className="text-xs text-center text-muted-foreground py-1">ពិន្ទុ</TableHead>
                      <TableHead className="text-xs text-center text-muted-foreground py-1">អក្សរ</TableHead>
                    </React.Fragment>
                  ))}
                  <TableHead />
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, idx) => {
                  let totalPts = 0;
                  subjects.forEach((s) => {
                    totalPts += (student.scores[s.courseCode]?.score ?? 0) * s.credit;
                  });
                  const gpa = totalCredits > 0 ? totalPts / totalCredits : 0;

                  return (
                    <TableRow key={student.studentIdentityNumber} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <TableCell className="text-center text-sm text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-sm font-mono">{student.studentIdentityNumber}</TableCell>
                      <TableCell className="text-sm">{student.nameKhmer}</TableCell>
                      <TableCell className="text-center text-sm">{genderDisplay(student.gender)}</TableCell>
                      {subjects.map((s) => {
                        const entry = student.scores[s.courseCode];
                        const score = entry?.score ?? 0;
                        const grade = entry?.grade ?? "I";
                        return (
                          <React.Fragment key={s.courseCode}>
                            <TableCell className="text-center text-sm">
                              {score}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              <Badge
                                variant="outline"
                                className={
                                  grade === "A"
                                    ? "border-green-400 text-green-700 bg-green-50 text-xs"
                                    : grade === "F" || grade === "I"
                                    ? "border-red-400 text-red-700 bg-red-50 text-xs"
                                    : "text-xs"
                                }
                              >
                                {grade}
                              </Badge>
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell className="text-center text-sm font-semibold">
                        {(Math.round(totalPts * 100) / 100)}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">
                        {(Math.round(gpa * 100) / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </table>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Subjects info cards */}
      {!isLoading && subjects.length > 0 && (
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 self-stretch rounded-full bg-teal-900" />
              <CardTitle className="text-base font-semibold">Subjects ({subjects.length})</CardTitle>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((s) => (
                <div key={s.courseCode} className="rounded-lg border border-border/60 p-3 space-y-1 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{s.courseCode}</span>
                    <Badge className="text-xs bg-teal-700 hover:bg-teal-800 text-white">
                      {s.credit} credit{s.credit !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug">{s.courseNameKH}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
