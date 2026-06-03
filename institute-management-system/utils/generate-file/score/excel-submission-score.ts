// excel.ts - Add this NEW function to your existing excel.ts file
// Keep all your existing functions (exportApprovedStudentsToExcel, exportApprovedStudentsToExcelAdvanced)
// and add this new one below them

import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { StudentScoreModel } from "@/model/score/student-score/student-score.response";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";

// NEW FUNCTION - Add this to your existing excel.ts
export const exportApprovedStudentsToExcelWithSchedule = async (
  students: StudentScoreModel[],
  schedule: ScheduleModel,
  fileName: string = "student-scores.xlsx",
  options?: {
    includeComments?: boolean;
    includeCreatedAt?: boolean;
  }
) => {
  const { includeComments = true, includeCreatedAt = false } = options || {};

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Student Scores");

  let currentRow = 1;

  // ============ SCHEDULE HEADER SECTION ============

  // Title Row
  worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = "STUDENT SCORE REPORT";
  titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2C3E50" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(currentRow).height = 30;
  currentRow++;

  currentRow++; // Spacing

  // Helper function to add table-style info rows
  const addTableInfoRow = (label: string, value: string) => {
    const row = worksheet.getRow(currentRow);

    // Label cell (Column A)
    const labelCell = row.getCell(1);
    labelCell.value = label;
    labelCell.font = { bold: true, size: 11 };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF34495E" },
    };
    labelCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    labelCell.alignment = { horizontal: "left", vertical: "middle" };
    labelCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Value cell (Columns B-F merged)
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    const valueCell = row.getCell(2);
    valueCell.value = value;
    valueCell.alignment = { horizontal: "left", vertical: "middle" };
    valueCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    row.height = 20;
    currentRow++;
  };

  // Course Information Table
  addTableInfoRow("Course Code", schedule.course.code);
  addTableInfoRow("Course Name (EN)", schedule.course.nameEn);
  addTableInfoRow("Course Name (KH)", schedule.course.nameKH);
  addTableInfoRow(
    "Credit",
    `${schedule.course.credit} credits (Theory: ${schedule.course.theory}h, Execute: ${schedule.course.execute}h, Apply: ${schedule.course.apply}h)`
  );

  currentRow++; // Spacing

  // Class Information Table
  addTableInfoRow("Class Code", schedule.classes.code);
  addTableInfoRow(
    "Year Level",
    schedule.yearLevel || schedule.classes.yearLevel
  );
  addTableInfoRow("Degree", schedule.classes.degree);
  addTableInfoRow("Major", schedule.classes.major.name);
  addTableInfoRow("Department", schedule.course.department.name);

  currentRow++; // Spacing

  // Schedule Information Table
  addTableInfoRow("Day", schedule.day);
  addTableInfoRow("Time", `${schedule.startTime} - ${schedule.endTime}`);
  addTableInfoRow("Room", schedule.room.name);
  addTableInfoRow("Status", schedule.status);

  currentRow++; // Spacing

  // Semester Information Table
  addTableInfoRow(
    "Semester",
    `${schedule.semester.semester} (${schedule.semester.semesterType})`
  );
  addTableInfoRow("Academy Year", schedule.semester.academyYear.toString());
  addTableInfoRow(
    "Semester Period",
    `${schedule.semester.startDate} to ${schedule.semester.endDate}`
  );

  currentRow++; // Spacing

  // Teacher Information Table
  const teacherName = schedule.teacher.englishFirstName
    ? `${schedule.teacher.englishFirstName} ${
        schedule.teacher.englishLastName || ""
      }`
    : schedule.teacher.username;
  addTableInfoRow("Instructor", teacherName);
  addTableInfoRow("Staff ID", schedule.teacher.staffId || "N/A");

  currentRow++; // Spacing

  // Summary Information Table
  addTableInfoRow("Total Students", students.length.toString());
  addTableInfoRow("Export Date", new Date().toLocaleString());

  currentRow++;

  currentRow += 2; // Extra spacing before table

  // ============ STUDENT SCORES TABLE ============

  const headerRow = currentRow;

  // Define columns
  const columns = [
    { header: "#", key: "no", width: 8 },
    { header: "Student ID", key: "studentId", width: 15 },
    { header: "Fullname (KH)", key: "studentNameKhmer", width: 25 },
    { header: "Fullname (EN)", key: "studentNameEnglish", width: 25 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Birth Date", key: "dateOfBirth", width: 15 },
    { header: "Attendance", key: "attendanceScore", width: 12 },
    { header: "Assignment", key: "assignmentScore", width: 12 },
    { header: "Midterm", key: "midtermScore", width: 12 },
    { header: "Final", key: "finalScore", width: 12 },
    { header: "Total", key: "totalScore", width: 12 },
    { header: "Grade", key: "grade", width: 10 },
  ];

  if (includeComments) {
    columns.push({ header: "Comments", key: "comments", width: 30 });
  }

  if (includeCreatedAt) {
    columns.push({ header: "Created At", key: "createdAt", width: 20 });
  }

  // Set column widths
  columns.forEach((col, index) => {
    worksheet.getColumn(index + 1).width = col.width;
  });

  // Add headers
  const headerRowRef = worksheet.getRow(headerRow);
  columns.forEach((col, index) => {
    const cell = headerRowRef.getCell(index + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF34495E" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
  headerRowRef.height = 25;

  // Add student data
  students.forEach((student, index) => {
    currentRow++;
    const row = worksheet.getRow(currentRow);

    const rowData: any[] = [
      index + 1,
      student.studentIdentityNumber,
      student.studentNameKhmer,
      student.studentNameEnglish,
      student.gender,
      student.dateOfBirth,
      student.attendanceScore,
      student.assignmentScore,
      student.midtermScore,
      student.finalScore,
      student.totalScore,
      student.grade,
    ];

    if (includeComments) {
      rowData.push(student.comments || "");
    }

    if (includeCreatedAt) {
      rowData.push(DateTimeFormatter(student.createdAt));
    }

    rowData.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Center align numeric columns
      if (colIndex >= 6 && colIndex <= 11) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Zebra striping for better readability
      if (index % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8F9FA" },
        };
      }
    });
  });

  // Grade color coding
  const gradeColumnIndex = columns.findIndex((col) => col.key === "grade") + 1;
  if (gradeColumnIndex > 0) {
    const gradeStartRow = headerRow + 1;
    const gradeEndRow = headerRow + students.length;
    const gradeColumn = String.fromCharCode(64 + gradeColumnIndex);

    worksheet.addConditionalFormatting({
      ref: `${gradeColumn}${gradeStartRow}:${gradeColumn}${gradeEndRow}`,
      rules: [
        {
          type: "cellIs",
          operator: "equal",
          formulae: ['"A"'],
          priority: 1,
          style: {
            fill: {
              type: "pattern",
              pattern: "solid",
              bgColor: { argb: "FF90EE90" },
            },
            font: { bold: true, color: { argb: "FF006400" } },
          },
        },
        {
          type: "cellIs",
          operator: "equal",
          formulae: ['"F"'],
          priority: 2,
          style: {
            fill: {
              type: "pattern",
              pattern: "solid",
              bgColor: { argb: "FFFF6B6B" },
            },
            font: { bold: true, color: { argb: "FF8B0000" } },
          },
        },
      ],
    });
  }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};
