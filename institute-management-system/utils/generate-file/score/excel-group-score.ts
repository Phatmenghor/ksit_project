import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export interface GroupScoreSubject {
  courseCode: string;
  courseNameKH: string;
  credit: number;
}

export interface GroupScoreStudent {
  studentIdentityNumber: string;
  nameKhmer: string;
  gender: string;
  scores: Record<string, { score: number; grade: string }>;
}

export interface GroupScoreExportData {
  instituteName?: string;
  departmentName: string;
  majorName: string;
  yearLevel: string;
  semester: string;
  academicYear: number;
  classCode: string;
  subjects: GroupScoreSubject[];
  students: GroupScoreStudent[];
}

function semesterLabel(s: string): string {
  if (s === "SEMESTER_1") return "1st Semester";
  if (s === "SEMESTER_2") return "2nd Semester";
  return s;
}

function yearLevelLabel(y: string): string {
  const map: Record<string, string> = {
    FIRST_YEAR: "Year 1", SECOND_YEAR: "Year 2",
    THIRD_YEAR: "Year 3", FOURTH_YEAR: "Year 4",
  };
  return map[y] ?? y;
}

function genderLabel(g: string): string {
  const up = g?.toUpperCase();
  if (up === "MALE" || up === "M") return "ប្រុស";
  if (up === "FEMALE" || up === "F") return "ស្រី";
  return g ?? "";
}

function border(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

export async function exportGroupScoreToExcel(
  data: GroupScoreExportData,
  fileName?: string
): Promise<void> {
  const { departmentName, majorName, yearLevel, semester, academicYear, classCode, subjects, students } = data;

  const wb = new ExcelJS.Workbook();
  wb.creator = "KSIT";
  const ws = wb.addWorksheet("Scores");

  const FIXED = 4; // #, Student ID, Name, Gender
  const TAIL = 2;  // Total Pts, GPA
  const totalCols = FIXED + subjects.length * 2 + TAIL;

  // Column widths
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 14;
  ws.getColumn(3).width = 24;
  ws.getColumn(4).width = 7;
  for (let i = 0; i < subjects.length; i++) {
    ws.getColumn(FIXED + i * 2 + 1).width = 8;
    ws.getColumn(FIXED + i * 2 + 2).width = 7;
  }
  ws.getColumn(FIXED + subjects.length * 2 + 1).width = 11;
  ws.getColumn(FIXED + subjects.length * 2 + 2).width = 8;

  // Colors
  const BG_HEADER = "FF0F4C75";   // deep navy blue — clearly NOT black
  const BG_SUBHDR = "FF1A6FA8";   // medium blue for Score/Grade row
  const TXT_WHITE  = "FFFFFFFF";  // white — primary header text
  const TXT_YELLOW = "FFFDE68A";  // amber-200 — accent labels (Subject names, Total, GPA)
  const TXT_CYAN   = "FFB2EBF2";  // cyan-100 — Score / Grade sub-labels

  // ── Title block ──────────────────────────────────────────────────────────
  let row = 1;
  const lastColLetter = ws.getColumn(totalCols).letter;

  const mergeTitle = (r: number, val: string, bold = false, size = 11, color = "FF1E293B") => {
    const c = ws.getCell(`A${r}`);
    c.value = val;
    c.font = { bold, size, name: "Arial", color: { argb: color } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(r).height = 18;
    ws.mergeCells(`A${r}:${lastColLetter}${r}`);
  };

  mergeTitle(row++, data.instituteName ?? "KSIT Institute of Technology", true, 13, "FF0F4C75");
  mergeTitle(row++, `Department: ${departmentName}`, false, 11, "FF334155");
  mergeTitle(row++, `Score Report — ${semesterLabel(semester)} | ${majorName} ${yearLevelLabel(yearLevel)} | ${academicYear}–${academicYear + 1}`, true, 12, "FF0F4C75");
  mergeTitle(row++, `Class: ${classCode}`, false, 11, "FF334155");
  row++; // blank

  // ── Table header (2 rows) ────────────────────────────────────────────────
  const H1 = row;
  const H2 = row + 1;

  // Helper: style a cell THEN merge so ExcelJS reliably keeps the style
  const hCell = (addr: string, val: string, bg: string, txt: string, bold = true, size = 10, wrap = false, font = "Arial") => {
    const c = ws.getCell(addr);
    c.value = val;
    c.font = { bold, size, name: font, color: { argb: txt } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: wrap };
    border(c);
  };

  const KH = "Khmer OS"; // Khmer font shorthand

  const fixedHeaders: [string, string][] = [
    ["ល.រ", "Arial"], ["អត្តលេខ", KH], ["គោត្តនាមនិងនាម", KH], ["ភេទ", KH],
  ];
  fixedHeaders.forEach(([label, font], i) => {
    const col = i + 1;
    const letter = ws.getColumn(col).letter;
    hCell(`${letter}${H1}`, label, BG_HEADER, TXT_WHITE, true, 10, true, font);
    ws.mergeCells(`${letter}${H1}:${letter}${H2}`);
  });

  for (let i = 0; i < subjects.length; i++) {
    const subj = subjects[i];
    const sc = FIXED + i * 2 + 1;
    const gc = FIXED + i * 2 + 2;
    const sLetter = ws.getColumn(sc).letter;
    const gLetter = ws.getColumn(gc).letter;

    // H1: subject name + code (merged across Score + Grade cols), yellow accent text
    hCell(`${sLetter}${H1}`, `${subj.courseNameKH || subj.courseCode}\n${subj.courseCode} (${subj.credit}cr)`,
      BG_HEADER, TXT_YELLOW, true, 9, true, KH);
    ws.mergeCells(`${sLetter}${H1}:${gLetter}${H1}`);

    // H2: Score / Grade — cyan text on medium-blue
    hCell(`${sLetter}${H2}`, "Score", BG_SUBHDR, TXT_CYAN, true, 9);
    hCell(`${gLetter}${H2}`, "Grade", BG_SUBHDR, TXT_CYAN, true, 9);
  }

  // Total Pts + GPA (merged H1:H2), yellow accent
  const ptCol = FIXED + subjects.length * 2 + 1;
  const gpaCol = FIXED + subjects.length * 2 + 2;

  const ptLetter  = ws.getColumn(ptCol).letter;
  const gpaLetter = ws.getColumn(gpaCol).letter;
  hCell(`${ptLetter}${H1}`,  "ពិន្ទុសរុប", BG_HEADER, TXT_YELLOW, true, 10, true, KH);
  ws.mergeCells(`${ptLetter}${H1}:${ptLetter}${H2}`);
  hCell(`${gpaLetter}${H1}`, "GPA",        BG_HEADER, TXT_YELLOW, true, 10, true);
  ws.mergeCells(`${gpaLetter}${H1}:${gpaLetter}${H2}`);

  ws.getRow(H1).height = 30;
  ws.getRow(H2).height = 16;
  row += 2;

  // ── Student data rows ────────────────────────────────────────────────────
  const totalCredit = subjects.reduce((s, sub) => s + sub.credit, 0);

  students.forEach((student, idx) => {
    const r = row++;
    const even = idx % 2 === 0;
    const bgColor = even ? "FFFFFFFF" : "FFF0F7F4";

    const dataCell = (col: number, val: string | number, center = false, font = "Arial") => {
      const cell = ws.getCell(r, col);
      cell.value = val;
      cell.font = { size: 10, name: font };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.alignment = { vertical: "middle", horizontal: center ? "center" : "left", wrapText: false };
      border(cell);
    };

    let totalPts = 0;
    subjects.forEach((s) => {
      totalPts += (student.scores[s.courseCode]?.score ?? 0) * s.credit;
    });
    const gpa = totalCredit > 0 ? totalPts / totalCredit : 0;

    dataCell(1, idx + 1, true);
    dataCell(2, student.studentIdentityNumber);
    dataCell(3, student.nameKhmer, false, KH);
    dataCell(4, genderLabel(student.gender), true, KH);

    for (let i = 0; i < subjects.length; i++) {
      const subj = subjects[i];
      const entry = student.scores[subj.courseCode];
      const score = entry?.score ?? 0;
      const grade = entry?.grade ?? "I";
      const sc = FIXED + i * 2 + 1;
      const gc = FIXED + i * 2 + 2;

      dataCell(sc, score, true);

      const gradeCell = ws.getCell(r, gc);
      gradeCell.value = grade;
      gradeCell.font = {
        size: 10, name: "Arial",
        bold: grade === "F" || grade === "I",
        color: grade === "F" || grade === "I" ? { argb: "FF9C0006" } : { argb: "FF000000" },
      };
      gradeCell.fill = grade === "F" || grade === "I"
        ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } }
        : { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      gradeCell.alignment = { horizontal: "center", vertical: "middle" };
      border(gradeCell);
    }

    dataCell(ptCol, Math.round(totalPts * 100) / 100, true);
    dataCell(gpaCol, Math.round(gpa * 100) / 100, true);

    ws.getRow(r).height = 16;
  });

  // ── Grade summary ────────────────────────────────────────────────────────
  row++;
  const gradeCounts: Record<string, number> = { A: 0, "B+": 0, B: 0, "C+": 0, C: 0, F: 0, I: 0 };
  students.forEach((s) => {
    subjects.forEach((sub) => {
      const g = s.scores[sub.courseCode]?.grade ?? "I";
      if (g in gradeCounts) gradeCounts[g]++;
    });
  });

  const summaryLabel = ws.getCell(`A${row}`);
  summaryLabel.value = "Grade Distribution";
  summaryLabel.font = { bold: true, size: 10, name: "Arial", color: { argb: BG_HEADER } };
  summaryLabel.alignment = { horizontal: "center", vertical: "middle" };
  border(summaryLabel);
  ws.mergeCells(`A${row}:D${row}`);

  let col = 5;
  Object.entries(gradeCounts).forEach(([grade, count]) => {
    const lCell = ws.getCell(row, col);
    lCell.value = grade;
    lCell.font = { bold: true, size: 10, name: "Arial", color: { argb: TXT_YELLOW } };
    lCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BG_HEADER } };
    lCell.alignment = { horizontal: "center", vertical: "middle" };
    border(lCell);
    col++;
    const cCell = ws.getCell(row, col);
    cCell.value = count;
    cCell.font = { bold: true, size: 10, name: "Arial" };
    cCell.alignment = { horizontal: "center", vertical: "middle" };
    border(cCell);
    col++;
  });
  ws.getRow(row).height = 18;

  // ── Freeze header rows ───────────────────────────────────────────────────
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: H2, topLeftCell: `A${H2 + 1}` }];

  // ── Export ───────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, fileName ?? `group-score-${classCode}-${semester}-${academicYear}.xlsx`);
}
