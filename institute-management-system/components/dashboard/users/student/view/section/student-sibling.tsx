import React from "react";
import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";

interface StudentSiblingProps {
  student: StudentByIdModel | null;
}

interface SiblingRow {
  id?: number;
  name?: string;
  gender?: string;
  dateOfBirth?: string;
  occupation?: string;
  phoneNumber?: string;
}

export default function StudentSiblingTable({ student }: StudentSiblingProps) {
  const siblings = student?.studentSibling || [];

  const columns: Column<SiblingRow>[] = [
    { key: "name", header: "ឈ្មោះពេញ" },
    {
      key: "gender",
      header: "ភេទ",
      render: (row) =>
        row.gender === "MALE" ? "ប្រុស" : row.gender === "FEMALE" ? "ស្រី" : row.gender || "N/A",
    },
    {
      key: "dateOfBirth",
      header: "ថ្ងៃខែឆ្នាំកំណើត",
      render: (row) => (row.dateOfBirth ? formatDate(row.dateOfBirth) : "N/A"),
    },
    { key: "occupation", header: "មុខរបរ" },
    { key: "phoneNumber", header: "លេខទូរស័ព្ទ" },
  ];

  return (
    <div>
      <h4 className="font-semibold text-foreground border-b pb-1 mb-3">ព័ត៌មានបងប្អូន</h4>
      <CustomTable columns={columns} data={siblings} />
    </div>
  );
}
