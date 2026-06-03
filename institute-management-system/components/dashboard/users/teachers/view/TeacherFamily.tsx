import { Column, CustomTable } from "@/components/shared/layout/table-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React from "react";
import InfoGrid from "../../shared/user-personal-history";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { TeacherFamily } from "@/model/user/staff/staff.request.model";
import { formatValue } from "@/utils/map-helper/student";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeacherProps {
  teacher: TeacherFamily[] | null;
  familyStatus: StaffRespondModel | null;
}

export default function TeacherFamilySection({
  teacher,
  familyStatus,
}: TeacherProps) {
  const isMobile = useIsMobile();
  const infoItems = [
    {
      label: "ស្ថានភាពគ្រួស",
      value: formatValue(familyStatus?.maritalStatus),
    },
    {
      label: "ត្រូវជា",
      value: formatValue(familyStatus?.mustBe),
    },
    {
      label: "មុខរបរសហព័ទ្ធ",
      value: formatValue(familyStatus?.affiliatedProfession),
    },
    {
      label: "ឈ្មោះសហព័ទ្ធ",
      value: formatValue(familyStatus?.federationName),
    },
    {
      label: "អង្គភាពសហព័ទ្ធ",
      value: formatValue(familyStatus?.affiliatedOrganization),
    },
    {
      label: "ថ្ងៃខែឆ្នាំកំណើតសហព័ទ្ធ",
      value: formatValue(familyStatus?.federationEstablishmentDate),
    },
    {
      label: "ប្រាក់ខែប្រពន្ធ",
      value: formatValue(familyStatus?.wivesSalary),
    },
    {
      label: "លេខទូរស័ព្ទផ្ទាល់ខ្លួន",
      value: formatValue(familyStatus?.phoneNumber),
    },
    {
      label: "អ៊ីមែល",
      value: formatValue(familyStatus?.email),
    },
    {
      label: "អាសយដ្ឋានបច្ចុប្បន្ន",
      value: formatValue(familyStatus?.currentAddress),
    },
  ];

  const columns: Column<TeacherFamily>[] = [
    {
      key: "nameChild",
      header: "ឈ្មោះកូន",
      render: (teacher: any) => `${teacher.nameChild ?? "---"}`,
    },
    {
      key: "gender",
      header: "ភេទ",
      render: (teacher: any) => `${teacher.gender ?? "---"}`,
    },
    {
      key: "dateOfBirth",
      header: "ថ្ងៃខែឆ្នាំកំណើត",
      render: (teacher: any) => `${teacher.dateOfBirth ?? "---"}`,
    },
    {
      key: "working",
      header: "មុខរបរ",
      render: (teacher: any) => `${teacher.working ?? "---"}`,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3>ស្ថានភាពគ្រួសារ</h3>
        <Separator />

        <div>
          <InfoGrid data={infoItems} columns={isMobile ? 1 : 2} />
        </div>
        <CustomTable columns={columns} data={teacher ?? []} />
      </CardContent>
    </Card>
  );
}
