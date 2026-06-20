import { jsPDF } from "jspdf";
import { TranscriptModel, Semester } from "@/model/request/request-transcript";

export interface TranscriptExtraInfo {
  nationality?: string;
  placeOfBirth?: string;
  dateOfAdmission?: string;
  dateOfGraduation?: string;
  directorName?: string;
  issueCity?: string;
}

// ── Page & margins ────────────────────────────────────────────────────────────
const PW = 210, PH = 297;           // A4 mm
const ML = 17.5, MR = 22.5;        // left/right margins (≈ 993 & 1275 twips)
const MT = 57.5, MB = 25.4;        // top/bottom margins (≈ 3261 & 1440 twips)
const CW = PW - ML - MR;           // content width = 170mm

// ── Font ─────────────────────────────────────────────────────────────────────
const FONT = "times";
const FS   = 10;   // body (pt)
const FS_T = 12;   // title (pt)
const twip = 25.4 / 1440;  // mm per twip

// ── Column widths (mm) — scaled from DXA to fit CW ───────────────────────────
// Template: L(5530) + R(5390) = 10920 total twips
const _cs = CW / 10920;
const L1 = 988*_cs, L2 = 2551*_cs, L3 = 989*_cs, L4 = 427*_cs, L5 = 575*_cs;
const R1 = 992*_cs, R2 = 2198*_cs, R3 = 1203*_cs, R4 = 425*_cs, R5 = 572*_cs;

const W_LEFT  = L1+L2+L3+L4+L5;
const W_RIGHT = R1+R2+R3+R4+R5;
const W_SUBJ_L      = L2+L3;
const W_CR_GR_L_HDR = L3+L4+L5;
const W_GPA_L       = L4+L5;
const W_SUBJ_R      = R2+R3;
const W_CR_GR_R_HDR = R3+R4+R5;
const W_GPA_R       = R4+R5;

// Absolute x positions for each column edge (index 0 = left edge of L1, index 10 = right edge of R5)
const XS: number[] = (() => {
  const xs = [ML];
  for (const w of [L1,L2,L3,L4,L5,R1,R2,R3,R4,R5]) xs.push(xs[xs.length-1]+w);
  return xs;
})();

// ── Row heights (mm) — direct twip→mm (not scaled) ───────────────────────────
const H_COL = 422*twip;   // 7.44mm
const H_SEM = 397*twip;   // 7.00mm
const H_CRS = 283*twip;   // 4.99mm
const H_GPA = 316*twip;   // 5.57mm
const H_END = 113*twip;   // 1.99mm

// ── Colors ───────────────────────────────────────────────────────────────────
const GRAY: [number,number,number] = [217, 217, 217]; // D9D9D9

// ── Border helpers ────────────────────────────────────────────────────────────
interface Bdr { top: boolean; bottom: boolean; left: boolean; right: boolean; }
const BL:   Bdr = { top:false, bottom:false, left:true,  right:false };
const BR:   Bdr = { top:false, bottom:false, left:false, right:true  };
const BLR:  Bdr = { top:false, bottom:false, left:true,  right:true  };
const BNO:  Bdr = { top:false, bottom:false, left:false, right:false };
const BTL:  Bdr = { top:true,  bottom:false, left:true,  right:false };
const BTR:  Bdr = { top:true,  bottom:false, left:false, right:true  };
const BTO:  Bdr = { top:true,  bottom:false, left:false, right:false };
const BBL:  Bdr = { top:false, bottom:true,  left:true,  right:false };
const BBR:  Bdr = { top:false, bottom:true,  left:false, right:true  };
const BBo:  Bdr = { top:false, bottom:true,  left:false, right:false };
const BBLR: Bdr = { top:false, bottom:true,  left:true,  right:true  };
const BALL: Bdr = { top:true,  bottom:true,  left:true,  right:true  };
const BBTM: Bdr = { top:false, bottom:true,  left:true,  right:true  };

function bdrDraw(doc: jsPDF, x: number, y: number, w: number, h: number, bdr: Bdr) {
  doc.setDrawColor(0);
  doc.setLineWidth(0.25);
  if (bdr.top)    doc.line(x,   y,   x+w, y  );
  if (bdr.bottom) doc.line(x,   y+h, x+w, y+h);
  if (bdr.left)   doc.line(x,   y,   x,   y+h);
  if (bdr.right)  doc.line(x+w, y,   x+w, y+h);
}

function fillCell(doc: jsPDF, x: number, y: number, w: number, h: number, color: [number,number,number]) {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y, w, h, "F");
}

// ── Text helper ───────────────────────────────────────────────────────────────
interface TxtOpts {
  align?:     "left"|"center"|"right";
  bold?:      boolean;
  underline?: boolean;
  fontSize?:  number;
  vAlign?:    "top"|"center"|"bottom";
}

function cellTxt(
  doc: jsPDF,
  text: string,
  cx: number, cy: number, cw: number, ch: number,
  opts: TxtOpts = {},
) {
  if (!text) return;
  const { align="left", bold=false, underline=false, fontSize=FS, vAlign="center" } = opts;
  doc.setFont(FONT, bold ? "bold" : "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(0);

  const lineH  = fontSize * 0.3528;   // pt → mm
  const ascent = lineH * 0.78;        // approximate cap-height

  let by: number;
  if (vAlign === "bottom") by = cy + ch - lineH * 0.25;
  else if (vAlign === "top") by = cy + ascent + 0.5;
  else by = cy + (ch + ascent) / 2;   // center

  const PAD = 1;
  let tx: number;
  const tOpts: { align?: "center"|"right"|"left" } = {};
  if (align === "center") { tx = cx + cw/2; tOpts.align = "center"; }
  else if (align === "right") { tx = cx + cw - PAD; tOpts.align = "right"; }
  else { tx = cx + PAD; }

  doc.text(text, tx, by, tOpts as Parameters<typeof doc.text>[3]);

  if (underline) {
    const tw  = doc.getTextWidth(text);
    const uly = by + lineH * 0.15;
    let ulx: number;
    if (align === "center") ulx = tx - tw/2;
    else if (align === "right") ulx = tx - tw;
    else ulx = tx;
    doc.setDrawColor(0);
    doc.setLineWidth(0.15);
    doc.line(ulx, uly, ulx+tw, uly);
  }
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

interface C { code: string; name: string; cr: string; grade: string; }

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

// ── Row drawing ───────────────────────────────────────────────────────────────

function drawColHeader(doc: jsPDF, y: number) {
  const h = H_COL;
  fillCell(doc, ML, y, CW, h, GRAY);
  // Left side
  bdrDraw(doc, XS[0], y, L1,           h, BTL); cellTxt(doc, "Code",          XS[0], y, L1,           h, { align:"center", bold:true });
  bdrDraw(doc, XS[1], y, L2,           h, BTO); cellTxt(doc, "Subject",       XS[1], y, L2,           h, { align:"center", bold:true });
  bdrDraw(doc, XS[2], y, W_CR_GR_L_HDR,h, BTR); cellTxt(doc, "Credits/Grade", XS[2], y, W_CR_GR_L_HDR,h, { align:"right",  bold:true });
  // Right side
  bdrDraw(doc, XS[5], y, R1,           h, BTL); cellTxt(doc, "Code",          XS[5], y, R1,           h, { align:"center", bold:true });
  bdrDraw(doc, XS[6], y, R2,           h, BTO); cellTxt(doc, "Subject",       XS[6], y, R2,           h, { align:"center", bold:true });
  bdrDraw(doc, XS[7], y, W_CR_GR_R_HDR,h, BTR); cellTxt(doc, "Credit/Grade",  XS[7], y, W_CR_GR_R_HDR,h, { align:"right",  bold:true });
}

function drawSemHeader(doc: jsPDF, y: number, leftLabel: string, rightLabel: string) {
  const h = H_SEM;
  bdrDraw(doc, ML,       y, W_LEFT,  h, BLR); cellTxt(doc, leftLabel,  ML,       y, W_LEFT,  h, { bold:true, underline:true, vAlign:"bottom" });
  bdrDraw(doc, XS[5],    y, W_RIGHT, h, BLR); cellTxt(doc, rightLabel, XS[5],    y, W_RIGHT, h, { bold:true, underline:true, vAlign:"bottom" });
}

function drawCourseRow(doc: jsPDF, y: number, l?: C, r?: C) {
  const h = H_CRS;
  const ld = l ?? { code:"", name:"", cr:"", grade:"" };
  const rd = r ?? { code:"", name:"", cr:"", grade:"" };
  // Left
  bdrDraw(doc, XS[0], y, L1,       h, BL);  cellTxt(doc, ld.code,  XS[0], y, L1,       h);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BNO); cellTxt(doc, ld.name,  XS[1], y, W_SUBJ_L, h);
  bdrDraw(doc, XS[3], y, L4,       h, BNO); cellTxt(doc, ld.cr,    XS[3], y, L4,       h, { align:"center" });
  bdrDraw(doc, XS[4], y, L5,       h, BR);  cellTxt(doc, ld.grade, XS[4], y, L5,       h, { align:"center" });
  // Right
  bdrDraw(doc, XS[5], y, R1,       h, BL);  cellTxt(doc, rd.code,  XS[5], y, R1,       h);
  bdrDraw(doc, XS[6], y, W_SUBJ_R, h, BNO); cellTxt(doc, rd.name,  XS[6], y, W_SUBJ_R, h);
  bdrDraw(doc, XS[8], y, R4,       h, BNO); cellTxt(doc, rd.cr,    XS[8], y, R4,       h, { align:"center" });
  bdrDraw(doc, XS[9], y, R5,       h, BR);  cellTxt(doc, rd.grade, XS[9], y, R5,       h, { align:"center" });
}

function drawSummaryRow(doc: jsPDF, y: number, l: C|undefined, label: string, value: string) {
  const h = H_CRS;
  const ld = l ?? { code:"", name:"", cr:"", grade:"" };
  // Left (same as course row)
  bdrDraw(doc, XS[0], y, L1,       h, BL);  cellTxt(doc, ld.code,  XS[0], y, L1,       h);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BNO); cellTxt(doc, ld.name,  XS[1], y, W_SUBJ_L, h);
  bdrDraw(doc, XS[3], y, L4,       h, BNO); cellTxt(doc, ld.cr,    XS[3], y, L4,       h, { align:"center" });
  bdrDraw(doc, XS[4], y, L5,       h, BR);  cellTxt(doc, ld.grade, XS[4], y, L5,       h, { align:"center" });
  // Right: R1 empty, label in W_SUBJ_R, value in W_GPA_R
  bdrDraw(doc, XS[5], y, R1,       h, BL);
  bdrDraw(doc, XS[6], y, W_SUBJ_R, h, BNO); cellTxt(doc, label, XS[6], y, W_SUBJ_R, h);
  bdrDraw(doc, XS[8], y, W_GPA_R,  h, BR);  cellTxt(doc, value, XS[8], y, W_GPA_R,  h, { align:"center" });
}

function drawGpaRow(doc: jsPDF, y: number, leftGpa?: number|null, rightGpa?: number|null) {
  const h = H_GPA;
  const lg = leftGpa  != null ? leftGpa.toFixed(2)  : "";
  const rg = rightGpa != null ? rightGpa.toFixed(2) : "";
  bdrDraw(doc, XS[0], y, L1,       h, BL);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BNO); cellTxt(doc, "Grade Point Average", XS[1], y, W_SUBJ_L, h, { align:"center", bold:true, underline:true });
  bdrDraw(doc, XS[3], y, W_GPA_L,  h, BR);  cellTxt(doc, lg, XS[3], y, W_GPA_L, h, { align:"center", bold:true, underline:true });
  bdrDraw(doc, XS[5], y, R1,       h, BL);
  bdrDraw(doc, XS[6], y, W_SUBJ_R, h, BNO); cellTxt(doc, "Grade Point Average", XS[6], y, W_SUBJ_R, h, { align:"center", bold:true, underline:true });
  bdrDraw(doc, XS[8], y, W_GPA_R,  h, BR);  cellTxt(doc, rg, XS[8], y, W_GPA_R, h, { align:"center", bold:true, underline:true });
}

function drawLastGpaRow(doc: jsPDF, y: number, leftGpa?: number|null) {
  const h = H_GPA;  // same height as a normal GPA row — H_END (2mm) is too small for text
  const lg = leftGpa != null ? leftGpa.toFixed(2) : "";
  bdrDraw(doc, XS[0], y, L1,       h, BBL);
  bdrDraw(doc, XS[1], y, W_SUBJ_L, h, BBo); cellTxt(doc, "Grade Point Average", XS[1], y, W_SUBJ_L, h, { align:"center", bold:true, underline:true });
  bdrDraw(doc, XS[3], y, W_GPA_L,  h, BBR); cellTxt(doc, lg, XS[3], y, W_GPA_L, h, { align:"center", bold:true, underline:true });
  bdrDraw(doc, XS[5], y, W_RIGHT,  h, BBLR); cellTxt(doc, "Transcript Closed", XS[5], y, W_RIGHT, h, { align:"center", bold:true });
}

// ── Info section (borderless) ─────────────────────────────────────────────────
const INFO_ROW_H = 5.5;  // mm per row

function drawInfoSection(doc: jsPDF, data: TranscriptModel, extra: TranscriptExtraInfo, y: number) {
  // 4-column layout matching Word infoTable widths (scaled to CW)
  // Word: 1750 + 3780 + 2050 + 3340 = 10920 twips
  const labelW  = 1750 * _cs;   // ~27.2mm
  const valueW  = 3780 * _cs;   // ~58.8mm
  const rLabelW = 2050 * _cs;   // ~31.9mm
  // rValueW fills the rest = CW - labelW - valueW - rLabelW

  const cols = [ML, ML+labelW, ML+labelW+valueW, ML+labelW+valueW+rLabelW, ML+CW];

  const rows: [string, string, string, string][] = [
    ["Name",           data.studentName  ?? "",    "Department",         data.departmentName ?? ""],
    ["Student ID",     data.studentCode  ?? "",    "Degree",             fmtDegree(data.degree)],
    ["Nationality",    extra.nationality ?? "",    "Major Subject",      data.majorName ?? ""],
    ["Date of Birth",  fmtDate(data.dateOfBirth),  "Date of Admission",  fmtDate(extra.dateOfAdmission)],
    ["Place of Birth", extra.placeOfBirth ?? "",   "Date of Graduation", fmtDate(extra.dateOfGraduation)],
  ];

  for (let i = 0; i < rows.length; i++) {
    const ry = y + i * INFO_ROW_H;
    const [lLbl, lVal, rLbl, rVal] = rows[i];
    // Labels & values — no borders
    cellTxt(doc, lLbl,      cols[0], ry, labelW,            INFO_ROW_H);
    cellTxt(doc, ": "+lVal, cols[1], ry, valueW,            INFO_ROW_H);
    cellTxt(doc, rLbl,      cols[2], ry, rLabelW,           INFO_ROW_H);
    cellTxt(doc, ": "+rVal, cols[3], ry, cols[4]-cols[3],   INFO_ROW_H);
  }
}

// ── Grade legend + signature ──────────────────────────────────────────────────
function drawBottom(doc: jsPDF, data: TranscriptModel, extra: TranscriptExtraInfo, y: number) {
  // Grade legend column widths proportional to W_LEFT
  // Template: [655, 508, 704, 965, 1728] / 4560 total DXA
  const legTotal = 4560;
  const legWidths = [655, 508, 704, 965, 1728].map(w => w / legTotal * W_LEFT);
  const legX: number[] = [ML];
  for (const w of legWidths) legX.push(legX[legX.length-1]+w);

  const H_GH = 300 * twip;   // 5.29mm header
  const H_GD = 220 * twip;   // 3.88mm data rows

  // Header row: "Grade" | "Mention" (spanning cols 2-5)
  const mentW = legWidths[1]+legWidths[2]+legWidths[3]+legWidths[4];
  fillCell(doc, legX[0], y, legWidths[0], H_GH, GRAY);
  bdrDraw(doc, legX[0], y, legWidths[0], H_GH, BALL);
  cellTxt(doc, "Grade",   legX[0], y, legWidths[0], H_GH, { align:"center", bold:true });

  fillCell(doc, legX[1], y, mentW, H_GH, GRAY);
  bdrDraw(doc, legX[1], y, mentW, H_GH, BALL);
  cellTxt(doc, "Mention", legX[1], y, mentW, H_GH, { align:"center", bold:true });

  // Data rows
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

  let gy = y + H_GH;
  for (const [grade, pts, pct, mention, sui] of gradeData) {
    for (let c = 0; c < 5; c++) {
      bdrDraw(doc, legX[c], gy, legWidths[c], H_GD, BBTM);
    }
    cellTxt(doc, grade,   legX[0], gy, legWidths[0], H_GD, { align:"center" });
    cellTxt(doc, pts,     legX[1], gy, legWidths[1], H_GD, { align:"center" });
    cellTxt(doc, pct,     legX[2], gy, legWidths[2], H_GD, { align:"center" });
    cellTxt(doc, mention, legX[3], gy, legWidths[3], H_GD);
    cellTxt(doc, sui,     legX[4], gy, legWidths[4], H_GD);
    gy += H_GD;
  }

  // Signature section (right half)
  const sigX  = ML + W_LEFT;
  const sigW  = W_RIGHT;
  const today = new Date();
  const city  = extra.issueCity ?? "Kampong Speu";
  const dateStr = `${city}, ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  // Vertical spacing: small top gap, then date, then ~10mm gap, then Director, then name
  const lineH = FS * 0.3528;
  const sigDateY = y + lineH + 4;          // baseline of date line
  const dirLabelY = sigDateY + 9.88;       // ≈ 560 twips gap
  const dirNameY  = dirLabelY + lineH + 1;

  doc.setFont(FONT, "normal");
  doc.setFontSize(FS);
  doc.setTextColor(0);
  doc.text(dateStr, sigX + sigW/2, sigDateY, { align: "center" });

  doc.setFont(FONT, "normal");
  doc.text("Director", sigX + sigW/2, dirLabelY, { align: "center" });

  doc.text(extra.directorName ?? "HONG Kimcheang, Ph.D", sigX + sigW/2, dirNameY, { align: "center" });
}

// ── Main export function ──────────────────────────────────────────────────────
export async function exportTranscriptToPDF(
  data: TranscriptModel,
  extra: TranscriptExtraInfo = {},
  filename?: string,
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = MT;

  // Check if there's space; if not, add a page (continuation pages have smaller top margin)
  const checkY = (needed: number) => {
    if (y + needed > PH - MB) {
      doc.addPage();
      y = 15;
      drawColHeader(doc, y);
      y += H_COL;
    }
  };

  // ── 1. Title ─────────────────────────────────────────────────────────────
  cellTxt(doc, "OFFICIAL TRANSCRIPT", ML, y, CW, FS_T * 0.3528 * 2.5,
    { align:"center", bold:true, fontSize:FS_T });
  y += FS_T * 0.3528 * 2.5 + 2;

  // ── 2. Student info ───────────────────────────────────────────────────────
  drawInfoSection(doc, data, extra, y);
  y += 5 * INFO_ROW_H + 2;

  // ── 3. Column header ──────────────────────────────────────────────────────
  drawColHeader(doc, y);
  y += H_COL;

  // ── 4. Course sections ────────────────────────────────────────────────────
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
      drawSemHeader(doc, y, semLabel(lSem), semLabel(rSem));
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
          ["Number of Credits Studied",      String(data.numberOfCreditsStudied ?? 0).padStart(2,"0")],
          ["Number of Credits Transferred",  String(data.numberOfCreditsTransferred ?? 0).padStart(2,"0")],
          ["Total Number of Credits Earned", String(data.totalNumberOfCreditsEarned ?? 0).padStart(2,"0")],
          ["Cumulative Grade Point Average",
            typeof data.cumulativeGradePointAverage === "number"
              ? data.cumulativeGradePointAverage.toFixed(2) : "---"],
        ];
        const sumStart   = Math.max(rC.length, 3);
        const rightTotal = sumStart + summaryItems.length + 1;
        const leftTotal  = lC.length + 1;
        const totalRows  = Math.max(leftTotal, rightTotal);

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

  // Fallback if no semesters
  if (yearPairs.length === 0) {
    checkY(H_SEM);
    drawSemHeader(doc, y, "", "");
    y += H_SEM;
  }

  // Last GPA / Transcript Closed row
  checkY(H_END);
  drawLastGpaRow(doc, y, lastLeftGpa);
  y += H_END;

  // ── 5. Grade legend + signature ────────────────────────────────────────────
  // Estimate bottom section height: 1 header row + 8 data rows
  const bottomH = (300 + 8 * 220) * twip + 20;
  checkY(bottomH);
  drawBottom(doc, data, extra, y);

  // ── Save ──────────────────────────────────────────────────────────────────
  const fname = filename
    ?? `${data.studentCode ?? "transcript"}_transcript_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fname);
}
