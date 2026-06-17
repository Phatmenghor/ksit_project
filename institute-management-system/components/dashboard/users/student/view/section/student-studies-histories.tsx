import React from "react";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { educationLevels } from "@/constants/constant";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

interface StudentProfileProps {
  student: StudentByIdModel | null;
}

interface StudyHistoryRow {
  label: string;
  schoolName?: string;
  location?: string;
  yearRange?: string;
  obtainedCertificate?: string;
  overallGrade?: string;
}

export default function StudentStudyHistory({ student }: StudentProfileProps) {
  const rows: StudyHistoryRow[] = educationLevels.map(({ label, value }) => {
    const record = student?.studentStudiesHistory.find((s) => s.typeStudies === value);
    const yearRange =
      record?.fromYear || record?.endYear
        ? `${record?.fromYear ?? "N/A"} - ${record?.endYear ?? "N/A"}`
        : undefined;

    return {
      label,
      schoolName: record?.schoolName,
      location: record?.location,
      yearRange,
      obtainedCertificate: record?.obtainedCertificate,
      overallGrade: record?.overallGrade,
    };
  });

  const columns: Column<StudyHistoryRow>[] = [
    { key: "label", header: "កម្រិតថ្នាក់" },
    { key: "schoolName", header: "ឈ្មោះសាលារៀន" },
    { key: "location", header: "ខេត្ត/រាជធានី" },
    { key: "yearRange", header: "ឆ្នាំសិក្សា" },
    { key: "obtainedCertificate", header: "សញ្ញាប័ត្រទទួលបាន" },
    { key: "overallGrade", header: "និទ្ទេសរួម" },
  ];

  return (
    <CollapsibleCard title="ប្រវត្តិការសិក្សា">
      <CustomTable columns={columns} data={rows} />
    </CollapsibleCard>
  );
}
