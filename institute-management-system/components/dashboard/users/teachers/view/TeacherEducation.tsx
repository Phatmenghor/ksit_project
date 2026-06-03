import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherEducation } from "@/model/user/staff/staff.request.model";
import React from "react";

interface TeacherProps {
  teacher: TeacherEducation[] | null;
}

export default function TeacherEducationSection({ teacher }: TeacherProps) {
  const columns: Column<TeacherEducation>[] = [
    {
      key: "culturalLevel",
      header: "កម្រិតវប្បធម៌​",
      render: (teacher: any) => `${teacher.culturalLevel ?? "---"}`,
    },
    {
      key: "skillName",
      header: "កម្រិតវប្បធម៌​",
      render: (teacher: any) => `${teacher.skillName ?? "---"}`,
    },
    {
      key: "dateAccepted",
      header: "កាលបរិច្ឆេទទទួល",
      render: (teacher: any) => `${teacher.dateAccepted ?? "---"}`,
    },
    {
      key: "country",
      header: "ប្រទេស",
      render: (teacher: any) => `${teacher.country ?? "---"}`,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3>កម្រិតវប្បធម៌</h3>
        <Separator />
        <CustomTable columns={columns} data={teacher ?? []} />
      </CardContent>
    </Card>
  );
}
