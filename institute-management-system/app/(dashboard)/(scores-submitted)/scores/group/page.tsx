"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileSpreadsheet, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { ROUTE } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { getAllSubmittedScoreService } from "@/service/score/score.service";
import { SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { SemesterFilter } from "@/constants/constant";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Module-level persistence — survives unmount/remount (back navigation)
const listingCache = new Map<string, SubmissionScoreModel[]>();
let savedScrollY = 0;
let savedYear = 0;
let savedSemester = "ALL";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => CURRENT_YEAR - i);

interface ScoreGroup {
  classId: number;
  classCode: string;
  semester: string;
  academicYear: number;
  sessions: SubmissionScoreModel[];
  totalStudents: number;
}

function semesterLabel(s: string): string {
  if (s === "SEMESTER_1") return "1st Semester";
  if (s === "SEMESTER_2") return "2nd Semester";
  return s;
}

export default function GroupScoreListPage() {
  const router = useRouter();

  // Initialize from module-level saved state so back-nav restores instantly
  const [academicYear, setAcademicYear] = useState(savedYear);
  const [semester, setSemester] = useState(savedSemester);
  const [sessions, setSessions] = useState<SubmissionScoreModel[]>(
    () => listingCache.get(`${savedYear}-${savedSemester}`) ?? []
  );
  const [isLoading, setIsLoading] = useState(
    !listingCache.has(`${savedYear}-${savedSemester}`)
  );

  // Restore scroll position after render
  useEffect(() => {
    if (savedScrollY > 0) {
      requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
    }
    return () => {
      savedScrollY = window.scrollY;
    };
  }, []);

  const fetchSessions = useCallback(async (year: number, sem: string) => {
    const cacheKey = `${year}-${sem}`;
    if (listingCache.has(cacheKey)) {
      setSessions(listingCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await getAllSubmittedScoreService({
        academyYear: year || undefined,
        semester: sem === "ALL" ? undefined : sem,
        pageNo: 1,
        pageSize: 500,
      });
      const data = result?.content ?? [];
      listingCache.set(cacheKey, data);
      setSessions(data);
    } catch {
      toast.error("Failed to load score sessions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions(academicYear, semester);
  }, [fetchSessions, academicYear, semester]);

  const handleYearChange = (year: number) => {
    savedYear = year;
    setAcademicYear(year);
  };

  const handleSemesterChange = (sem: string) => {
    savedSemester = sem;
    setSemester(sem);
  };

  // Group sessions by classId + semester + year (year comes from the session itself)
  const groups: ScoreGroup[] = (() => {
    const map = new Map<string, ScoreGroup>();
    sessions.forEach((s) => {
      const year = s.academyYear ?? 0;
      const key = `${s.classId}-${s.semester}-${year}`;
      if (!map.has(key)) {
        map.set(key, {
          classId: s.classId,
          classCode: s.classCode,
          semester: s.semester,
          academicYear: year,
          sessions: [],
          totalStudents: 0,
        });
      }
      const group = map.get(key)!;
      group.sessions.push(s);
      group.totalStudents = Math.max(group.totalStudents, s.studentCount ?? 0);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.classCode.localeCompare(b.classCode)
    );
  })();

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const scrollTable = (dir: "left" | "right") =>
    tableScrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });

  const handleView = (group: ScoreGroup) => {
    savedScrollY = window.scrollY;
    const url = `${ROUTE.SCORES.GROUP_DETAIL(String(group.classId))}?semester=${group.semester}&year=${group.academicYear}`;
    router.push(url);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Group Score Export" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Group Score Export",
          totalCount: groups.length,
          searchValue: "",
          searchPlaceholder: "Search...",
          onSearchChange: () => {},
          filters: [
            {
              id: "year",
              type: "custom",
              label: "Academic Year",
              value: academicYear,
              onChange: (v: unknown) => handleYearChange(Number(v) || 0),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Academic Year</label>
                  <Select
                    value={String(value || 0)}
                    onValueChange={(v) => onChange(Number(v))}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Years</SelectItem>
                      {YEAR_OPTIONS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              placeholder: "All Semesters",
              value: semester,
              onChange: (v) => handleSemesterChange(v ? String(v) : "ALL"),
              options: SemesterFilter.map((s) => ({ label: s.label, value: s.value })),
            },
          ],
        }}
      />

      <div className="rounded-md border border-border bg-card">
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
          ) : groups.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileSpreadsheet}
                message="No Approved Scores Found"
                description="No approved score sessions match the selected filters."
              />
            </div>
          ) : (
            <table className="w-full min-w-max text-sm">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Class Code</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead className="text-center">Subjects</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group, idx) => (
                  <TableRow
                    key={`${group.classId}-${group.semester}`}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="text-center text-muted-foreground text-sm">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">
                        {group.classCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {semesterLabel(group.semester)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {group.academicYear > 0 ? group.academicYear : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-teal-700 hover:bg-teal-800 text-white text-xs">
                        {group.sessions.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {group.totalStudents}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={() => handleView(group)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => handleView(group)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Excel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
