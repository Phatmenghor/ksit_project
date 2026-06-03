import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { saveAs } from "file-saver";
// utils/excel.util.ts
import ExcelJS from "exceljs";
import { StudentResponse } from "@/model/user/student/student.respond.model";

export const exportStudentsToExcel = async (
  students: StudentResponse[],
  fileName: string = "students.xlsx"
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Students");

  worksheet.columns = [
    { header: "Id", key: "id", width: 10 },
    { header: "Username", key: "username", width: 30 },
    { header: "Identify Number", key: "identifyNumber", width: 30 },
    { header: "Password", key: "password", width: 30 },
    { header: "classCode", key: "classCode", width: 30 },
    { header: "createdAt", key: "createdAt", width: 40 },
  ];

  students.forEach((student, index) => {
    worksheet.addRow({
      no: index + 1,
      id: student.id,
      username: student.username,
      identifyNumber: student.identifyNumber,
      password: student.password,
      classCode: student.classCode,
      createdAt: DateTimeFormatter(student.createdAt),
    });
  });

  // Optional: make headers bold
  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};
