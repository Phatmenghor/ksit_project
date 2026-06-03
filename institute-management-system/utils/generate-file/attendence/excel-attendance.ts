import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { AttendanceModel } from "@/model/attendance/attendance-get";

export const exportAttendanceToExcel = async (
  attendances: AttendanceModel[],
  fileName: string = "submitted-score.xlsx"
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Student Scores");

  // Define columns matching the SubmittedScoreModel interface
  worksheet.columns = [
    { header: "#", key: "no", width: 10 },
    { header: "Student ID", key: "studentId", width: 15 },
    { header: "Fullname", key: "studentName", width: 30 },
    { header: "Attendance", key: "status", width: 12 },
    { header: "Type", key: "attendanceType", width: 12 },
    { header: "Check-in Time", key: "recordedTime", width: 12 },
    { header: "Comment", key: "comment", width: 12 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  // Add student data rows
  attendances.forEach((attendance, index) => {
    worksheet.addRow({
      no: index + 1,
      studentId: attendance.studentId,
      studentName: attendance.studentName,
      status: attendance.status,
      attendanceType: attendance.attendanceType,
      recordedTime: attendance.recordedTime,
      comments: attendance.comment || "",
      createdAt: DateTimeFormatter(attendance.createdAt),
    });
  });

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" }, // Light gray background
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto-fit column widths (optional enhancement)
  worksheet.columns.forEach((column) => {
    if (column.key && column.key !== "comments") {
      let maxLength = 0;
      worksheet
        .getColumn(column.key)
        .eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
      worksheet.getColumn(column.key).width = Math.min(maxLength + 2, 50);
    }
  });

  // Generate and download the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};

// Enhanced version with additional formatting options
export const exportAttendanceToExcelAdvanced = async (
  attendances: AttendanceModel[],
  fileName: string = "attendances.xlsx",
  options?: {
    includeComments?: boolean;
    includeCreatedAt?: boolean;
    sheetName?: string;
    title?: string;
  }
) => {
  const {
    includeComments = true,
    includeCreatedAt = true,
    sheetName = "Student Attendance History",
    title,
  } = options || {};

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  let startRow = 1;

  // Add title if provided
  if (title) {
    worksheet.mergeCells("A1", "L1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    startRow = 3;
  }

  // Define columns based on options
  const columns = [
    { header: "#", key: "no", width: 10 },
    { header: "Student ID", key: "studentId", width: 15 },
    { header: "Fullname (KH)", key: "studentNameKhmer", width: 30 },
    { header: "Fullname (EN)", key: "studentNameEnglish", width: 30 },
    { header: "Gender", key: "gender", width: 15 },
    { header: "Birth Date", key: "dateOfBirth", width: 20 },
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

  worksheet.columns = columns;

  // Add headers at the appropriate row
  const headerRow = worksheet.getRow(startRow);
  columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
  });

  // Add student data
  attendances.forEach((attendance, index) => {
    const rowData: any = {
      no: index + 1,
      studentId: attendance.studentId,
      studentName: attendance.studentName,
      status: attendance.status,
      attendanceType: attendance.attendanceType,
      recordedTime: attendance.recordedTime,
      comments: attendance.comment || "",
      createdAt: DateTimeFormatter(attendance.createdAt),
    };

    if (includeComments) {
      rowData.comments = attendance.comment || "";
    }

    if (includeCreatedAt) {
      rowData.createdAt = DateTimeFormatter(attendance.createdAt);
    }

    worksheet.addRow(rowData);
  });

  // Style the header row
  const headerRowRef = worksheet.getRow(startRow);
  headerRowRef.font = { bold: true };
  headerRowRef.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };
  headerRowRef.alignment = { horizontal: "center", vertical: "middle" };

  // Add conditional formatting for grades
  const gradeColumnIndex = columns.findIndex((col) => col.key === "grade") + 1;
  if (gradeColumnIndex > 0) {
    const gradeRange = `${String.fromCharCode(64 + gradeColumnIndex)}${
      startRow + 1
    }:${String.fromCharCode(64 + gradeColumnIndex)}${
      startRow + attendances.length
    }`;

    worksheet.addConditionalFormatting({
      ref: gradeRange,
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
          },
        },
      ],
    });
  }

  // Add borders and formatting
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= startRow) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};
