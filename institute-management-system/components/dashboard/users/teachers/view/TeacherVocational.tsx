import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherVocational } from "@/model/user/staff/staff.request.model";
import React from "react";

interface TeacherProps {
  teacher: TeacherVocational[] | null;
}

export default function TeacherVocationalSection({ teacher }: TeacherProps) {
  const columns: Column<TeacherVocational>[] = [
    {
      key: "culturalLevel",
      header: "កម្រិតវិជ្ជាជីវៈ",
      render: (teacher: any) => `${teacher.culturalLevel ?? "---"}`,
    },
    {
      key: "skillOne",
      header: "ឧកទេសទី១",
      render: (teacher: any) => `${teacher.skillOne ?? "---"}`,
    },
    {
      key: "skillTwo",
      header: "ឧកទេសទី២",
      render: (teacher: any) => `${teacher.skillTwo ?? "---"}`,
    },
    {
      key: "trainingSystem",
      header: "ប្រព័ន្ធបណ្តុះបពណ្តាល",
      render: (teacher: any) => `${teacher.trainingSystem ?? "---"}`,
    },
    {
      key: "dateAccepted",
      header: "ថ្ងៃខែបានទទួល",
      render: (teacher: any) => `${teacher.dateAccepted ?? "---"}`,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3>វគ្គគរុកោសល្យ</h3>
        <Separator />
        <CustomTable columns={columns} data={teacher ?? []} />
      </CardContent>
    </Card>
  );
}
