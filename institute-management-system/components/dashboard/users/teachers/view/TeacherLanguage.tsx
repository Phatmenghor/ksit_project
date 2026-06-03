import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherLanguage } from "@/model/user/staff/staff.request.model";
import React from "react";

interface TeacherProps {
  teacher: TeacherLanguage[] | null;
}

export default function TeacherLanguageSection({ teacher }: TeacherProps) {
  const columns: Column<TeacherLanguage>[] = [
    {
      key: "language",
      header: "ភាសា",
      render: (teacher: any) => `${teacher.language ?? "---"}`,
    },
    {
      key: "reading",
      header: "ការអាន",
      render: (teacher: any) => `${teacher.reading ?? "---"}`,
    },
    {
      key: "writing",
      header: "ការសរសេរ",
      render: (teacher: any) => `${teacher.writing ?? "---"}`,
    },
    {
      key: "speaking",
      header: "ការសន្ទនា",
      render: (teacher: any) => `${teacher.speaking ?? "---"}`,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3>ភាសាបរទេស</h3>
        <Separator />
        <CustomTable columns={columns} data={teacher ?? []} />
      </CardContent>
    </Card>
  );
}
