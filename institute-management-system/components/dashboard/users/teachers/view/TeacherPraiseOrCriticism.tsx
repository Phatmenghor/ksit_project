import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherPraiseOrCriticism } from "@/model/user/staff/staff.request.model";
import React from "react";

interface TeacherProps {
  teacher: TeacherPraiseOrCriticism[] | null;
}

export default function TeacherPraiseOrCriticismSection({
  teacher,
}: TeacherProps) {
  const columns: Column<TeacherPraiseOrCriticism>[] = [
    {
      key: "typePraiseOrCriticism",
      header: "ប្រភេទ",
      render: (teacher: any) => `${teacher.typePraiseOrCriticism ?? "---"}`,
    },
    {
      key: "giveBy",
      header: "ផ្តល់ដោយ",
      render: (teacher: any) => `${teacher.giveBy ?? "---"}`,
    },
    {
      key: "dateAccepted",
      header: "កាលបរិច្ឆេទទទួល",
      render: (teacher: any) => `${teacher.dateAccepted ?? "---"}`,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3>ប្រវត្តិការងារបន្តបន្ទាប់</h3>
        <Separator />
        <CustomTable columns={columns} data={teacher ?? []} />
      </CardContent>
    </Card>
  );
}
