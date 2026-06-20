import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, BorderStyle,
  HeightRule, ShadingType, VerticalAlignTable, UnderlineType,
} from "docx";
import { TranscriptModel, Semester } from "@/model/request/request-transcript";

// ── Page / font constants ─────────────────────────────────────────────────────
const FONT = "Times New Roman";
const SZ   = 20;       // 10 pt  (half-points)
const SZ_T = 24;       // 12 pt  (title)

// ── Column grid (exact from template) ────────────────────────────────────────
// 10 underlying columns: L1 L2 L3 L4 L5 | R1 R2 R3 R4 R5
const L1 = 988,  L2 = 2551, L3 = 989,  L4 = 427, L5 = 575;
const R1 = 992,  R2 = 2198, R3 = 1203, R4 = 425, R5 = 572;

const W_LEFT  = L1 + L2 + L3 + L4 + L5;   // 5530
const W_RIGHT = R1 + R2 + R3 + R4 + R5;   // 5390
const W_TOTAL = W_LEFT + W_RIGHT;           // 10920

// Derived merged-cell widths
const W_SUBJ_L       = L2 + L3;            // 3540  (courses: Subject left)
const W_CR_GR_L_HDR  = L3 + L4 + L5;      // 1991  (header: Credits/Grade left)
const W_GPA_L        = L4 + L5;            // 1002  (GPA value left)
const W_SUBJ_R       = R2 + R3;            // 3401  (courses: Subject right)
const W_CR_GR_R_HDR  = R3 + R4 + R5;      // 2200  (header: Credit/Grade right)
const W_GPA_R        = R4 + R5;            //  997  (GPA value right)

// ── Row heights ───────────────────────────────────────────────────────────────
const H_COL = 422;
const H_SEM = 397;
const H_CRS = 283;
const H_GPA = 316;
const H_END = 113;

// ── Border primitives ─────────────────────────────────────────────────────────
const T = { style: BorderStyle.SINGLE, size: 4, color: "auto" } as const;
const N = { style: BorderStyle.NIL,    size: 0, color: "auto" } as const;

const BL   = { top: N, bottom: N, left: T, right: N };
const BR   = { top: N, bottom: N, left: N, right: T };
const BLR  = { top: N, bottom: N, left: T, right: T };
const BNO  = { top: N, bottom: N, left: N, right: N };
const BTL  = { top: T, bottom: N, left: T, right: N };
const BTR  = { top: T, bottom: N, left: N, right: T };
const BTO  = { top: T, bottom: N, left: N, right: N };
const BBL  = { top: N, bottom: T, left: T, right: N };
const BBR  = { top: N, bottom: T, left: N, right: T };
const BBo  = { top: N, bottom: T, left: N, right: N };
const BBLR = { top: N, bottom: T, left: T, right: T };

// ── Text helpers ──────────────────────────────────────────────────────────────
function tr(text: string, bold?: boolean, ul?: boolean, sz?: number): TextRun {
  return new TextRun({
    text, font: FONT, bold,
    size: sz ?? SZ,
    underline: ul ? { type: UnderlineType.SINGLE } : undefined,
  });
}

function p(
  text: string,
  align?: typeof AlignmentType[keyof typeof AlignmentType],
  bold?: boolean,
  ul?: boolean,
  sz?: number,
): Paragraph {
  return new Paragraph({
    children: [tr(text, bold, ul, sz)],
    alignment: align,
    spacing: { before: 0, after: 0 },
  });
}

// ── Cell helper ───────────────────────────────────────────────────────────────
type Borders = { top: typeof T | typeof N; bottom: typeof T | typeof N; left: typeof T | typeof N; right: typeof T | typeof N };

function tc(
  w: number,
  span: number,
  children: Paragraph[],
  borders: Borders,
  fill?: string,
  vAlign?: typeof VerticalAlignTable[keyof typeof VerticalAlignTable],
): TableCell {
  return new TableCell({
    children,
    width: { size: w, type: WidthType.DXA },
    columnSpan: span > 1 ? span : undefined,
    shading: fill ? { fill, type: ShadingType.SOLID, color: fill } : undefined,
    borders,
    verticalAlign: vAlign ?? VerticalAlignTable.CENTER,
    margins: { top: 0, bottom: 0, left: 80, right: 80 },
  });
}

// ── Row builders ──────────────────────────────────────────────────────────────

// Row 1 — column headers (gray shading, top borders only)
function colHeaderRow(): TableRow {
  const h = (w: number, span: number, text: string, brd: Borders, align: typeof AlignmentType[keyof typeof AlignmentType]) =>
    tc(w, span, [p(text, align, true)], brd, "D9D9D9");
  return new TableRow({
    children: [
      h(L1,           1, "Code",          BTL, AlignmentType.CENTER),
      h(L2,           1, "Subject",       BTO, AlignmentType.CENTER),
      h(W_CR_GR_L_HDR,3, "Credits/Grade", BTR, AlignmentType.RIGHT),
      h(R1,           1, "Code",          BTL, AlignmentType.CENTER),
      h(R2,           1, "Subject",       BTO, AlignmentType.CENTER),
      h(W_CR_GR_R_HDR,3, "Credit/Grade",  BTR, AlignmentType.RIGHT),
    ],
    height: { value: H_COL, rule: HeightRule.ATLEAST },
  });
}

// Semester header — bold underline, bottom-aligned, left+right outer borders
function semHeaderRow(leftLabel: string, rightLabel: string): TableRow {
  const s = (w: number, text: string) =>
    tc(w, 5, [p(text, AlignmentType.LEFT, true, true)], BLR, undefined, VerticalAlignTable.BOTTOM);
  return new TableRow({
    children: [s(W_LEFT, leftLabel), s(W_RIGHT, rightLabel)],
    height: { value: H_SEM, rule: HeightRule.ATLEAST },
  });
}

// Course entry
interface C { code: string; name: string; cr: string; grade: string }

// Normal course row (left + right course side by side)
function courseRow(l?: C, r?: C): TableRow {
  return new TableRow({
    children: [
      tc(L1,        1, [p(l?.code  ?? "")],                           BL),
      tc(W_SUBJ_L,  2, [p(l?.name  ?? "")],                           BNO),
      tc(L4,        1, [p(l?.cr    ?? "", AlignmentType.CENTER)],      BNO),
      tc(L5,        1, [p(l?.grade ?? "", AlignmentType.CENTER)],      BR),
      tc(R1,        1, [p(r?.code  ?? "")],                           BL),
      tc(W_SUBJ_R,  2, [p(r?.name  ?? "")],                           BNO),
      tc(R4,        1, [p(r?.cr    ?? "", AlignmentType.CENTER)],      BNO),
      tc(R5,        1, [p(r?.grade ?? "", AlignmentType.CENTER)],      BR),
    ],
    height: { value: H_CRS, rule: HeightRule.ATLEAST },
  });
}

// Right side shows summary label + value instead of a course
function summaryRow(l: C | undefined, label: string, value: string): TableRow {
  return new TableRow({
    children: [
      tc(L1,       1, [p(l?.code  ?? "")],                      BL),
      tc(W_SUBJ_L, 2, [p(l?.name  ?? "")],                      BNO),
      tc(L4,       1, [p(l?.cr    ?? "", AlignmentType.CENTER)], BNO),
      tc(L5,       1, [p(l?.grade ?? "", AlignmentType.CENTER)], BR),
      tc(R1,       1, [p("")],                                   BL),
      tc(W_SUBJ_R, 2, [p(label)],                                BNO),
      tc(W_GPA_R,  2, [p(value, AlignmentType.CENTER)],          BR),
    ],
    height: { value: H_CRS, rule: HeightRule.ATLEAST },
  });
}

// GPA row (not the final row)
function gpaRow(leftGpa?: number | null, rightGpa?: number | null): TableRow {
  const g = (v?: number | null) => v != null ? v.toFixed(2) : "";
  return new TableRow({
    children: [
      tc(L1,       1, [p("")],                                                            BL),
      tc(W_SUBJ_L, 2, [p("Grade Point Average", AlignmentType.CENTER, true, true)],      BNO),
      tc(W_GPA_L,  2, [p(g(leftGpa),            AlignmentType.CENTER, true, true)],      BR),
      tc(R1,       1, [p("")],                                                            BL),
      tc(W_SUBJ_R, 2, [p("Grade Point Average", AlignmentType.CENTER, true, true)],      BNO),
      tc(W_GPA_R,  2, [p(g(rightGpa),           AlignmentType.CENTER, true, true)],      BR),
    ],
    height: { value: H_GPA, rule: HeightRule.ATLEAST },
  });
}

// Final row — left GPA + "Transcript Closed" spanning the right half
function lastGpaRow(leftGpa?: number | null): TableRow {
  const gpaStr = leftGpa != null ? leftGpa.toFixed(2) : "";
  return new TableRow({
    children: [
      tc(L1,      1, [p("")],                                                          BBL),
      tc(W_SUBJ_L,2, [p("Grade Point Average", AlignmentType.CENTER, true, true)],    BBo),
      tc(W_GPA_L, 2, [p(gpaStr,               AlignmentType.CENTER, true, true)],    BBR),
      tc(W_RIGHT, 5, [p("Transcript Closed",   AlignmentType.CENTER, true, false)],   BBLR),
    ],
    height: { value: H_END, rule: HeightRule.ATLEAST },
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

function fmtDate(d?: string | null): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  } catch { return d; }
}

function fmtDegree(deg?: string): string {
  const m: Record<string,string> = {
    ASSOCIATE: "Associate in Computer Technology",
    BACHELOR:  "Bachelor in Computer Technology",
    MASTER:    "Master's Degree",
    DOCTOR:    "Doctor's Degree",
  };
  return deg ? (m[deg] ?? deg) : "";
}

const YEAR_ORDER  = ["FIRST_YEAR","SECOND_YEAR","THIRD_YEAR","FOURTH_YEAR"];
const YEAR_LABELS: Record<string,string> = {
  FIRST_YEAR:  "First Year",
  SECOND_YEAR: "Second Year",
  THIRD_YEAR:  "Three Year",
  FOURTH_YEAR: "Four Year",
};
const SEM_LABELS: Record<string,string> = {
  SEMESTER_1: "1st Semester",
  SEMESTER_2: "2nd Semester",
};

function semLabel(s?: Semester): string {
  if (!s) return "";
  return `${YEAR_LABELS[s.yearLevel] ?? s.yearLevel}  ${SEM_LABELS[s.semester] ?? s.semester}`;
}

function toCourses(s?: Semester): C[] {
  return (s?.courses ?? []).map(c => ({
    code:  c.courseCode   ?? "",
    name:  c.courseName   ?? "",
    cr:    String(c.credit ?? ""),
    grade: String(c.letterGrade ?? ""),
  }));
}

function sortSems(sems: Semester[]): Semester[] {
  const yO: Record<string,number> = { FIRST_YEAR:0, SECOND_YEAR:1, THIRD_YEAR:2, FOURTH_YEAR:3 };
  const sO: Record<string,number> = { SEMESTER_1:0, SEMESTER_2:1 };
  return [...sems].sort((a,b) => {
    const d = (yO[a.yearLevel]??9) - (yO[b.yearLevel]??9);
    return d !== 0 ? d : (sO[a.semester]??0) - (sO[b.semester]??0);
  });
}

// Group semesters by year → pairs of (Year N, Year N+1)
function buildYearPairs(sems: Semester[]): [string, Semester[]][][] {
  const sorted = sortSems(sems);
  const groups: Record<string, Semester[]> = {};
  for (const s of sorted) (groups[s.yearLevel] ??= []).push(s);
  const years = YEAR_ORDER.filter(y => groups[y]?.length);
  const pairs: [string, Semester[]][][] = [];
  for (let i = 0; i < years.length; i += 2) {
    const row: [string, Semester[]][] = [[years[i], groups[years[i]]]];
    if (years[i+1]) row.push([years[i+1], groups[years[i+1]]]);
    pairs.push(row);
  }
  return pairs;
}

// ── Section builder ───────────────────────────────────────────────────────────
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
  const rows: TableRow[] = [semHeaderRow(semLabel(lSem), semLabel(rSem))];
  const lC = toCourses(lSem);
  const rC = toCourses(rSem);

  if (!isLast) {
    const max = Math.max(lC.length, rC.length);
    for (let i = 0; i < max; i++) rows.push(courseRow(lC[i], rC[i]));
    rows.push(gpaRow(lSem?.gpa, rSem?.gpa));
    return rows;
  }

  // Last section: inject summary stats on the right side
  const summaryItems: [string, string][] = summary ? [
    ["Number of Credits Studied",      String(summary.creditsStudied ?? 0).padStart(2,"0")],
    ["Number of Credits Transferred",  String(summary.creditsTransferred ?? 0).padStart(2,"0")],
    ["Total Number of Credits Earned", String(summary.creditsEarned ?? 0).padStart(2,"0")],
    ["Cumulative Grade Point Average",
      typeof summary.cgpa === "number" ? summary.cgpa.toFixed(2) : "---"],
  ] : [];

  const sumStart   = Math.max(rC.length, 3);
  const rightTotal = sumStart + summaryItems.length + 1;
  const leftTotal  = lC.length + 1;
  const totalRows  = Math.max(leftTotal, rightTotal);

  for (let i = 0; i < totalRows; i++) {
    const sumIdx = i - sumStart;
    if (sumIdx >= 0 && sumIdx < summaryItems.length) {
      rows.push(summaryRow(lC[i], summaryItems[sumIdx][0], summaryItems[sumIdx][1]));
    } else {
      rows.push(courseRow(lC[i], rC[i]));
    }
  }
  return rows;
}

// ── Grade legend table (inline, matches textbox table) ────────────────────────
function gradeLegendTable(): Table {
  // Column widths from template: 655, 508, 704, 965, 1728
  const cw = [655, 508, 704, 965, 1728] as const;
  const totalW = cw[0]+cw[1]+cw[2]+cw[3]+cw[4]; // 4560

  const bTop4 = { top: T, bottom: T, left: T, right: T };
  const bBot4 = { top: N, bottom: T, left: T, right: T };

  const hdrRow = new TableRow({
    children: [
      tc(cw[0], 1, [p("Grade",   AlignmentType.CENTER, true)], bTop4),
      tc(cw[1]+cw[2]+cw[3]+cw[4], 4, [p("Mention", AlignmentType.CENTER, true)], bTop4),
    ],
    height: { value: 300, rule: HeightRule.ATLEAST },
  });

  const gradeData: [string, string, string, string, string][] = [
    ["A",  "4.00", "85-100", "Excellent",   "S = SATISFACTORY"],
    ["B+", "3.50", "80-84",  "Very Good",   "U = UNSATISFACTORY"],
    ["B",  "3.00", "70-79",  "Good",        "I = INCOMPLETE"],
    ["C+", "2.50", "65-69",  "Fairly Good", ""],
    ["C",  "2.00", "60-64",  "Fair",        ""],
    ["D",  "1.50", "50-59",  "Poor",        ""],
    ["E",  "1.00", "40-49",  "Very Poor",   ""],
    ["F",  "0.00", "<40",    "Fail",        ""],
  ];

  const dataRows = gradeData.map(([grade, pts, pct, mention, extra]) =>
    new TableRow({
      children: [
        tc(cw[0], 1, [p(grade,   AlignmentType.CENTER)], bBot4),
        tc(cw[1], 1, [p(pts,     AlignmentType.CENTER)], bBot4),
        tc(cw[2], 1, [p(pct,     AlignmentType.CENTER)], bBot4),
        tc(cw[3], 1, [p(mention)],                        bBot4),
        tc(cw[4], 1, [p(extra)],                          bBot4),
      ],
      height: { value: 220, rule: HeightRule.ATLEAST },
    })
  );

  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    rows: [hdrRow, ...dataRows],
  });
}

// ── Student info table (borderless, 4 columns) ────────────────────────────────
function infoTable(data: TranscriptModel, extra: ExtraInfo): Table {
  const NONE4 = { top: N, bottom: N, left: N, right: N } as Borders;

  const labelW = 1750;
  const valueW = 3780;
  const rLabelW = 2050;
  const rValueW = 3340;
  // total = 1750+3780+2050+3340 = 10920

  function infoRow(lLabel: string, lValue: string, rLabel: string, rValue: string): TableRow {
    const lp = (text: string, bold?: boolean) =>
      new Paragraph({
        children: [tr(text, bold)],
        spacing: { before: 0, after: 0 },
      });
    return new TableRow({
      children: [
        tc(labelW,  1, [lp(lLabel)],  NONE4),
        tc(valueW,  1, [lp(": " + lValue)],  NONE4),
        tc(rLabelW, 1, [lp(rLabel)],  NONE4),
        tc(rValueW, 1, [lp(": " + rValue)],  NONE4),
      ],
    });
  }

  return new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    rows: [
      infoRow("Name",           data.studentName  ?? "",      "Department",        data.departmentName ?? ""),
      infoRow("Student ID",     data.studentCode  ?? "",      "Degree",            fmtDegree(data.degree)),
      infoRow("Nationality",    extra.nationality ?? "",      "Major Subject",     data.majorName ?? ""),
      infoRow("Date of Birth",  fmtDate(data.dateOfBirth),   "Date of Admission", fmtDate(extra.dateOfAdmission)),
      infoRow("Place of Birth", extra.placeOfBirth ?? "",     "Date of Graduation",fmtDate(extra.dateOfGraduation)),
    ],
  });
}

// ── Bottom section: grade legend + signature side by side ─────────────────────
function bottomTable(extra: ExtraInfo): Table {
  const NONE4 = { top: N, bottom: N, left: N, right: N } as Borders;

  const today = new Date();
  const city  = extra.issueCity ?? "Kampong Speu";
  const dateStr = `${city}, ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  const sigCell = new TableCell({
    children: [
      new Paragraph({ children: [], spacing: { before: 0, after: 280 } }),
      new Paragraph({
        children: [tr(dateStr)],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
      }),
      new Paragraph({
        children: [tr("Director")],
        alignment: AlignmentType.CENTER,
        spacing: { before: 560, after: 0 },
      }),
      new Paragraph({
        children: [tr(extra.directorName ?? "HONG Kimcheang, Ph.D")],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
      }),
    ],
    width: { size: W_RIGHT, type: WidthType.DXA },
    borders: NONE4,
    verticalAlign: VerticalAlignTable.BOTTOM,
    margins: { top: 0, bottom: 0, left: 80, right: 80 },
  });

  const legendCell = new TableCell({
    children: [gradeLegendTable()],
    width: { size: W_LEFT, type: WidthType.DXA },
    borders: NONE4,
    verticalAlign: VerticalAlignTable.TOP,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  return new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [legendCell, sigCell],
        height: { value: 2800, rule: HeightRule.ATLEAST },
      }),
    ],
  });
}

// ── Document builder ──────────────────────────────────────────────────────────
export interface ExtraInfo {
  nationality?: string;
  placeOfBirth?: string;
  dateOfAdmission?: string;
  dateOfGraduation?: string;
  directorName?: string;
  issueCity?: string;
}

function buildDoc(data: TranscriptModel, extra: ExtraInfo = {}): Document {
  const yearPairs = buildYearPairs(data.semesters ?? []);

  const tableRows: TableRow[] = [colHeaderRow()];
  let lastLeftGpa: number | null | undefined = undefined;

  for (let pi = 0; pi < yearPairs.length; pi++) {
    const pair       = yearPairs[pi];
    const isLastPair = pi === yearPairs.length - 1;
    const leftSems   = pair[0][1];
    const rightSems  = pair[1]?.[1] ?? [];
    const maxSems    = Math.max(leftSems.length, rightSems.length);

    for (let si = 0; si < maxSems; si++) {
      const lSem   = leftSems[si];
      const rSem   = rightSems[si];
      const isLast = isLastPair && si === maxSems - 1;

      if (isLast) lastLeftGpa = lSem?.gpa ?? null;

      tableRows.push(...buildSectionRows(
        lSem, rSem, isLast,
        isLast ? {
          creditsStudied:     data.numberOfCreditsStudied     ?? 0,
          creditsTransferred: data.numberOfCreditsTransferred ?? 0,
          creditsEarned:      data.totalNumberOfCreditsEarned ?? 0,
          cgpa:               data.cumulativeGradePointAverage,
        } : undefined,
      ));
    }
  }

  // Fallback if no semester data
  if (tableRows.length === 1) {
    tableRows.push(semHeaderRow("", ""));
  }
  // Always close the table with the final row
  tableRows.push(lastGpaRow(lastLeftGpa));

  const courseTable = new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    rows: tableRows,
  });

  return new Document({
    sections: [{
      properties: {
        page: {
          size:   { width: 11907, height: 16840 },   // A4
          margin: { top: 3261, bottom: 1440, left: 993, right: 1275 },
        },
      },
      children: [
        // Title
        new Paragraph({
          children: [tr("OFFICIAL TRANSCRIPT", true, false, SZ_T)],
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
        }),
        // Student info (borderless table)
        infoTable(data, extra),
        // Small gap
        new Paragraph({ children: [], spacing: { before: 80, after: 0 } }),
        // Course table
        courseTable,
        // Bottom: grade legend + signature
        bottomTable(extra),
      ],
    }],
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

// Server-side (API route) — returns a Buffer
export async function exportTranscriptToWordBuffer(
  data: TranscriptModel,
  extra: ExtraInfo = {},
): Promise<Buffer> {
  return Packer.toBuffer(buildDoc(data, extra));
}

// Client-side — downloads directly (lazy-loads file-saver)
export async function exportTranscriptToWord(
  data: TranscriptModel,
  extra: ExtraInfo = {},
  filename?: string,
): Promise<void> {
  const { saveAs } = await import("file-saver");
  const blob = await Packer.toBlob(buildDoc(data, extra));
  const fname = filename
    ?? `${data.studentCode ?? "transcript"}_transcript_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fname);
}
