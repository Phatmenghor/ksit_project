"use client";

import { TranscriptModel, Semester } from "@/model/request/request-transcript";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { formatDegree } from "@/constants/format-enum/format-degree";

interface TranscriptLayoutProps {
  data: TranscriptModel | null;
}

const GRADE_DATA = [
  { grade: "A",  points: "4.00", pct: "85-100", mention: "Excellent" },
  { grade: "B+", points: "3.50", pct: "80-84",  mention: "Very Good" },
  { grade: "B",  points: "3.00", pct: "70-79",  mention: "Good" },
  { grade: "C+", points: "2.50", pct: "65-69",  mention: "Fairly Good" },
  { grade: "C",  points: "2.00", pct: "60-64",  mention: "Fair" },
  { grade: "D",  points: "1.50", pct: "50-59",  mention: "Poor" },
  { grade: "E",  points: "1.00", pct: "40-49",  mention: "Very Poor" },
  { grade: "F",  points: "0.00", pct: "<40",    mention: "Fail" },
];

const YEAR_ORDER = ["FIRST_YEAR", "SECOND_YEAR", "THIRD_YEAR", "FOURTH_YEAR"];
const YEAR_LABELS: Record<string, string> = {
  FIRST_YEAR: "First Year",   SECOND_YEAR: "Second Year",
  THIRD_YEAR: "Third Year",   FOURTH_YEAR: "Fourth Year",
};
const SEM_LABELS: Record<string, string> = {
  SEMESTER_1: "1st Semester", SEMESTER_2: "2nd Semester",
};

function sortSems(sems: Semester[]): Semester[] {
  const yO: Record<string, number> = { FIRST_YEAR: 0, SECOND_YEAR: 1, THIRD_YEAR: 2, FOURTH_YEAR: 3 };
  const sO: Record<string, number> = { SEMESTER_1: 0, SEMESTER_2: 1 };
  return [...sems].sort((a, b) => {
    const d = (yO[a.yearLevel] ?? 9) - (yO[b.yearLevel] ?? 9);
    return d !== 0 ? d : (sO[a.semester] ?? 0) - (sO[b.semester] ?? 0);
  });
}

// Group sorted semesters by year, return pairs: [(Y1, sems), (Y2, sems)] per row
function buildYearPairs(sems: Semester[]): [string, Semester[]][][] {
  const sorted = sortSems(sems);
  const groups: Record<string, Semester[]> = {};
  for (const s of sorted) {
    (groups[s.yearLevel] ||= []).push(s);
  }
  const years = YEAR_ORDER.filter(y => groups[y]?.length);
  const pairs: [string, Semester[]][][] = [];
  for (let i = 0; i < years.length; i += 2) {
    const row: [string, Semester[]][] = [[years[i], groups[years[i]]]];
    if (years[i + 1]) row.push([years[i + 1], groups[years[i + 1]]]);
    pairs.push(row);
  }
  return pairs;
}

// One year's column (contains all semesters for that year, stacked)
function YearColumn({ semesters }: { semesters: Semester[] }) {
  return (
    <div className="flex-1 min-w-0">
      {semesters.map((sem, si) => (
        <div key={si}>
          {/* Semester label row — light blue background matching template */}
          <div className="flex items-center px-2 py-[3px] bg-[#C5D9F1] border-b border-[#8EA9C1]">
            <span className="text-[10px] font-bold text-[#1F497D]">
              {YEAR_LABELS[sem.yearLevel]} &nbsp;{SEM_LABELS[sem.semester] ?? sem.semester}
            </span>
          </div>

          {/* Course rows */}
          {sem.courses?.length ? (
            sem.courses.map((course, i) => (
              <div key={i} className="flex gap-0 px-2 py-[2px] text-[10px] border-b border-gray-200 bg-white">
                <span className="w-[52px] shrink-0 text-[#1F497D]">{course.courseCode || "---"}</span>
                <span className="flex-1 truncate text-gray-800">{course.courseName || "---"}</span>
                <span className="w-6 shrink-0 text-center text-gray-700">{course.credit ?? "---"}</span>
                <span className="w-7 shrink-0 text-center font-bold text-gray-800">{course.letterGrade || "---"}</span>
              </div>
            ))
          ) : (
            <div className="px-2 py-3 text-[10px] text-gray-400 text-center bg-white">No courses</div>
          )}

          {/* GPA row — light gray matching template */}
          <div className="flex justify-between items-center px-2 py-[3px] bg-[#F2F2F2] border-b border-gray-300">
            <span className="text-[10px] font-bold text-gray-700">Grade Point Average</span>
            {typeof sem.gpa === "number" && (
              <span className="text-[10px] font-bold text-gray-800">{sem.gpa.toFixed(2)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TranscriptLayout({ data }: TranscriptLayoutProps) {
  const yearPairs = data?.semesters?.length ? buildYearPairs(data.semesters) : [];

  const summaryItems = [
    { label: "Number of Credits Studied",      value: String(data?.numberOfCreditsStudied ?? "---") },
    { label: "Number of Credits Transferred",  value: String(data?.numberOfCreditsTransferred ?? "---") },
    { label: "Total Number of Credits Earned", value: String(data?.totalNumberOfCreditsEarned ?? "---") },
    { label: "Cumulative Grade Point Average", value: typeof data?.cumulativeGradePointAverage === "number"
        ? data.cumulativeGradePointAverage.toFixed(2) : "---" },
  ];

  return (
    <div className="border border-gray-400 bg-white" style={{ fontFamily: "Arial, sans-serif" }}>

      {/* ── Header — no background, no colored line, just centered bold title ── */}
      <div className="text-center py-4 px-4 border-b border-gray-400">
        <h1 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
          Official Academic Transcript
        </h1>
      </div>

      {/* ── Student Info — two columns, no backgrounds ────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-gray-400 border-b border-gray-400">
        <div className="divide-y divide-gray-200">
          {([
            ["Name",          data?.studentName || "---"],
            ["Student ID",    data?.studentCode || "---"],
            ["Nationality",   data?.nationality || "---"],
            ["Date of Birth", data?.dateOfBirth ? formatDate(data.dateOfBirth) : "---"],
            ["Place of Birth",data?.placeOfBirth || "---"],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex items-center px-3 py-[3px] text-[10px]">
              <span className="w-24 shrink-0 text-[#4472C4]">{label}</span>
              <span className="text-gray-800">: {value}</span>
            </div>
          ))}
        </div>
        <div className="divide-y divide-gray-200">
          {([
            ["Department",        data?.departmentName || "---"],
            ["Degree",            data?.degree ? formatDegree(data.degree) : "---"],
            ["Major",             data?.majorName || "---"],
            ["Date of Admission", data?.dateOfAdmission || "---"],
            ["Date of Graduation",data?.dateOfGraduation || "---"],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex items-center px-3 py-[3px] text-[10px]">
              <span className="w-28 shrink-0 text-[#4472C4]">{label}</span>
              <span className="text-gray-800">: {value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Column Header — no background, plain bold text ───────────────── */}
      <div className="grid grid-cols-2 divide-x divide-gray-400 border-b border-gray-400 bg-white">
        {[0, 1].map(i => (
          <div key={i} className="flex gap-0 px-2 py-[3px]">
            <span className="w-[52px] shrink-0 text-[10px] font-bold text-gray-800">Code</span>
            <span className="flex-1 text-[10px] font-bold text-gray-800">Subject</span>
            <span className="w-6 shrink-0 text-center text-[10px] font-bold text-gray-800">Cr.</span>
            <span className="w-7 shrink-0 text-center text-[10px] font-bold text-gray-800">Grade</span>
          </div>
        ))}
      </div>

      {/* ── Year Pairs — Left = Year N, Right = Year N+1 ─────────────────── */}
      {yearPairs.length > 0 ? (
        yearPairs.map((pair, idx) => (
          <div key={idx} className="flex border-b border-gray-400 last:border-b-0 divide-x divide-gray-400">
            {pair.map(([year, sems]) => (
              <YearColumn key={year} semesters={sems} />
            ))}
            {pair.length === 1 && <div className="flex-1 min-w-0 bg-white" />}
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-gray-400 text-xs border-b border-gray-400 bg-white">
          No semester records found.
        </div>
      )}

      {/* ── Grade Legend + Summary ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-gray-400">

        {/* Grade Legend */}
        <div>
          {/* Legend header — dark blue matching template */}
          <div className="flex px-2 py-[3px] bg-[#1F497D]">
            <span className="w-10 shrink-0 text-[10px] font-bold text-white">Grade</span>
            <span className="w-12 shrink-0 text-[10px] font-bold text-white">Points</span>
            <span className="w-14 shrink-0 text-[10px] font-bold text-white">%</span>
            <span className="flex-1 text-[10px] font-bold text-white">Mention</span>
          </div>
          {GRADE_DATA.map(({ grade, points, pct, mention }) => (
            <div key={grade} className="flex px-2 py-[2px] text-[10px] border-b border-gray-200 bg-white">
              <span className="w-10 shrink-0 font-medium text-[#1F497D]">{grade}</span>
              <span className="w-12 shrink-0 text-gray-700">{points}</span>
              <span className="w-14 shrink-0 text-gray-700">{pct}</span>
              <span className="flex-1 text-gray-700">{mention}</span>
            </div>
          ))}
          <div className="px-2 py-2 text-[10px] text-[#1F497D] space-y-0.5 bg-white border-t border-gray-200">
            <p>S = SATISFACTORY</p>
            <p>U = UNSATISFACTORY</p>
            <p>I = INCOMPLETE</p>
          </div>
        </div>

        {/* Summary + Signature */}
        <div className="flex flex-col">
          {summaryItems.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-3 py-[5px] text-[10px] border-b border-gray-200 bg-white">
              <span className="text-[#4472C4]">{label}</span>
              <span className="font-bold text-gray-800 ml-2 shrink-0">{value}</span>
            </div>
          ))}

          {/* Transcript Closed */}
          <div className="px-4 pt-3 pb-1 text-center">
            <div className="border-t border-gray-800" />
            <p className="text-[10px] font-bold text-gray-800 tracking-widest uppercase py-1">
              Transcript Closed
            </p>
            <div className="border-b border-gray-800" />
          </div>

          {/* Signature area */}
          <div className="flex-1 flex flex-col items-center justify-end pb-5 pt-4 text-[10px] text-gray-600">
            <p>Kampong Speu, ................................</p>
            <div className="mt-8 text-center">
              <p className="font-bold text-gray-800">Director</p>
              <p>HARTH Bunhe, PhD</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
