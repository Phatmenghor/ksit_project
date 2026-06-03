// academic-transcript-exporter.ts
import * as ExcelJS from "exceljs";
import {
  TranscriptModel,
  Semester,
  Course,
} from "@/model/request/request-transcript";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

/**
 * AcademicTranscriptExporter - Simplified Version
 * Clean header with comprehensive course details
 */
export class AcademicTranscriptExporter {
  private static readonly INSTITUTION_NAME =
    "Kampong Speu Institute of Technology";
  private static readonly FOOTER_NOTE =
    "This is an official academic transcript. Issued by Student Management System.";

  static async exportToExcel(
    transcriptData: TranscriptModel,
    studentDetail?: StudentByIdModel,
    filename?: string
  ): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Student Management System";
      workbook.created = new Date();
      workbook.modified = new Date();

      const exportFilename =
        (typeof filename === "string" && filename.trim()) ||
        `${transcriptData.studentCode ?? "student"}_transcript_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;

      await this.createTranscriptSheet(workbook, transcriptData, studentDetail);

      workbook.eachSheet((sheet) => {
        sheet.properties.defaultRowHeight = 18;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      this.downloadFile(buffer, exportFilename);
    } catch (err) {
      console.error("Error exporting academic transcript:", err);
      throw new Error("Failed to export academic transcript to Excel");
    }
  }

  private static async createTranscriptSheet(
    workbook: ExcelJS.Workbook,
    data: TranscriptModel,
    studentDetail?: StudentByIdModel
  ): Promise<void> {
    const ws = workbook.addWorksheet("Academic Transcript", {
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    let r = 1;

    // ========== INSTITUTION HEADER ==========
    ws.mergeCells(`A${r}:M${r}`);
    const instCell = ws.getCell(`A${r}`);
    instCell.value = this.INSTITUTION_NAME;
    instCell.style = {
      font: { name: "Arial", size: 16, bold: true },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    ws.getRow(r).height = 24;
    r++;

    // Title
    ws.mergeCells(`A${r}:M${r}`);
    const titleCell = ws.getCell(`A${r}`);
    titleCell.value = "OFFICIAL ACADEMIC TRANSCRIPT";
    titleCell.style = {
      font: { name: "Arial", size: 14, bold: true },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    ws.getRow(r).height = 22;
    r += 2;

    // ========== STUDENT INFORMATION (Complete Data) ==========
    const studentInfo: [string, string, string, string][] = [
      [
        "Student ID:",
        this.sanitizeValue(data.studentCode ?? "N/A"),
        "Student Name:",
        this.sanitizeValue(data.studentName ?? "N/A"),
      ],
      [
        "Date of Birth:",
        this.formatDate(data.dateOfBirth),
        "Class:",
        this.sanitizeValue(data.className ?? "N/A"),
      ],
      [
        "Department:",
        this.sanitizeValue(data.departmentName ?? "N/A"),
        "Major:",
        this.sanitizeValue(data.majorName ?? "N/A"),
      ],
      [
        "Degree Program:",
        this.sanitizeValue(data.degree ?? "N/A"),
        "Academic Status:",
        this.sanitizeValue(data.academicStatus ?? "N/A"),
      ],
      [
        "Credits Studied:",
        this.sanitizeValue((data.numberOfCreditsStudied ?? 0).toString()),
        "Credits Earned:",
        this.sanitizeValue((data.totalNumberOfCreditsEarned ?? 0).toString()),
      ],
      [
        "Credits Transferred:",
        this.sanitizeValue((data.numberOfCreditsTransferred ?? 0).toString()),
        "Cumulative GPA:",
        typeof data.cumulativeGradePointAverage === "number"
          ? data.cumulativeGradePointAverage.toFixed(2)
          : "N/A",
      ],
    ];

    for (const [label1, value1, label2, value2] of studentInfo) {
      ws.getCell(`A${r}`).value = label1;
      ws.getCell(`B${r}`).value = value1;
      ws.getCell(`E${r}`).value = label2;
      ws.getCell(`F${r}`).value = value2;

      ws.mergeCells(`B${r}:D${r}`);
      ws.mergeCells(`F${r}:M${r}`);

      // Label style
      ws.getCell(`A${r}`).style = {
        font: { name: "Arial", size: 11, bold: true },
        alignment: { horizontal: "right", vertical: "middle" },
      };
      ws.getCell(`E${r}`).style = {
        font: { name: "Arial", size: 11, bold: true },
        alignment: { horizontal: "right", vertical: "middle" },
      };

      // Value style
      ws.getCell(`B${r}`).style = {
        font: { name: "Arial", size: 11 },
        alignment: { horizontal: "left", vertical: "middle" },
      };
      ws.getCell(`F${r}`).style = {
        font: { name: "Arial", size: 11, bold: label2.includes("GPA") },
        alignment: { horizontal: "left", vertical: "middle" },
        fill: label2.includes("GPA")
          ? {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFE599" },
            }
          : undefined,
      };

      ws.getRow(r).height = 20;
      r++;
    }

    r += 1;

    // ========== GENERATION INFO ==========
    ws.mergeCells(`A${r}:M${r}`);
    const genInfoCell = ws.getCell(`A${r}`);
    genInfoCell.value = `Generated on: ${
      this.formatDate(data.generatedAt) || new Date().toLocaleDateString()
    }`;
    genInfoCell.style = {
      font: { name: "Arial", size: 9, italic: true },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    ws.getRow(r).height = 16;
    r += 2;

    // ========== DETAILED COURSE RECORDS BY SEMESTER ==========
    ws.mergeCells(`A${r}:M${r}`);
    const coursesHeaderCell = ws.getCell(`A${r}`);
    coursesHeaderCell.value = "DETAILED ACADEMIC RECORD";
    coursesHeaderCell.style = {
      font: {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      },
    };
    ws.getRow(r).height = 20;
    r += 2;

    // Process each semester
    for (let semIndex = 0; semIndex < data.semesters.length; semIndex++) {
      const sem = data.semesters[semIndex];

      // Semester Header
      ws.mergeCells(`A${r}:M${r}`);
      const semHeaderCell = ws.getCell(`A${r}`);
      semHeaderCell.value = this.sanitizeValue(
        `${sem.semesterName ?? sem.semester} - Academic Year ${sem.academyYear}`
      );
      semHeaderCell.style = {
        font: {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: "FFFFFFFF" },
        },
        alignment: { horizontal: "left", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF5B9BD5" },
        },
      };
      ws.getRow(r).height = 22;
      r++;

      // Course Table Header
      const headers = [
        "No.",
        "Course Code",
        "Course Name",
        "Credit",
        "Theory",
        "Practice",
        "Attendance",
        "Assignment",
        "Midterm",
        "Final",
        "Total",
        "Grade",
        "Points",
      ];

      headers.forEach((h, i) => {
        const cell = ws.getCell(r, i + 1);
        cell.value = this.sanitizeValue(h);
        cell.style = {
          font: {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: "FFFFFFFF" },
          },
          alignment: { horizontal: "center", vertical: "middle" },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2E75B6" },
          },
          border: {
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          },
        };
      });
      ws.getRow(r).height = 22;
      r++;

      // Course Data
      const courses = sem.courses ?? [];
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const rowIndex = r + i;

        const vals = [
          (i + 1).toString(),
          this.sanitizeValue(course.courseCode ?? "N/A"),
          this.sanitizeValue(course.courseName ?? "N/A"),
          this.sanitizeValue((course.credit ?? 0).toString()),
          this.sanitizeValue((course.theory ?? 0).toString()),
          this.sanitizeValue((course.execute ?? 0).toString()),
          course.attendanceScore?.toString() ?? "—",
          course.assignmentScore?.toString() ?? "—",
          course.midtermScore?.toString() ?? "—",
          course.finalScore?.toString() ?? "—",
          this.sanitizeValue(course.totalScore?.toString() ?? "N/A"),
          this.sanitizeValue(course.letterGrade ?? "N/A"),
          this.sanitizeValue(course.gradePoints?.toString() ?? "N/A"),
        ];

        vals.forEach((v, cIdx) => {
          const cell = ws.getCell(rowIndex, cIdx + 1);
          cell.value = v;
          cell.style = {
            font: { name: "Arial", size: 9 },
            alignment: {
              horizontal: cIdx === 2 ? "left" : "center",
              vertical: "middle",
            },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: i % 2 === 0 ? "FFFFFFFF" : "FFF8F9FA" },
            },
            border: {
              top: { style: "thin", color: { argb: "FFE0E0E0" } },
              left: { style: "thin", color: { argb: "FFE0E0E0" } },
              bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
              right: { style: "thin", color: { argb: "FFE0E0E0" } },
            },
          };
        });

        ws.getRow(rowIndex).height = 18;
      }

      r += courses.length;

      // Semester Summary Row
      ws.mergeCells(`A${r}:I${r}`);
      ws.getCell(`A${r}`).value = "Semester Summary";
      ws.getCell(`A${r}`).style = {
        font: { name: "Arial", size: 10, bold: true },
        alignment: { horizontal: "right", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE7E6E6" },
        },
      };

      ws.getCell(`J${r}`).value = `Credits: ${sem.totalCredits ?? 0}`;
      ws.getCell(`J${r}`).style = {
        font: { name: "Arial", size: 10, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE7E6E6" },
        },
      };

      ws.mergeCells(`K${r}:L${r}`);
      ws.getCell(`K${r}`).value = `GPA: ${
        typeof sem.gpa === "number" ? sem.gpa.toFixed(2) : "N/A"
      }`;
      ws.getCell(`K${r}`).style = {
        font: { name: "Arial", size: 10, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFE599" },
        },
      };

      ws.getCell(`M${r}`).value = `GPAX: ${
        typeof sem.gpax === "number" ? sem.gpax.toFixed(2) : "N/A"
      }`;
      ws.getCell(`M${r}`).style = {
        font: { name: "Arial", size: 10, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFE599" },
        },
      };

      ws.getRow(r).height = 20;
      r += 3;
    }

    // ========== COLUMN WIDTHS ==========
    ws.columns = [
      { width: 22 }, // A - No. / Labels (WIDER)
      { width: 18 }, // B - Course Code / Values
      { width: 35 }, // C - Course Name
      { width: 7 }, // D - Credit
      { width: 20 }, // E - Theory / Labels (WIDER)
      { width: 20 }, // F - Practice / Values
      { width: 10 }, // G - Attendance
      { width: 10 }, // H - Assignment
      { width: 9 }, // I - Midterm
      { width: 8 }, // J - Final
      { width: 8 }, // K - Total
      { width: 7 }, // L - Grade
      { width: 7 }, // M - Points
    ];

    r += 1;

    // ========== FOOTER ==========
    ws.mergeCells(`A${r}:M${r}`);
    const footerCell = ws.getCell(`A${r}`);
    footerCell.value = this.FOOTER_NOTE;
    footerCell.style = {
      font: { name: "Arial", size: 9, italic: true },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    r++;

    ws.mergeCells(`A${r}:M${r}`);
    const dateCell = ws.getCell(`A${r}`);
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.style = {
      font: { name: "Arial", size: 8 },
      alignment: { horizontal: "center", vertical: "middle" },
    };
  }

  // ========== HELPER METHODS ==========

  private static sanitizeValue(value: any): string {
    if (value === null || value === undefined) return "N/A";
    const str = String(value);
    return str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
      .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/g, "")
      .trim();
  }

  private static formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  }

  private static downloadFile(buffer: ExcelJS.Buffer, filename: string): void {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = this.sanitizeValue(filename);
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
