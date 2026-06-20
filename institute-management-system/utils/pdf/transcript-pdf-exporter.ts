import { jsPDF } from "jspdf";
import type { TranscriptModel, Semester } from "@/model/request/request-transcript";

export interface TranscriptExtraInfo {
  nationality?: string;
  placeOfBirth?: string;
  dateOfAdmission?: string;
  dateOfGraduation?: string;
  directorName?: string;
  issueCity?: string;
}

// ── Page & margins (mm) ───────────────────────────────────────────────────────
const PW = 210, PH = 297;          // A4
const ML = 15, MR = 15;            // left/right
const MT = 18, MB = 12;            // top/bottom
const CW = PW - ML - MR;           // content width = 180mm

// ── Font ─────────────────────────────────────────────────────────────────────
const FONT  = "times";
const FS    = 8.5;   // body
const FS_T  = 12;    // title
const FS_LEG = 7.5;  // grade legend
const twip  = 25.4 / 1440;  // mm per twip

// ── Color (navy, matches reference) ───────────────────────────────────────────
const NAVY: [number, number, number] = [31, 56, 100];   // #1F3864

// ── Column widths (mm) — scaled from template DXA to fit CW ───────────────────
// Template: L(5530) + R(5390) = 10920 total twips
const _cs = CW / 10920;
const L1 = 988 * _cs, L2 = 2551 * _cs, L3 = 989 * _cs, L4 = 427 * _cs, L5 = 575 * _cs;
const R1 = 992 * _cs, R2 = 2198 * _cs, R3 = 1203 * _cs, R4 = 425 * _cs, R5 = 572 * _cs;

const W_LEFT  = L1 + L2 + L3 + L4 + L5;
const W_RIGHT = R1 + R2 + R3 + R4 + R5;
const W_SUBJ_L      = L2 + L3;
const W_CR_GR_L_HDR = L3 + L4 + L5;
const W_SUBJ_R      = R2 + R3;
const W_CR_GR_R_HDR = R3 + R4 + R5;
const W_GPA_L       = L4 + L5;
const W_GPA_R       = R4 + R5;

// Absolute x positions for each column edge
const XS: number[] = (() => {
  const xs = [ML];
  for (const w of [L1, L2, L3, L4, L5, R1, R2, R3, R4, R5]) xs.push(xs[xs.length - 1] + w);
  return xs;
})();

// ── Row heights (mm) ──────────────────────────────────────────────────────────
const H_COL = 360 * twip;
const H_SEM = 320 * twip;
const H_CRS = 240 * twip;
const H_GPA = 270 * twip;

// ── Border helpers ────────────────────────────────────────────────────────────
interface Bdr { top: boolean; bottom: boolean; left: boolean; right: boolean; }
const BL:   Bdr = { top: false, bottom: false, left: true,  right: false };
const BR:   Bdr = { top: false, bottom: false, left: false, right: true  };
const BLR:  Bdr = { top: false, bottom: false, left: true,  right: true  };
const BNO:  Bdr = { top: false, bottom: false, left: false, right: false };
const BTL:  Bdr = { top: true,  bottom: false, left: true,  right: false };
const BTR:  Bdr = { top: true,  bottom: false, left: false, right: true  };
const BTO:  Bdr = { top: true,  bottom: false, left: false, right: false };
const BBL:  Bdr = { top: false, bottom: true,  left: true,  right: false };
const BBR:  Bdr = { top: false, bottom: true,  left: false, right: true  };
const BBo:  Bdr = { top: false, bottom: true,  left: false, right: false };
const BBLR: Bdr = { top: false, bottom: true,  left: true,  right: true  };

function bdrDraw(doc: jsPDF, x: number, y: number, w: number, h: number, bdr: Bdr) {
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setLineWidth(0.25);
  if (bdr.top)    doc.line(x,   y,   x + w, y    );
  if (bdr.bottom) doc.line(x,   y + h, x + w, y + h);
  if (bdr.left)   doc.line(x,   y,   x,     y + h);
  if (bdr.right)  doc.line(x + w, y,   x + w, y + h);
}

// ── Text helper ───────────────────────────────────────────────────────────────
interface TxtOpts {
  align?:     "left" | "center" | "right";
  bold?:      boolean;
  underline?: boolean;
  fontSize?:  number;
  vAlign?:    "top" | "center" | "bottom";
}

function cellTxt(
  doc: jsPDF,
  text: string,
  cx: number, cy: number, cw: number, ch: number,
  opts: TxtOpts = {},
) {
  if (!text) return;
  const { align = "left", bold = false, underline = false, fontSize = FS, vAlign = "center" } = opts;
  doc.setFont(FONT, bold ? "bold" : "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);

  const lineH  = fontSize * 0.3528;
  const ascent = lineH * 0.78;

  let by: number;
  if (vAlign === "bottom") by = cy + ch - lineH * 0.28;
  else if (vAlign === "top") by = cy + ascent + 0.5;
  else by = cy + (ch + ascent) / 2;

  const PAD = 1;
  let tx: number;
  const tOpts: { align?: "center" | "right" | "left" } = {};
  if (align === "center") { tx = cx + cw / 2; tOpts.align = "center"; }
  else if (align === "right") { tx = cx + cw - PAD; tOpts.align = "right"; }
  else { tx = cx + PAD; }

  doc.text(text, tx, by, tOpts as Parameters<typeof doc.text>[3]);

  if (underline) {
    const tw  = doc.getTextWidth(text);
    const uly = by + lineH * 0.15;
    let ulx: number;
    if (align === "center") ulx = tx - tw / 2;
    else if (align === "right") ulx = tx - tw;
    else ulx = tx;
    doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.setLineWidth(0.2);
    doc.line(ulx, uly, ulx + tw, uly);
  }
}

// Rich runs (for semester labels with superscript ordinal), left-aligned, underlined
interface Run { text: string; sup?: boolean; }
function drawRuns(doc: jsPDF, runs: Run[], x: number, y: number, h: number, bold: boolean) {
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  const lineH  = FS * 0.3528;
  const by = y + h - lineH * 0.28;   // bottom-aligned baseline
  let cx = x + 1;
  const startX = cx;
  for (const run of runs) {
    const size = run.sup ? FS * 0.72 : FS;
    doc.setFont(FONT, bold ? "bold" : "normal");
    doc.setFontSize(size);
    const yy = run.sup ? by - lineH * 0.32 : by;
    doc.text(run.text, cx, yy);
    cx += doc.getTextWidth(run.text);
  }
  // underline whole run, navy
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setLineWidth(0.2);
  doc.line(startX, by + lineH * 0.15, cx, by + lineH * 0.15);
  doc.setFontSize(FS);
}

// ── Utilities ─────────────────────────────────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

function fmtDate(d?: string | null): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime())
      ? d
      : `${String(dt.getDate()).padStart(2, "0")} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  } catch { return d; }
}

const DEGREE_LEVEL: Record<string, string> = {
  ASSOCIATE: "Associate",
  BACHELOR:  "Bachelor",
  MASTER:    "Master",
  DOCTOR:    "Doctor",
};

function fmtDegree(deg?: string, major?: string): string {
  if (!deg) return "";
  // If already a full phrase ("Associate in Food Technology"), use as-is.
  if (/\s/.test(deg)) return deg;
  const level = DEGREE_LEVEL[deg] ?? deg;
  return major ? `${level} in ${major}` : level;
}

const YEAR_ORDER  = ["FIRST_YEAR", "SECOND_YEAR", "THIRD_YEAR", "FOURTH_YEAR"];
const YEAR_LABELS: Record<string, string> = {
  FIRST_YEAR:  "First Year",
  SECOND_YEAR: "Second Year",
  THIRD_YEAR:  "Third Year",
  FOURTH_YEAR: "Fourth Year",
};

function semRuns(s?: Semester): Run[] {
  if (!s) return [];
  const year = YEAR_LABELS[s.yearLevel] ?? s.yearLevel;
  const isSecond = s.semester === "SEMESTER_2";
  const num = isSecond ? "2" : "1";
  const ord = isSecond ? "nd" : "st";
  return [{ text: `${year} ` }, { text: num }, { text: ord, sup: true }, { text: " Semester" }];
}

interface C { code: string; name: string; cr: string; grade: string; }

function toCourses(s?: Semester): C[] {
  return (s?.courses ?? []).map(c => ({
    code:  c.courseCode ?? "",
    name:  c.courseName ?? "",
    cr:    String(c.credit ?? ""),
    grade: String(c.letterGrade ?? ""),
  }));
}

function sortSems(sems: Semester[]): Semester[] {
  const yO: Record<string, number> = { FIRST_YEAR: 0, SECOND_YEAR: 1, THIRD_YEAR: 2, FOURTH_YEAR: 3 };
  const sO: Record<string, number> = { SEMESTER_1: 0, SEMESTER_2: 1 };
  return [...sems].sort((a, b) => {
    const d = (yO[a.yearLevel] ?? 9) - (yO[b.yearLevel] ?? 9);
    return d !== 0 ? d : (sO[a.semester] ?? 0) - (sO[b.semester] ?? 0);
  });
}

// Group semesters by year → rows of (Year N, Year N+1) shown side by side
function buildYearPairs(sems: Semester[]): [string, Semester[]][][] {
  const sorted = sortSems(sems);
  const groups: Record<string, Semester[]> = {};
  for (const s of sorted) (groups[s.yearLevel] ??= []).push(s);
  const years = YEAR_ORDER.filter(y => groups[y]?.length);
  const pairs: [string, Semester[]][][] = [];
  for (let i = 0; i < years.length; i += 2) {
    const row: [string, Semester[]][] = [[years[i], groups[years[i]]]];
    if (years[i + 1]) row.push([years[i + 1], groups[years[i + 1]]]);
    pairs.push(row);
  }
  return pairs;
}

// ── Row drawing ───────────────────────────────────────────────────────────────
function drawColHeader(doc: jsPDF, y: number) {
  const h = H_COL;
  bdrDraw(doc, XS[0], y, L1,            h, BTL); cellTxt(doc, "Code",          XS[0], y, L1,            h, { align: "center", bold: true });
  bdrDraw(doc, XS[1], y, L2,            h, BTO); cellTxt(doc, "Subject",       XS[1], y, L2,            h, { align: "center", bold: true });
  bdrDraw(doc, XS[2], y, W_CR_GR_L_HDR, h, BTR); cellTxt(doc, "Credits/Grade", XS[2], y, W_CR_GR_L_HDR, h, { align: "right",  bold: true });
  bdrDraw(doc, XS[5], y, R1,            h, BTL); cellTxt(doc, "Code",          XS[5], y, R1,            h, { align: "center", bold: true });
  bdrDraw(doc, XS[6], y, R2,            h, BTO); cellTxt(doc, "Subject",       XS[6], y, R2,            h, { align: "center", bold: true });
  bdrDraw(doc, XS[7], y, W_CR_GR_R_HDR, h, BTR); cellTxt(doc, "Credit/Grade",  XS[7], y, W_CR_GR_R_HDR, h, { align: "right",  bold: true });
  // bottom line under the header (both halves)
  bdrDraw(doc, ML, y, CW, h, BBo);
}

function drawSemHeader(doc: jsPDF, y: number, lSem?: Semester, rSem?: Semester) {
  const h = H_SEM;
  bdrDraw(doc, ML,    y, W_LEFT,  h, BLR);
  bdrDraw(doc, XS[5], y, W_RIGHT, h, BLR);
  if (lSem) drawRuns(doc, semRuns(lSem), ML,    y, h, true);
  if (rSem) drawRuns(doc, semRuns(rSem), XS[5], y, h, true);
}

function drawCourseRow(doc: jsPDF, y: number, l?: C, r?: C) {
  const h = H_CRS;
  const ld = l ?? { code: "", name: "", cr: "", grade: "" };
  const rd = r ?? { code: "", name: "", cr: "", grade: "" };
  bdrDraw(doc, XS[0], y, L1,       h, BL);  cellTxt(doc, ld.code,  XS[0], y, L1,       h);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BNO); cellTxt(doc, ld.name,  XS[1], y, W_SUBJ_L, h);
  bdrDraw(doc, XS[3], y, L4,       h, BNO); cellTxt(doc, ld.cr,    XS[3], y, L4,       h, { align: "center" });
  bdrDraw(doc, XS[4], y, L5,       h, BR);  cellTxt(doc, ld.grade, XS[4], y, L5,       h, { align: "center" });
  bdrDraw(doc, XS[5], y, R1,       h, BL);  cellTxt(doc, rd.code,  XS[5], y, R1,       h);
  bdrDraw(doc, XS[6], y, W_SUBJ_R, h, BNO); cellTxt(doc, rd.name,  XS[6], y, W_SUBJ_R, h);
  bdrDraw(doc, XS[8], y, R4,       h, BNO); cellTxt(doc, rd.cr,    XS[8], y, R4,       h, { align: "center" });
  bdrDraw(doc, XS[9], y, R5,       h, BR);  cellTxt(doc, rd.grade, XS[9], y, R5,       h, { align: "center" });
}

function drawSummaryRow(doc: jsPDF, y: number, l: C | undefined, label: string, value: string) {
  const h = H_CRS;
  const ld = l ?? { code: "", name: "", cr: "", grade: "" };
  bdrDraw(doc, XS[0], y, L1,       h, BL);  cellTxt(doc, ld.code,  XS[0], y, L1,       h);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BNO); cellTxt(doc, ld.name,  XS[1], y, W_SUBJ_L, h);
  bdrDraw(doc, XS[3], y, L4,       h, BNO); cellTxt(doc, ld.cr,    XS[3], y, L4,       h, { align: "center" });
  bdrDraw(doc, XS[4], y, L5,       h, BR);  cellTxt(doc, ld.grade, XS[4], y, L5,       h, { align: "center" });
  bdrDraw(doc, XS[5], y, R1,       h, BL);
  bdrDraw(doc, XS[6], y, W_SUBJ_R, h, BNO); cellTxt(doc, label, XS[6], y, W_SUBJ_R, h, { bold: true });
  bdrDraw(doc, XS[8], y, W_GPA_R,  h, BR);  cellTxt(doc, value, XS[8], y, W_GPA_R,  h, { align: "center", bold: true });
}

function drawGpaRow(doc: jsPDF, y: number, leftGpa?: number | null, rightGpa?: number | null) {
  const h = H_GPA;
  const lg = leftGpa  != null ? leftGpa.toFixed(2)  : "";
  const rg = rightGpa != null ? rightGpa.toFixed(2) : "";
  bdrDraw(doc, XS[0], y, L1,       h, BL);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BNO); cellTxt(doc, "Grade Point Average", XS[1], y, W_SUBJ_L, h, { align: "center", bold: true, underline: true });
  bdrDraw(doc, XS[3], y, W_GPA_L,  h, BR);  cellTxt(doc, lg, XS[3], y, W_GPA_L, h, { align: "center", bold: true, underline: true });
  bdrDraw(doc, XS[5], y, R1,       h, BL);
  bdrDraw(doc, XS[6], y, W_SUBJ_R, h, BNO); cellTxt(doc, "Grade Point Average", XS[6], y, W_SUBJ_R, h, { align: "center", bold: true, underline: true });
  bdrDraw(doc, XS[8], y, W_GPA_R,  h, BR);  cellTxt(doc, rg, XS[8], y, W_GPA_R, h, { align: "center", bold: true, underline: true });
}

// Last row: left GPA + "Transcript Closed" across the right half (bottom border closes the table)
function drawLastGpaRow(doc: jsPDF, y: number, leftGpa?: number | null, closedText = "Transcript Closed") {
  const h = H_GPA;
  const lg = leftGpa != null ? leftGpa.toFixed(2) : "";
  bdrDraw(doc, XS[0], y, L1,       h, BBL);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BBo); cellTxt(doc, "Grade Point Average", XS[1], y, W_SUBJ_L, h, { align: "center", bold: true, underline: true });
  bdrDraw(doc, XS[3], y, W_GPA_L,  h, BBR); cellTxt(doc, lg, XS[3], y, W_GPA_L, h, { align: "center", bold: true, underline: true });
  bdrDraw(doc, XS[5], y, W_RIGHT,  h, BBLR); cellTxt(doc, closedText, XS[5], y, W_RIGHT, h, { align: "center", bold: true });
}

// ── Info section (borderless) ─────────────────────────────────────────────────
const INFO_ROW_H = 5.2;

function drawInfoSection(doc: jsPDF, data: TranscriptModel, extra: TranscriptExtraInfo, y: number) {
  const labelW  = 1750 * _cs;
  const valueW  = 3780 * _cs;
  const rLabelW = 2050 * _cs;
  const cols = [ML, ML + labelW, ML + labelW + valueW, ML + labelW + valueW + rLabelW, ML + CW];

  const rows: [string, string, string, string][] = [
    ["Name",           data.studentName  ?? "",                  "Department",         data.departmentName ?? ""],
    ["Student ID",     data.studentCode  ?? "",                  "Degree",             fmtDegree(data.degree, data.majorName)],
    ["Nationality",    data.nationality ?? extra.nationality ?? "",   "Major",          data.majorName ?? ""],
    ["Date of Birth",  fmtDate(data.dateOfBirth),                "Date of Admission",  data.dateOfAdmission ?? extra.dateOfAdmission ?? ""],
    ["Place of Birth", data.placeOfBirth ?? extra.placeOfBirth ?? "", "Date of Graduation", data.dateOfGraduation ?? extra.dateOfGraduation ?? ""],
  ];

  for (let i = 0; i < rows.length; i++) {
    const ry = y + i * INFO_ROW_H;
    const [lLbl, lVal, rLbl, rVal] = rows[i];
    cellTxt(doc, lLbl,        cols[0], ry, labelW,          INFO_ROW_H);
    cellTxt(doc, ": " + lVal, cols[1], ry, valueW,          INFO_ROW_H);
    cellTxt(doc, rLbl,        cols[2], ry, rLabelW,         INFO_ROW_H);
    cellTxt(doc, ": " + rVal, cols[3], ry, cols[4] - cols[3], INFO_ROW_H);
  }
}

// ── Grade legend (bottom-left, fully bordered box) ────────────────────────────
const GRADE_DATA: [string, string, string, string, string][] = [
  ["A",  "4.00", "85-100", "Excellent",   "S = SATISFACTORY"],
  ["B+", "3.50", "80-84",  "Very Good",   "U = UNSATISFACTORY"],
  ["B",  "3.00", "70-79",  "Good",        "I = INCOMPLETE"],
  ["C+", "2.50", "65-69",  "Fairly Good", ""],
  ["C",  "2.00", "60-64",  "Fair",        ""],
  ["D",  "1.50", "50-59",  "Poor",        ""],
  ["E",  "1.00", "40-49",  "Very Poor",   ""],
  ["F",  "0.00", "<40",    "Fail",        ""],
];

const H_GH = 260 * twip;   // legend header height
const H_GD = 210 * twip;   // legend data row height
const LEG_H = H_GH + GRADE_DATA.length * H_GD;

function drawLegend(doc: jsPDF, y: number) {
  // column widths proportional to W_LEFT
  const legTotal = 4560;
  const lw = [560, 470, 620, 940, 1970].map(w => (w / legTotal) * W_LEFT);
  const legX: number[] = [ML];
  for (const w of lw) legX.push(legX[legX.length - 1] + w);
  const totalW = W_LEFT;
  const mentW = lw[1] + lw[2] + lw[3] + lw[4];

  // header text (no background fill)
  cellTxt(doc, "Grade",   legX[0], y, lw[0],  H_GH, { align: "center", bold: true, fontSize: FS_LEG });
  cellTxt(doc, "Mention", legX[1], y, mentW,  H_GH, { align: "center", bold: true, fontSize: FS_LEG });

  // data rows
  let gy = y + H_GH;
  for (const [grade, pts, pct, mention, sui] of GRADE_DATA) {
    cellTxt(doc, grade,   legX[0], gy, lw[0], H_GD, { align: "center", fontSize: FS_LEG });
    cellTxt(doc, pts,     legX[1], gy, lw[1], H_GD, { align: "center", fontSize: FS_LEG });
    cellTxt(doc, pct,     legX[2], gy, lw[2], H_GD, { align: "center", fontSize: FS_LEG });
    cellTxt(doc, mention, legX[3], gy, lw[3], H_GD, { fontSize: FS_LEG });
    cellTxt(doc, sui,     legX[4], gy, lw[4], H_GD, { fontSize: FS_LEG });
    gy += H_GD;
  }

  // borders: outer box, header underline, vertical after Grade (full),
  // vertical before notes column (data area only)
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setLineWidth(0.25);
  doc.rect(legX[0], y, totalW, LEG_H);                       // outer box
  doc.line(legX[0], y + H_GH, legX[0] + totalW, y + H_GH);   // under header
  doc.line(legX[1], y, legX[1], y + LEG_H);                  // after Grade column
  doc.line(legX[4], y + H_GH, legX[4], y + LEG_H);           // before notes column
}

// ── Signature (bottom-right) ──────────────────────────────────────────────────
function drawSignature(doc: jsPDF, extra: TranscriptExtraInfo, y: number) {
  const sigX = ML + W_LEFT;
  const sigW = W_RIGHT;
  const cx   = sigX + sigW / 2;
  const today = new Date();
  const city  = extra.issueCity ?? "Kampong Speu";
  const dateStr = `${city}, ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setFont(FONT, "normal");
  doc.setFontSize(FS);
  doc.text(dateStr, cx, y + 6, { align: "center" });

  doc.setFont(FONT, "bold");
  doc.text("Director", cx, y + 13, { align: "center" });
  doc.text(extra.directorName ?? "HARTH Bunhe, PhD", cx, y + LEG_H - 1, { align: "center" });
}

// ── Build the document ────────────────────────────────────────────────────────
export function buildTranscriptPDF(
  data: TranscriptModel,
  extra: TranscriptExtraInfo = {},
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = MT;

  const checkY = (needed: number) => {
    if (y + needed > PH - MB) {
      doc.addPage();
      y = MT;
      drawColHeader(doc, y);
      y += H_COL;
    }
  };

  // 1. Title
  cellTxt(doc, "OFFICIAL ACADEMIC TRANSCRIPT", ML, y, CW, 8,
    { align: "center", bold: true, fontSize: FS_T });
  y += 10;

  // 2. Student info
  drawInfoSection(doc, data, extra, y);
  y += 5 * INFO_ROW_H + 2;

  // 3. Column header
  drawColHeader(doc, y);
  y += H_COL;

  // 4. Course sections
  const yearPairs = buildYearPairs(data.semesters ?? []);
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

      checkY(H_SEM);
      drawSemHeader(doc, y, lSem, rSem);
      y += H_SEM;

      if (!isLast) {
        const lC = toCourses(lSem);
        const rC = toCourses(rSem);
        const max = Math.max(lC.length, rC.length);
        for (let i = 0; i < max; i++) {
          checkY(H_CRS);
          drawCourseRow(doc, y, lC[i], rC[i]);
          y += H_CRS;
        }
        checkY(H_GPA);
        drawGpaRow(doc, y, lSem?.gpa, rSem?.gpa);
        y += H_GPA;
      } else {
        const lC = toCourses(lSem);
        const rC = toCourses(rSem);
        const summaryItems: [string, string][] = [
          ["Number of Credits Studied",      String(data.numberOfCreditsStudied ?? 0).padStart(2, "0")],
          ["Number of Credits Transferred",  String(data.numberOfCreditsTransferred ?? 0).padStart(2, "0")],
          ["Total Number of Credits Earned", String(data.totalNumberOfCreditsEarned ?? 0).padStart(2, "0")],
          ["Cumulative Grade Point Average",
            typeof data.cumulativeGradePointAverage === "number"
              ? data.cumulativeGradePointAverage.toFixed(2) : "---"],
        ];
        const sumStart   = Math.max(rC.length, 3);
        const rightTotal = sumStart + summaryItems.length;
        const totalRows  = Math.max(lC.length, rightTotal);

        for (let i = 0; i < totalRows; i++) {
          const sumIdx = i - sumStart;
          checkY(H_CRS);
          if (sumIdx >= 0 && sumIdx < summaryItems.length) {
            drawSummaryRow(doc, y, lC[i], summaryItems[sumIdx][0], summaryItems[sumIdx][1]);
          } else {
            drawCourseRow(doc, y, lC[i], rC[i]);
          }
          y += H_CRS;
        }
      }
    }
  }

  if (yearPairs.length === 0) {
    checkY(H_SEM);
    drawSemHeader(doc, y, undefined, undefined);
    y += H_SEM;
  }

  // Last GPA / Transcript Closed row
  checkY(H_GPA);
  drawLastGpaRow(doc, y, lastLeftGpa);
  y += H_GPA;

  // 5. Grade legend (left) + signature (right) — page-break without a course header
  if (y + 4 + LEG_H > PH - MB) {
    doc.addPage();
    y = MT;
  }
  y += 4;
  drawLegend(doc, y);
  drawSignature(doc, extra, y);

  return doc;
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function exportTranscriptToPDF(
  data: TranscriptModel,
  extra: TranscriptExtraInfo = {},
  filename?: string,
): Promise<void> {
  const doc = buildTranscriptPDF(data, extra);
  const fname = filename
    ?? `${data.studentCode ?? "transcript"}_transcript_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fname);
}
