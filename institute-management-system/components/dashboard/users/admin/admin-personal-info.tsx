import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import InfoGrid from "../shared/user-personal-history";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";

interface AdminProps {
  admin: StaffRespondModel | null;
}

export default function AdminPersonal({ admin }: AdminProps) {
  const infoItems = [
    {
      label: "នាមត្រកូល",
      value: admin?.khmerFirstName || "---",
    },
    {
      label: "ឈ្មោះ",
      value: admin?.khmerLastName || "---",
    },
    {
      label: "ឈ្មោះអ្នកប្រើប្រាស់",
      value: admin?.username || "---",
    },
    {
      label: "អ៊ីមែល",
      value: admin?.email || "---",
    },
  ];

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <h3 className="font-bold">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
        <Separator />
        <InfoGrid data={infoItems} columns={2} />
      </CardContent>
    </Card>
  );
}
