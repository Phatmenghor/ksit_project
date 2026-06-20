import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, BorderStyle,
  HeightRule, ShadingType, VerticalAlign, UnderlineType,
} from "docx";
import { saveAs } from "file-saver";
import { TranscriptModel, Semester } from "@/model/request/request-transcript";

// ── Column widths (DXA/twips) — exact match to template ──────────────────────
// 10 cols: [Code][Subj-a][Subj-b][Cr][Gr] × 2 sides
const CW = [988, 2551, 989, 427, 575, 992, 2198, 1203, 425, 572] as const;

const FONT   = "Times New Roman";
const GRAY   = "D9D9D9";  // column header background
const MONTHS = ["January","February","March","April","May","June","July",
                "August","September","October","November","December"];

const YEAR_ORDER  = ["FIRST_YEAR","SECOND_YEAR","THIRD_YEAR","FOURTH_YEAR"];
const YEAR_LABELS: Record<string,string> = {
  FIRST_YEAR:  "First Year",
  SECOND_YEAR: "Second Year",
  THIRD_YEAR:  "Three Year",   // template uses "Three Year" (not "Third")
  FOURTH_YEAR: "Four Year",    // template uses "Four Year"  (not "Fourth")
};
const SEM_LABELS: Record<string,string> = {
  SEMESTER_1: "1st Semester",
  SEMESTER_2: "2nd Semester",
};

// ── Borders ───────────────────────────────────────────────────────────────────
const THIN = { style: BorderStyle.SINGLE, size: 4, color: "auto" };
const NIL  = { style: BorderStyle.NIL,    size: 0, color: "auto" };
const BORDERS_ALL  = { top: THIN, bottom: THIN, left: THIN, right: THIN };
const BORDERS_NONE = { top: NIL,  bottom: NIL,  left: NIL,  right: NIL  };

// ── Primitives ────────────────────────────────────────────────────────────────
function trun(text: string, opts?: { bold?: boolean; ul?: boolean; size?: number }): TextRun {
  return new TextRun({
    text, font: FONT,
    bold: opts?.bold,
    underline: opts?.ul ? { type: UnderlineType.SINGLE } : undefined,
    size: opts?.size ?? 20,   // 10pt = 20 half-points
  });
}

function para(
  text: string,
  opts?: { bold?: boolean; ul?: boolean; size?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType] }
): Paragraph {
  return new Paragraph({
    children: [trun(text, opts)],
    alignment: opts?.align,
    spacing: { before: 0, after: 0 },
  });
}

// Table cell with calculated DXA width from column index + span
function tc(
  colStart: number,
  colSpan: number,
  children: Paragraph[],
  opts?: {
    fill?: string;
    borders?: typeof BORDERS_ALL;
    vAlign?: (typeof VerticalAlign)[keyof typeof VerticalAlign];
  }
): TableCell {
  const width = (CW as readonly number[]).slice(colStart, colStart + colSpan).reduce((a, b) => a + b, 0);
  return new TableCell({
    children,
    width: { size: width, type: WidthType.DXA },
    columnSpan: colSpan > 1 ? colSpan : undefined,
    shading: opts?.fill
      ? { fill: opts.fill, type: ShadingType.SOLID, color: opts.fill }
      : undefined,
    borders: opts?.borders ?? BORDERS_ALL,
    verticalAlign: opts?.vAlign ?? VerticalAlign.CENTER,
    margins: { top: 0, bottom: 0, left: 80, right: 80 },
  });
}

// ── Row builders ──────────────────────────────────────────────────────────────

function colHdrRow(): TableRow {
  const h = (text: string, col: number, span: number) =>
    tc(col, span, [para(text, { bold: true, align: AlignmentType.CENTER })], { fill: GRAY });
  return new TableRow({
    children: [
      h("Code", 0, 1), h("Subject", 1, 1), h("Credits/Grade", 2, 3),
      h("Code", 5, 1), h("Subject", 6, 1), h("Credits/Grade", 7, 3),
    ],
    height: { value: 422, rule: HeightRule.ATLEAST },
  });
}

function semHdrRow(leftLabel: string, rightLabel: string): TableRow {
  return new TableRow({
    children: [
      tc(0, 5, [para(leftLabel,  { bold: true, ul: true })], { vAlign: VerticalAlign.BOTTOM }),
      tc(5, 5, [para(rightLabel, { bold: true, ul: true })], { vAlign: VerticalAlign.BOTTOM }),
    ],
    height: { value: 397, rule: HeightRule.ATLEAST },
  });
}

interface C { code: string; name: string; cr: string; grade: string }

function courseRow(l?: C, r?: C): TableRow {
  return new TableRow({
    children: [
      tc(0, 1, [para(l?.code  ?? "", { align: AlignmentType.CENTER })]),
      tc(1, 2, [para(l?.name  ?? "")]),
      tc(3, 1, [para(l?.cr    ?? "", { align: AlignmentType.CENTER })]),
      tc(4, 1, [para(l?.grade ?? "", { align: AlignmentType.CENTER })]),
      tc(5, 1, [para(r?.code  ?? "", { align: AlignmentType.CENTER })]),
      tc(6, 2, [para(r?.name  ?? "")]),
      tc(8, 1, [para(r?.cr    ?? "", { align: AlignmentType.CENTER })]),
      tc(9, 1, [para(r?.grade ?? "", { align: AlignmentType.CENTER })]),
    ],
    height: { value: 283, rule: HeightRule.ATLEAST },
  });
}

// Right side shows summary label + value instead of a course
function summaryRow(l: C | undefined, label: string, value: string): TableRow {
  return new TableRow({
    children: [
      tc(0, 1, [para(l?.code  ?? "", { align: AlignmentType.CENTER })]),
      tc(1, 2, [para(l?.name  ?? "")]),
      tc(3, 1, [para(l?.cr    ?? "", { align: AlignmentType.CENTER })]),
      tc(4, 1, [para(l?.grade ?? "", { align: AlignmentType.CENTER })]),
      tc(5, 1, [para("")]),
      tc(6, 2, [para(label)]),
      tc(8, 2, [para(value, { align: AlignmentType.CENTER })]),
    ],
    height: { value: 283, rule: HeightRule.ATLEAST },
  });
}

function gpaRow(leftGpa?: number | null, rightGpa?: number | null): TableRow {
  const gCell = (col: number, text: string) =>
    tc(col, 2, [para(text, { bold: true, ul: true, align: AlignmentType.CENTER })], { borders: BORDERS_NONE });
  return new TableRow({
    children: [
      tc(0, 1, [para("")], { borders: BORDERS_NONE }),
      gCell(1, "Grade Point Average"),
      gCell(3, leftGpa  != null ? leftGpa.toFixed(2)  : ""),
      tc(5, 1, [para("")], { borders: BORDERS_NONE }),
      gCell(6, "Grade Point Average"),
      gCell(8, rightGpa != null ? rightGpa.toFixed(2) : ""),
    ],
    height: { value: 316, rule: HeightRule.ATLEAST },
  });
}

// Final GPA row: left gets GPA, right gets "Transcript Closed"
function lastGpaRow(leftGpa?: number | null): TableRow {
  return new TableRow({
    children: [
      tc(0, 1, [para("")], { borders: BORDERS_NONE }),
      tc(1, 2, [para("Grade Point Average", { bold: true, ul: true, align: AlignmentType.CENTER })], { borders: BORDERS_NONE }),
      tc(3, 2, [para(leftGpa != null ? leftGpa.toFixed(2) : "", { bold: true, ul: true, align: AlignmentType.CENTER })], { borders: BORDERS_NONE }),
      tc(5, 5, [para("Transcript Closed", { bold: true, align: AlignmentType.CENTER })]),
    ],
    height: { value: 113, rule: HeightRule.ATLEAST },
  });
}

// ── Section builder ───────────────────────────────────────────────────────────

function semLabel(s?: Semester): string {
  if (!s) return "";
  return `${YEAR_LABELS[s.yearLevel] ?? s.yearLevel}\t${SEM_LABELS[s.semester] ?? s.semester}`;
}

function toCourses(s?: Semester): C[] {
  return (s?.courses ?? []).map(c => ({
    code:  c.courseCode   ?? "",
    name:  c.courseName   ?? "",
    cr:    String(c.credit ?? ""),
    grade: String(c.letterGrade ?? ""),
  }));
}

interface Summary {
  creditsStudied: number;
  creditsTransferred: number;
  creditsEarned: number;
  cgpa?: number | null;
}

function buildSectionRows(
  lSem: Semester | undefined,
  rSem: Semester | undefined,
  isLast: boolean,
  summary?: Summary,
): TableRow[] {
  const rows: TableRow[] = [];
  rows.push(semHdrRow(semLabel(lSem), semLabel(rSem)));

  const lC = toCourses(lSem);
  const rC = toCourses(rSem);

  if (!isLast) {
    const maxC = Math.max(lC.length, rC.length);
    for (let i = 0; i < maxC; i++) rows.push(courseRow(lC[i], rC[i]));
    rows.push(gpaRow(lSem?.gpa, rSem?.gpa));
    return rows;
  }

  // Last section: inject summary stats in the right column
  const summaryItems: [string, string][] = summary ? [
    ["Number of Credits Studied",      String(summary.creditsStudied ?? 0)],
    ["Number of Credits Transferred",  String(summary.creditsTransferred ?? 0)],
    ["Total Number of Credits Earned", String(summary.creditsEarned ?? 0)],
    ["Cumulative Grade Point Average",
      typeof summary.cgpa === "number" ? summary.cgpa.toFixed(2) : "---"],
  ] : [];

  // Summary starts after right courses with minimum gap of 3 rows
  const sumStart    = Math.max(rC.length, 3);
  const rightTotal  = sumStart + summaryItems.length + 1;   // +1 trailing empty
  const leftTotal   = lC.length + 1;                        // +1 trailing empty
  const totalRows   = Math.max(leftTotal, rightTotal);

  for (let i = 0; i < totalRows; i++) {
    const sumIdx = i - sumStart;
    if (sumIdx >= 0 && sumIdx < summaryItems.length) {
      rows.push(summaryRow(lC[i], summaryItems[sumIdx][0], summaryItems[sumIdx][1]));
    } else {
      rows.push(courseRow(lC[i], rC[i]));
    }
  }
  rows.push(lastGpaRow(lSem?.gpa));
  return rows;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  } catch { return d; }
}

function fmtDegree(deg?: string): string {
  const m: Record<string, string> = {
    ASSOCIATE: "Associate in Computer Technology",
    BACHELOR:  "Bachelor in Computer Technology",
    MASTER:    "Master's Degree",
    DOCTOR:    "Doctor's Degree",
  };
  return deg ? (m[deg] ?? deg) : "";
}

function sortSems(sems: Semester[]): Semester[] {
  const yO: Record<string, number> = { FIRST_YEAR:0, SECOND_YEAR:1, THIRD_YEAR:2, FOURTH_YEAR:3 };
  const sO: Record<string, number> = { SEMESTER_1:0, SEMESTER_2:1 };
  return [...sems].sort((a, b) => {
    const d = (yO[a.yearLevel] ?? 9) - (yO[b.yearLevel] ?? 9);
    return d !== 0 ? d : (sO[a.semester] ?? 0) - (sO[b.semester] ?? 0);
  });
}

function buildYearPairs(sems: Semester[]): [string, Semester[]][][] {
  const sorted = sortSems(sems);
  const groups: Record<string, Semester[]> = {};
  for (const s of sorted) (groups[s.yearLevel] ||= []).push(s);
  const years = YEAR_ORDER.filter(y => groups[y]?.length);
  const pairs: [string, Semester[]][][] = [];
  for (let i = 0; i < years.length; i += 2) {
    const row: [string, Semester[]][] = [[years[i], groups[years[i]]]];
    if (years[i + 1]) row.push([years[i + 1], groups[years[i + 1]]]);
    pairs.push(row);
  }
  return pairs;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function exportTranscriptToWord(
  data: TranscriptModel,
  extra: {
    nationality?: string;
    placeOfBirth?: string;
    dateOfAdmission?: string;
    dateOfGraduation?: string;
  } = {},
  filename?: string
): Promise<void> {
  const yearPairs = buildYearPairs(data.semesters ?? []);

  // Student info as tab-separated paragraphs (matches template exactly)
  type InfoLine = [string, string, string, string];
  const infoLines: InfoLine[] = [
    ["Name",           data.studentName  ?? "",     "Department",         data.departmentName ?? ""],
    ["Student ID",     data.studentCode  ?? "",     "Degree",             fmtDegree(data.degree)],
    ["Nationality",    extra.nationality ?? "",     "Major Subject",      data.majorName ?? ""],
    ["Date of Birth",  fmtDate(data.dateOfBirth),   "Date of Admission",  fmtDate(extra.dateOfAdmission)],
    ["Place of Birth", extra.placeOfBirth ?? "",    "Date of Graduation", fmtDate(extra.dateOfGraduation)],
  ];

  const infoParagraphs = infoLines.map(([ll, lv, rl, rv]) =>
    new Paragraph({
      children: [
        trun(ll), trun("\t:\t"), trun(lv),
        trun("\t"), trun(rl), trun("\t:\t"), trun(rv),
      ],
      spacing: { before: 0, after: 0 },
    })
  );

  // Course table
  const tableRows: TableRow[] = [colHdrRow()];

  for (let pi = 0; pi < yearPairs.length; pi++) {
    const pair        = yearPairs[pi];
    const isLastPair  = pi === yearPairs.length - 1;
    const leftSems    = pair[0][1];
    const rightSems   = pair[1]?.[1] ?? [];
    const maxSems     = Math.max(leftSems.length, rightSems.length);

    for (let si = 0; si < maxSems; si++) {
      const lSem    = leftSems[si];
      const rSem    = rightSems[si];
      const isLast  = isLastPair && si === maxSems - 1;

      tableRows.push(...buildSectionRows(
        lSem, rSem, isLast,
        isLast ? {
          creditsStudied:     data.numberOfCreditsStudied      ?? 0,
          creditsTransferred: data.numberOfCreditsTransferred  ?? 0,
          creditsEarned:      data.totalNumberOfCreditsEarned  ?? 0,
          cgpa:               data.cumulativeGradePointAverage,
        } : undefined,
      ));
    }
  }

  // Empty state fallback
  if (tableRows.length === 1) {
    tableRows.push(new TableRow({
      children: [tc(0, 10, [para("No semester records found.", { align: AlignmentType.CENTER })])],
    }));
  }

  const courseTable = new Table({
    width: { size: 10920, type: WidthType.DXA },
    borders: BORDERS_ALL,
    rows: tableRows,
  });

  // Document — A4 with letterhead top margin (matches template)
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size:   { width: 11906, height: 16838 },  // A4 in twips
          margin: { top: 3287, bottom: 1417, left: 1020, right: 1247 },
        },
      },
      children: [
        new Paragraph({
          children: [trun("OFFICIAL TRANSCRIPT", { bold: true, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
        }),
        ...infoParagraphs,
        new Paragraph({ children: [], spacing: { before: 0, after: 80 } }),
        courseTable,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fname = filename
    ?? `${data.studentCode ?? "transcript"}_transcript_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fname);
}
