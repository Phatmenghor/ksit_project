import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React from "react";
import InfoGrid from "../../shared/user-personal-history";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { TeacherFamily } from "@/model/user/staff/staff.request.model";

interface TeacherProps {
  teacher: TeacherFamily[] | null;
  familyStatus: StaffRespondModel | null;
}

export default function TeacherFamilySection({ teacher, familyStatus }: TeacherProps) {
  const infoItems = [
    { label: "ស្ថានភាពគ្រួស", value: familyStatus?.maritalStatus },
    { label: "ត្រូវជា", value: familyStatus?.mustBe },
    { label: "មុខរបរសហព័ទ្ធ", value: familyStatus?.affiliatedProfession },
    { label: "ឈ្មោះសហព័ទ្ធ", value: familyStatus?.federationName },
    { label: "អង្គភាពសហព័ទ្ធ", value: familyStatus?.affiliatedOrganization },
    { label: "ថ្ងៃខែឆ្នាំកំណើតសហព័ទ្ធ", value: familyStatus?.federationEstablishmentDate },
    { label: "ប្រាក់ខែប្រពន្ធ", value: familyStatus?.wivesSalary },
    { label: "លេខទូរស័ព្ទផ្ទាល់ខ្លួន", value: familyStatus?.phoneNumber },
    { label: "អ៊ីមែល", value: familyStatus?.email },
    { label: "អាសយដ្ឋានបច្ចុប្បន្ន", value: familyStatus?.currentAddress },
  ];

  const columns: Column<TeacherFamily>[] = [
    {
      key: "nameChild",
      header: "ឈ្មោះកូន",
      render: (row: any) => row.nameChild || "N/A",
    },
    {
      key: "gender",
      header: "ភេទ",
      render: (row: any) => row.gender || "N/A",
    },
    {
      key: "dateOfBirth",
      header: "ថ្ងៃខែឆ្នាំកំណើត",
      render: (row: any) => row.dateOfBirth || "N/A",
    },
    {
      key: "working",
      header: "មុខរបរ",
      render: (row: any) => row.working || "N/A",
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3>ស្ថានភាពគ្រួសារ</h3>
        <Separator />
        <InfoGrid data={infoItems} />
        <CustomTable columns={columns} data={teacher ?? []} />
      </CardContent>
    </Card>
  );
}
