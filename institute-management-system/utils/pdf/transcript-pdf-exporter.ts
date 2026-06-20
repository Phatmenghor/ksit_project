import { jsPDF } from "jspdf";
import { TranscriptModel, Semester } from "@/model/request/request-transcript";

type RGB = [number, number, number];

export interface TranscriptExtraInfo {
  nationality?: string;
  placeOfBirth?: string;
  dateOfAdmission?: string;
  dateOfGraduation?: string;
  directorName?: string;
  issueCity?: string;
}

// ── Colors (matching the PDF template) ───────────────────────────────────────
const C = {
  darkBlue:  [31,  73, 125] as RGB,   // #1F497D — primary blue
  midBlue:   [68, 114, 196] as RGB,   // #4472C4 — label blue
  semBg:     [197, 217, 241] as RGB,  // #C5D9F1 — semester header bg
  gpaBg:     [242, 242, 242] as RGB,  // #F2F2F2 — GPA row bg
  white:     [255, 255, 255] as RGB,
  black:     [0,   0,   0  ] as RGB,
  gray:      [127, 127, 127] as RGB,
  lightGray: [200, 200, 200] as RGB,
  border:    [166, 166, 166] as RGB,
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const YEAR_ORDER = ["FIRST_YEAR","SECOND_YEAR","THIRD_YEAR","FOURTH_YEAR"];
const YEAR_LABELS: Record<string,string> = {
  FIRST_YEAR: "First Year", SECOND_YEAR: "Second Year",
  THIRD_YEAR: "Third Year", FOURTH_YEAR: "Fourth Year",
};
const SEM_LABELS: Record<string,string> = {
  SEMESTER_1: "1st Semester", SEMESTER_2: "2nd Semester",
};

function fmtDate(d?: string | null): string {
  if (!d) return "---";
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  } catch { return d; }
}

function fmtDegree(deg?: string): string {
  const m: Record<string,string> = {
    ASSOCIATE: "Associate in Technology",
    BACHELOR:  "Bachelor's Degree",
    MASTER:    "Master's Degree",
    DOCTOR:    "Doctor's Degree",
  };
  return deg ? (m[deg] ?? deg) : "---";
}

function sortSems(sems: Semester[]): Semester[] {
  const yO: Record<string,number> = { FIRST_YEAR:0, SECOND_YEAR:1, THIRD_YEAR:2, FOURTH_YEAR:3 };
  const sO: Record<string,number> = { SEMESTER_1:0, SEMESTER_2:1 };
  return [...sems].sort((a,b) => {
    const d = (yO[a.yearLevel]??9) - (yO[b.yearLevel]??9);
    return d !== 0 ? d : (sO[a.semester]??0) - (sO[b.semester]??0);
  });
}

// Group semesters by year, return year pairs: [(Y1, sems), (Y2, sems)]
function buildYearPairs(sems: Semester[]): [string, Semester[]][][] {
  const sorted = sortSems(sems);
  const groups: Record<string, Semester[]> = {};
  for (const s of sorted) (groups[s.yearLevel] ||= []).push(s);
  const years = YEAR_ORDER.filter(y => groups[y]?.length);
  const pairs: [string, Semester[]][][] = [];
  for (let i = 0; i < years.length; i += 2) {
    const row: [string, Semester[]][] = [[years[i], groups[years[i]]]];
    if (years[i+1]) row.push([years[i+1], groups[years[i+1]]]);
    pairs.push(row);
  }
  return pairs;
}

export async function exportTranscriptToPDF(
  data: TranscriptModel,
  extra: TranscriptExtraInfo = {},
  filename?: string
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW = 210, PH = 297;
  const ML = 13, MR = 13, MT = 10, MB = 12;
  const CW = PW - ML - MR;           // 184mm
  const HALF = (CW - 1) / 2;         // ~91.5mm each column
  const GAP = 1;

  // Column widths within each HALF (sum = HALF)
  const COL = { code: 18, name: 54, cr: 10, grade: 9 }; // 18+54+10+9 = 91

  let y = MT;

  // ── Drawing helpers ────────────────────────────────────────────────────────

  const setFont = (style: "normal"|"bold"|"italic", size: number, color: RGB = C.black) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const fillRect = (x: number, yy: number, w: number, h: number, color: RGB) => {
    doc.setFillColor(...color);
    doc.rect(x, yy, w, h, "F");
  };

  const strokeRect = (x: number, yy: number, w: number, h: number, lw = 0.25) => {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(lw);
    doc.rect(x, yy, w, h, "S");
  };

  const hLine = (x1: number, y1: number, x2: number, lw = 0.2) => {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(lw);
    doc.line(x1, y1, x2, y1);
  };

  const vLine = (x: number, y1: number, y2: number, lw = 0.2) => {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(lw);
    doc.line(x, y1, x, y2);
  };

  const txt = (text: string, x: number, yy: number, color: RGB = C.black, size = 7.5, style: "normal"|"bold" = "normal") => {
    setFont(style, size, color);
    doc.text(text, x, yy);
  };

  const centerTxt = (text: string, yy: number, color: RGB = C.black, size = 10, style: "normal"|"bold" = "bold") => {
    setFont(style, size, color);
    doc.text(text, PW / 2, yy, { align: "center" });
  };

  const truncate = (text: string, maxW: number): string => {
    setFont("normal", 7.5);
    let t = text;
    while (doc.getTextWidth(t) > maxW && t.length > 3) t = t.slice(0, -2) + "…";
    return t;
  };

  const checkPage = (needed: number) => {
    if (y + needed > PH - MB) { doc.addPage(); y = MT; }
  };

  // ── 1. HEADER — plain centered title, no background, no colored line ───────
  centerTxt("OFFICIAL ACADEMIC TRANSCRIPT", y + 5, C.black, 11, "bold");
  y += 10;
  hLine(ML, y, PW - MR, 0.4);
  y += 4;

  // ── 2. STUDENT INFO ────────────────────────────────────────────────────────
  const infoRowH = 5.5;
  const leftInfo: [string, string][] = [
    ["Name",           data.studentName ?? "---"],
    ["Student ID",     data.studentCode ?? "---"],
    ["Nationality",    extra.nationality ?? "---"],
    ["Date of Birth",  fmtDate(data.dateOfBirth)],
    ["Place of Birth", extra.placeOfBirth ?? "---"],
  ];
  const rightInfo: [string, string][] = [
    ["Department",        data.departmentName ?? "---"],
    ["Degree",            fmtDegree(data.degree)],
    ["Major",             data.majorName ?? "---"],
    ["Date of Admission", fmtDate(extra.dateOfAdmission)],
    ["Date of Graduation",fmtDate(extra.dateOfGraduation)],
  ];

  const infoTop = y;
  const labelW = 28;
  leftInfo.forEach(([label, value], i) => {
    const ry = y + i * infoRowH;
    txt(label + " :", ML + 1, ry + 4, C.midBlue, 7.5);
    txt(value, ML + labelW, ry + 4, C.black, 7.5);
    txt(rightInfo[i][0] + " :", ML + HALF + GAP + 1, ry + 4, C.midBlue, 7.5);
    txt(rightInfo[i][1], ML + HALF + GAP + labelW + 8, ry + 4, C.black, 7.5);
    if (i < leftInfo.length - 1) hLine(ML, ry + infoRowH, PW - MR);
  });
  strokeRect(ML, infoTop, CW, leftInfo.length * infoRowH, 0.3);
  vLine(ML + HALF + GAP / 2, infoTop, infoTop + leftInfo.length * infoRowH, 0.3);
  y += leftInfo.length * infoRowH + 3;

  // ── 3. COLUMN HEADER ROW — no background, plain bold text ─────────────────
  const colHdrH = 5;
  hLine(ML, y, PW - MR, 0.3);
  // Left half headers
  txt("Code",    ML + 1,                     y + 3.5, C.black, 7.5, "bold");
  txt("Subject", ML + COL.code + 1,           y + 3.5, C.black, 7.5, "bold");
  txt("Cr.",     ML + COL.code + COL.name + 1,y + 3.5, C.black, 7.5, "bold");
  txt("Grade",   ML + COL.code + COL.name + COL.cr + 1, y + 3.5, C.black, 7.5, "bold");
  // Right half headers
  const RX = ML + HALF + GAP;
  txt("Code",    RX + 1,                     y + 3.5, C.black, 7.5, "bold");
  txt("Subject", RX + COL.code + 1,           y + 3.5, C.black, 7.5, "bold");
  txt("Cr.",     RX + COL.code + COL.name + 1,y + 3.5, C.black, 7.5, "bold");
  txt("Grade",   RX + COL.code + COL.name + COL.cr + 1, y + 3.5, C.black, 7.5, "bold");
  y += colHdrH;
  hLine(ML, y, PW - MR, 0.3);

  // ── 4. YEAR PAIRS — Left = Year N, Right = Year N+1 ───────────────────────
  const yearPairs = buildYearPairs(data.semesters ?? []);

  const drawYearColumn = (sems: Semester[], sx: number, startY: number): number => {
    let cy = startY;
    for (const sem of sems) {
      const courses = sem.courses ?? [];
      const rowH = 4.5;

      // Semester header — light blue background
      fillRect(sx, cy, HALF, 5, C.semBg);
      txt(`${YEAR_LABELS[sem.yearLevel] ?? sem.yearLevel}   ${SEM_LABELS[sem.semester] ?? sem.semester}`, sx + 1, cy + 3.5, C.darkBlue, 7, "bold");
      cy += 5;

      // Course rows
      courses.forEach((course, i) => {
        fillRect(sx, cy, HALF, rowH, C.white);
        const code  = course.courseCode ?? "";
        const name  = truncate(course.courseName ?? "", COL.name - 1);
        const cr    = String(course.credit ?? "");
        const grade = String(course.letterGrade ?? "---");
        txt(code,  sx + 1,                              cy + 3.2, C.darkBlue, 7);
        txt(name,  sx + COL.code + 1,                   cy + 3.2, C.black, 7);
        txt(cr,    sx + COL.code + COL.name + 1,         cy + 3.2, C.black, 7);
        txt(grade, sx + COL.code + COL.name + COL.cr + 1,cy + 3.2, C.black, 7, "bold");
        cy += rowH;
      });

      // GPA row — light gray
      fillRect(sx, cy, HALF, 5, C.gpaBg);
      txt("Grade Point Average", sx + 1, cy + 3.5, C.black, 7, "bold");
      if (typeof sem.gpa === "number") {
        const gpaStr = sem.gpa.toFixed(2);
        setFont("bold", 7, C.black);
        const gw = doc.getTextWidth(gpaStr);
        doc.text(gpaStr, sx + HALF - gw - 1, cy + 3.5);
      }
      cy += 5;
    }
    return cy;
  };

  for (const pair of yearPairs) {
    // Estimate height needed
    const maxCourses = Math.max(
      ...pair.flatMap(([, sems]) => sems.map(s => (s.courses?.length ?? 0) + 2))
    );
    const estimH = maxCourses * 4.5 + pair[0][1].length * 10 + 10;
    checkPage(estimH);

    const startY = y;
    let maxEnd = startY;
    let sx = ML;
    for (const [, sems] of pair) {
      const endY = drawYearColumn(sems, sx, startY);
      maxEnd = Math.max(maxEnd, endY);
      sx += HALF + GAP;
    }

    // Draw border around whole pair row and divider
    strokeRect(ML, startY, CW, maxEnd - startY, 0.3);
    if (pair.length === 2) vLine(ML + HALF + GAP / 2, startY, maxEnd, 0.3);

    y = maxEnd;
    hLine(ML, y, PW - MR, 0.3);
    y += 2;
  }

  // ── 5. GRADE LEGEND + SUMMARY ─────────────────────────────────────────────
  checkPage(70);

  const BOTTOM_Y = y;
  const LEGEND_W = 84;
  const SUM_X = ML + LEGEND_W + 2;
  const SUM_W = CW - LEGEND_W - 2;

  // Grade legend header — dark blue
  const gradeData: [string,string,string,string][] = [
    ["A","4.00","85-100","Excellent"],
    ["B+","3.50","80-84","Very Good"],
    ["B","3.00","70-79","Good"],
    ["C+","2.50","65-69","Fairly Good"],
    ["C","2.00","60-64","Fair"],
    ["D","1.50","50-59","Poor"],
    ["E","1.00","40-49","Very Poor"],
    ["F","0.00","<40","Fail"],
  ];
  fillRect(ML, BOTTOM_Y, LEGEND_W, 5, C.darkBlue);
  txt("Grade",   ML + 2,  BOTTOM_Y + 3.5, C.white, 7.5, "bold");
  txt("Points",  ML + 14, BOTTOM_Y + 3.5, C.white, 7.5, "bold");
  txt("%",       ML + 30, BOTTOM_Y + 3.5, C.white, 7.5, "bold");
  txt("Mention", ML + 42, BOTTOM_Y + 3.5, C.white, 7.5, "bold");

  let legendY = BOTTOM_Y + 5;
  const grH = 4.5;
  gradeData.forEach(([g, pts, pct, ment]) => {
    fillRect(ML, legendY, LEGEND_W, grH, C.white);
    txt(g,    ML + 2,  legendY + 3.2, C.darkBlue, 7.5);
    txt(pts,  ML + 14, legendY + 3.2, C.black, 7.5);
    txt(pct,  ML + 30, legendY + 3.2, C.black, 7.5);
    txt(ment, ML + 42, legendY + 3.2, C.black, 7.5);
    legendY += grH;
  });
  legendY += 1;
  txt("S = SATISFACTORY",   ML + 2, legendY + 3, C.darkBlue, 7); legendY += 4;
  txt("U = UNSATISFACTORY", ML + 2, legendY + 3, C.darkBlue, 7); legendY += 4;
  txt("I = INCOMPLETE",     ML + 2, legendY + 3, C.darkBlue, 7); legendY += 4;
  strokeRect(ML, BOTTOM_Y, LEGEND_W, legendY - BOTTOM_Y, 0.3);

  // Summary
  const summaryItems: [string, string][] = [
    ["Number of Credits Studied",      String(data.numberOfCreditsStudied ?? 0).padStart(2,"0")],
    ["Number of Credits Transferred",  String(data.numberOfCreditsTransferred ?? 0).padStart(2,"0")],
    ["Total Number of Credits Earned", String(data.totalNumberOfCreditsEarned ?? 0).padStart(2,"0")],
    ["Cumulative Grade Point Average", typeof data.cumulativeGradePointAverage === "number"
      ? data.cumulativeGradePointAverage.toFixed(2) : "---"],
  ];

  let sumY = BOTTOM_Y;
  summaryItems.forEach(([label, value]) => {
    fillRect(SUM_X, sumY, SUM_W, 7, C.white);
    txt(label, SUM_X + 2, sumY + 4.5, C.midBlue, 7.5);
    setFont("bold", 8, C.black);
    const vw = doc.getTextWidth(value);
    doc.text(value, SUM_X + SUM_W - vw - 2, sumY + 5);
    hLine(SUM_X, sumY + 7, SUM_X + SUM_W, 0.15);
    sumY += 7;
  });

  // Transcript Closed
  sumY += 3;
  hLine(SUM_X, sumY, SUM_X + SUM_W, 0.4);
  sumY += 4.5;
  setFont("bold", 8.5, C.black);
  doc.text("Transcript Closed", SUM_X + SUM_W / 2, sumY, { align: "center" });
  sumY += 1.5;
  hLine(SUM_X, sumY, SUM_X + SUM_W, 0.4);

  // Signature
  sumY += 12;
  const today = new Date();
  const city = extra.issueCity ?? "Kampong Speu";
  const dateStr = `${city}, ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;
  setFont("normal", 7.5, C.black);
  doc.text(dateStr, SUM_X + SUM_W / 2, sumY, { align: "center" });
  sumY += 16;
  setFont("bold", 8, C.black);
  doc.text("Director", SUM_X + SUM_W / 2, sumY, { align: "center" });
  sumY += 4.5;
  setFont("normal", 7.5, C.black);
  doc.text(extra.directorName ?? "HARTH Bunhe, PhD", SUM_X + SUM_W / 2, sumY, { align: "center" });
  sumY += 4;
  strokeRect(SUM_X, BOTTOM_Y, SUM_W, sumY - BOTTOM_Y, 0.3);

  // Save
  const fname = filename ?? `${data.studentCode ?? "transcript"}_transcript_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fname);
}
