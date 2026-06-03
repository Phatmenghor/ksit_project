import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherShortCourse } from "@/model/user/staff/staff.request.model";
import React from "react";

interface TeacherProps {
  teacher: TeacherShortCourse[] | null;
}

export default function TeacherShortCourseSection({ teacher }: TeacherProps) {
  const columns: Column<TeacherShortCourse>[] = [
    {
      key: "skill",
      header: "ផ្នែក",
      render: (teacher: any) => `${teacher.skill ?? "---"}`,
    },
    {
      key: "skillName",
      header: "ឈ្មោះជំនាញ",
      render: (teacher: any) => `${teacher.skillName ?? "---"}`,
    },
    {
      key: "startDate",
      header: "ថ្ងៃចាប់ផ្តើម",
      render: (teacher: any) => `${teacher.startDate ?? "---"}`,
    },
    {
      key: "endDate",
      header: "ថ្ងៃបញ្ចប់",
      render: (teacher: any) => `${teacher.endDate ?? "---"}`,
    },
    {
      key: "duration",
      header: "រយៈពេល",
      render: (teacher: any) => `${teacher.duration ?? "---"}`,
    },
    {
      key: "preparedBy",
      header: "រៀបចំដោយ",
      render: (teacher: any) => `${teacher.preparedBy ?? "---"}`,
    },
    {
      key: "supportBy",
      header: "គាំទ្រដោយ",
      render: (teacher: any) => `${teacher.supportBy ?? "---"}`,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3>វគ្គខ្លីៗ</h3>
        <Separator />
        <CustomTable columns={columns} data={teacher ?? []} />
      </CardContent>
    </Card>
  );
}
