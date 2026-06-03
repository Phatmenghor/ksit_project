import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { StudentScoreModel } from "@/model/score/student-score/student-score.response";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Constants
const COLORS = {
  HEADER_BG: [0, 100, 0] as [number, number, number],
  HEADER_TEXT: [255, 255, 255] as [number, number, number],
  BORDER: [0, 0, 0] as [number, number, number],
  GRADE_COLORS: {
    A: [144, 238, 144] as [number, number, number], // Light green
    B: [173, 216, 230] as [number, number, number], // Light blue
    F: [255, 182, 193] as [number, number, number], // Light pink
  },
};

const FONT_SIZES = {
  TITLE: 18,
  SUBTITLE: 12,
  HEADER_INFO: 10,
  TABLE_HEADER: 9,
  TABLE_BODY: 8,
  FOOTER: 8,
};

const SPACING = {
  MARGIN: 15,
  LINE_HEIGHT: 5,
  SECTION_GAP: 10,
  SIGNATURE_GAP: 20,
};

// Types
export interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  includeComments?: boolean;
  includeCreatedAt?: boolean;
  orientation?: "portrait" | "landscape";
  pageSize?: "a4" | "a3" | "letter";
  showGradeColors?: boolean;
  courseName?: string;
  semester?: string;
  receiverName?: string;
  courseCode?: string;
  credit?: number;
  instructor?: string;
  totalStudent?: number;
  yearOfStudy?: string;
  department?: string;
  major?: string;
  degree?: string;
  levelYear?: string | number;
}

interface TableColumn {
  header: string;
  dataKey: string;
}

interface HeaderInfo {
  title: string;
  subtitle?: string;
  courseName?: string;
  semester?: string;
  courseCode?: string;
  credit?: number;
  instructor?: string;
  totalStudent?: number;
  yearOfStudy?: string;
  department?: string;
  major?: string;
  degree?: string;
  levelYear?: number;
}

// PDF Document Class
class StudentScorePDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private options: Required<PDFExportOptions>;

  constructor(options: PDFExportOptions) {
    this.options = this.setDefaultOptions(options);
    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: "mm",
      format: this.options.pageSize,
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.doc.setFont("helvetica");
  }

  private setDefaultOptions(
    options: PDFExportOptions
  ): Required<PDFExportOptions> {
    return {
      title: "Student Score Report",
      subtitle: "",
      includeComments: true,
      includeCreatedAt: false,
      orientation: "landscape",
      pageSize: "a4",
      showGradeColors: true,
      courseName: "",
      semester: "",
      receiverName: "",
      courseCode: "",
      credit: 0,
      instructor: "",
      totalStudent: 0,
      yearOfStudy: "",
      department: "",
      major: "",
      degree: "",
      levelYear: 0,
      ...options,
    };
  }

  public async generatePDF(
    students: StudentScoreModel[],
    fileName: string
  ): Promise<void> {
    let yPosition = SPACING.MARGIN;

    // Add header
    yPosition = this.addHeader(yPosition);

    // Prepare and add table
    const columns = this.prepareTableColumns();
    const tableData = this.prepareTableData(students, columns);
    const tableEndY = await this.addTable(columns, tableData, yPosition);

    // Add signature section
    this.addSignatureSection(tableEndY);

    // Save PDF
    this.doc.save(fileName);
  }

  private addHeader(startY: number): number {
    let yPosition = startY;

    // Main title
    this.doc.setFontSize(FONT_SIZES.TITLE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.options.title, this.pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += SPACING.SECTION_GAP;

    // Subtitle
    if (this.options.subtitle) {
      this.doc.setFontSize(FONT_SIZES.SUBTITLE);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(this.options.subtitle, this.pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 8;
    }

    // Course information
    yPosition = this.addCourseInfo(yPosition);

    // Add separator line
    this.doc.setLineWidth(0.5);
    this.doc.line(
      SPACING.MARGIN,
      yPosition,
      this.pageWidth - SPACING.MARGIN,
      yPosition
    );

    return yPosition + SPACING.LINE_HEIGHT;
  }

  private addCourseInfo(startY: number): number {
    this.doc.setFontSize(FONT_SIZES.HEADER_INFO);
    this.doc.setFont("helvetica", "normal");

    const leftInfo = this.getLeftHeaderInfo();
    const rightInfo = this.getRightHeaderInfo();

    // Add left column info
    leftInfo.forEach((info, index) => {
      this.doc.text(info, SPACING.MARGIN, startY + index * SPACING.LINE_HEIGHT);
    });

    // Add right column info
    rightInfo.forEach((info, index) => {
      this.doc.text(
        info,
        this.pageWidth - SPACING.MARGIN,
        startY + index * SPACING.LINE_HEIGHT,
        { align: "right" }
      );
    });

    return (
      startY +
      Math.max(leftInfo.length, rightInfo.length) * SPACING.LINE_HEIGHT +
      SPACING.LINE_HEIGHT
    );
  }

  private getLeftHeaderInfo(): string[] {
    const info: string[] = [];

    if (this.options.courseName)
      info.push(`Course: ${this.options.courseName}`);
    if (this.options.courseCode)
      info.push(`Course Code: ${this.options.courseCode}`);
    if (this.options.credit) info.push(`Credit: ${this.options.credit}`);
    if (this.options.instructor)
      info.push(`Instructor: ${this.options.instructor}`);
    if (this.options.totalStudent)
      info.push(`Total Student: ${this.options.totalStudent}`);
    if (this.options.yearOfStudy)
      info.push(`Year of Study: ${this.options.yearOfStudy}`);

    return info;
  }

  private getRightHeaderInfo(): string[] {
    const info: string[] = [];

    if (this.options.department)
      info.push(`Department: ${this.options.department}`);
    if (this.options.major) info.push(`Major: ${this.options.major}`);
    if (this.options.degree) info.push(`Degree: ${this.options.degree}`);
    if (this.options.levelYear)
      info.push(`Level year: ${this.options.levelYear}`);
    if (this.options.semester) info.push(`Semester: ${this.options.semester}`);

    return info;
  }

  private prepareTableColumns(): TableColumn[] {
    const columns: TableColumn[] = [
      { header: "#", dataKey: "no" },
      { header: "Student ID", dataKey: "studentId" },
      { header: "Name (KH)", dataKey: "studentNameKhmer" },
      { header: "Name (EN)", dataKey: "studentNameEnglish" },
      { header: "Gender", dataKey: "gender" },
      { header: "DateOfBirth", dataKey: "dateOfBirth" },
      { header: "Attend.", dataKey: "attendanceScore" },
      { header: "Assign.", dataKey: "assignmentScore" },
      { header: "Midterm", dataKey: "midtermScore" },
      { header: "Final", dataKey: "finalScore" },
      { header: "Total", dataKey: "totalScore" },
      { header: "Grade", dataKey: "grade" },
    ];

    if (this.options.includeComments) {
      columns.push({ header: "Comments", dataKey: "comments" });
    }

    if (this.options.includeCreatedAt) {
      columns.push({ header: "Created", dataKey: "createdAt" });
    }

    return columns;
  }

  private prepareTableData(
    students: StudentScoreModel[],
    columns: TableColumn[]
  ): any[] {
    return students.map((student, index) => {
      const rowData: any = {
        no: index + 1,
        studentId: student.studentId,
        studentNameKhmer: student.studentNameKhmer || "-",
        studentNameEnglish: student.studentNameEnglish || "-",
        gender: student.gender || "-",
        dateOfBirth: student.dateOfBirth || "-",
        attendanceScore: student.attendanceScore,
        assignmentScore: student.assignmentScore,
        midtermScore: student.midtermScore,
        finalScore: student.finalScore,
        totalScore: student.totalScore,
        grade: student.grade,
      };

      if (this.options.includeComments) {
        rowData.comments = student.comments || "-";
      }

      if (this.options.includeCreatedAt) {
        rowData.createdAt = DateTimeFormatter(student.createdAt);
      }

      return rowData;
    });
  }

  private async addTable(
    columns: TableColumn[],
    tableData: any[],
    startY: number
  ): Promise<number> {
    let tableEndY = startY;

    autoTable(this.doc, {
      startY: startY,
      head: [columns.map((col) => col.header)],
      body: tableData.map((row) => columns.map((col) => row[col.dataKey])),
      theme: "grid",
      styles: {
        fontSize:
          this.options.orientation === "landscape" ? FONT_SIZES.TABLE_BODY : 7,
        cellPadding: 2,
        lineColor: COLORS.BORDER,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.HEADER_BG,
        textColor: COLORS.HEADER_TEXT,
        fontStyle: "bold",
        fontSize:
          this.options.orientation === "landscape"
            ? FONT_SIZES.TABLE_HEADER
            : 8,
      },
      columnStyles: this.getColumnStyles(),
      didParseCell: (data: any) => this.handleCellParsing(data),
      didDrawPage: (data: any) => {
        tableEndY = data.cursor.y;
        this.addPageFooter(data.pageNumber);
      },
    });

    return tableEndY;
  }

  private getColumnStyles() {
    return {
      0: { halign: "center" as const }, // #
      4: { halign: "center" as const }, // Gender
      5: { halign: "center" as const }, // Date of Birth
      6: { halign: "center" as const }, // Attendance
      7: { halign: "center" as const }, // Assignment
      8: { halign: "center" as const }, // Midterm
      9: { halign: "center" as const }, // Final
      10: { halign: "center" as const }, // Total
      11: { halign: "center" as const, fontStyle: "bold" as const }, // Grade
    };
  }

  private handleCellParsing(data: any): void {
    if (this.options.showGradeColors && data.column.dataKey === "grade") {
      const grade = data.cell.text[0];

      if (grade === "A" || grade === "A+") {
        data.cell.styles.fillColor = COLORS.GRADE_COLORS.A;
      } else if (grade === "F") {
        data.cell.styles.fillColor = COLORS.GRADE_COLORS.F;
      } else if (grade === "B" || grade === "B+") {
        data.cell.styles.fillColor = COLORS.GRADE_COLORS.B;
      }
    }
  }

  private addPageFooter(pageNumber: number): void {
    this.doc.setFontSize(FONT_SIZES.FOOTER);
    this.doc.setFont("helvetica", "normal");

    // Generated timestamp
    const now = new Date();
    const dateStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    this.doc.text(
      `Generated: ${dateStr}`,
      SPACING.MARGIN,
      this.pageHeight - 10
    );

    // Page number
    this.doc.text(
      `Page ${pageNumber}`,
      this.pageWidth - SPACING.MARGIN,
      this.pageHeight - 10,
      {
        align: "right",
      }
    );
  }

  private addSignatureSection(startY: number): void {
    const rightStartX = this.pageWidth - 120;
    let yPos = startY + SPACING.SIGNATURE_GAP;

    this.doc.setFontSize(FONT_SIZES.HEADER_INFO);
    this.doc.setFont("helvetica", "normal");

    const now = new Date();
    const year = now.getFullYear();

    // Date section
    this.doc.text(
      `Date: Day.................. Month.................. Year ${year}`,
      rightStartX,
      yPos
    );

    yPos += SPACING.SECTION_GAP;

    // Receiver section
    this.doc.text("Receiver", rightStartX + 40, yPos);

    yPos += SPACING.SECTION_GAP;

    // Signature line
    this.doc.text(
      "....................................",
      rightStartX + 30,
      yPos
    );
  }
}

// Main export function (maintains backward compatibility)
export const exportSubmissionStudentsToPDF = async (
  students: StudentScoreModel[],
  fileName: string = "submitted-score.pdf",
  options: PDFExportOptions = {}
): Promise<void> => {
  const generator = new StudentScorePDFGenerator(options);
  await generator.generatePDF(students, fileName);
};

// Advanced PDF export with multiple sheets/sections
export const exportStudentsToPDFAdvanced = async (
  students: StudentScoreModel[],
  fileName: string = "detailed-score-report.pdf",
  options: PDFExportOptions & {
    includeCharts?: boolean;
    includeIndividualPages?: boolean;
    groupByGrade?: boolean;
  } = {}
): Promise<void> => {
  const {
    includeCharts = false,
    includeIndividualPages = false,
    groupByGrade = false,
    ...baseOptions
  } = options;

  // For now, use the base export function
  // This can be extended in the future for advanced features
  await exportSubmissionStudentsToPDF(students, fileName, baseOptions);
  console.log("Advanced PDF export completed");
};
