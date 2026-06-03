import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherExperience } from "@/model/user/staff/staff.request.model";
import React from "react";

interface TeacherProps {
  teacher: TeacherExperience[] | null;
}

export default function TeacherExperienceSection({ teacher }: TeacherProps) {
  const columns: Column<TeacherExperience>[] = [
    {
      key: "continuousEmployment",
      header: "Continuous Employment",
      render: (teacher: any) => `${teacher.continuousEmployment ?? "---"}`,
    },
    {
      key: "workPlace",
      header: "Workplace",
      render: (teacher: any) => `${teacher.workPlace ?? "---"}`,
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (teacher: any) => `${teacher.startDate ?? "---"}`,
    },
    {
      key: "endDate",
      header: "End Date",
      render: (teacher: any) => `${teacher.endDate ?? "---"}`,
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
