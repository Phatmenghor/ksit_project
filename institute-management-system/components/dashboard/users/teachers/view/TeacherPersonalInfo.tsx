import React from "react";
import InfoGrid from "../../shared/user-personal-history";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeacherProfileProps {
  teacher: StaffRespondModel | null;
}

export default function TeacherPersonal({ teacher }: TeacherProfileProps) {
  const isMobile = useIsMobile();
  const infoItems = [
    {
      label: "គោត្តនាម និងនាម",
      value:
        teacher?.khmerFirstName || teacher?.khmerLastName
          ? `${teacher?.khmerFirstName ?? ""} ${teacher?.khmerLastName ?? ""}`
          : "---",
    },
    {
      label: "អក្សរឡាតាំង",
      value:
        teacher?.englishFirstName || teacher?.englishLastName
          ? `${teacher?.englishFirstName ?? ""} ${
              teacher?.englishLastName ?? ""
            }`
          : "---",
    },

    { label: "ភេទ", value: teacher?.gender || "---" },
    { label: "ថ្ងៃខែឆ្នាំកំណើត", value: teacher?.dateOfBirth || "---" },
    { label: "ពិការភាព", value: teacher?.disability || "---" },
    { label: "លេខអត្តសញ្ញាណបណ្ណ", value: teacher?.nationalId || "---" },
    { label: "លេខសមាជិកបសបខ", value: teacher?.cppMembershipNumber || "---" },
    {
      label: "ថ្ងៃខែឆ្នាំតែងតាំងស៊ុប",
      value: teacher?.currentPositionDate || "---",
    },
    { label: "អាសយដ្ឋានអង្គភាព", value: teacher?.currentAddress || "---" },
    { label: "មុខតំណែង", value: teacher?.currentPosition || "---" },
    { label: "អត្តលេខមន្ត្រី", value: teacher?.staffId || "---" },
    { label: "ជនជាតិ", value: teacher?.ethnicity || "---" },
    { label: "ទីកន្លែងកំណើត", value: teacher?.placeOfBirth || "---" },
    { label: "លេខគណនីបៀវត្ស", value: teacher?.payrollAccountNumber || "---" },
    {
      label: "ថ្ងៃខែឆ្នាំចូលបម្រើការងារ",
      value: teacher?.startWorkDate || "---",
    },
    { label: "អង្គភាពបម្រើការងារ", value: teacher?.employeeWork || "---" },
    { label: "ការិយាល័យ", value: teacher?.officeName || "---" },
    { label: "ប្រកាស", value: teacher?.decreeFinal || "---" },
  ];

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <h3>ប្រវត្តិគ្រូបង្រៀន</h3>
        <Separator />
        <InfoGrid data={infoItems} columns={isMobile ? 1 : 2} />
      </CardContent>
    </Card>
  );
}
