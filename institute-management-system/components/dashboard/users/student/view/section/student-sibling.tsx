import React from "react";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";

interface StudentSiblingProps {
  student: StudentByIdModel | null;
}

export default function StudentSiblingTable({ student }: StudentSiblingProps) {
  const siblings = student?.studentSibling || [];

  return (
    <CollapsibleCard title="ព័ត៌មានបងប្អូន">
      <div>
        <div
          className="overflow-x-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#000000 #d1d5db",
          }}
        >
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-black text-white text-left">
                <th className="p-2 border">លេខរៀង</th>
                <th className="p-2 border">ឈ្មោះពេញ</th>
                <th className="p-2 border">ភេទ</th>
                <th className="p-2 border">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="p-2 border">មុខរបរ</th>
                <th className="p-2 border">លេខទូរស័ព្ទ</th>
              </tr>
            </thead>
            <tbody>
              {siblings.length > 0 ? (
                siblings.map((sibling, index) => (
                  <tr key={sibling.id || index} className="border-t">
                    <td className="p-2 border font-medium text-center">
                      {index + 1}
                    </td>
                    <td className="p-2 border">{sibling.name || "---"}</td>
                    <td className="p-2 border">
                      {sibling.gender === "MALE"
                        ? "ប្រុស"
                        : sibling.gender === "FEMALE"
                        ? "ស្រី"
                        : sibling.gender || "---"}
                    </td>
                    <td className="p-2 border">
                      {sibling.dateOfBirth
                        ? formatDate(sibling.dateOfBirth)
                        : "---"}
                    </td>
                    <td className="p-2 border">
                      {sibling.occupation || "---"}
                    </td>
                    <td className="p-2 border">
                      {sibling.phoneNumber || "---"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-gray-500 border"
                  >
                    មិនមានព័ត៌មានបងប្អូន
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleCard>
  );
}
