import React from "react";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";

interface StudentSiblingProps {
  student: StudentByIdModel | null;
}

export default function StudentSiblingTable({ student }: StudentSiblingProps) {
  const siblings = student?.studentSibling || [];

  return (
    <div>
      <h4 className="font-semibold text-foreground border-b pb-1 mb-3">ព័ត៌មានបងប្អូន</h4>
      <div
        className="overflow-x-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#000000 #d1d5db" }}
      >
        <table className="min-w-max w-full text-sm border">
          <thead>
            <tr className="bg-black text-white text-left">
              <th className="p-2 border whitespace-nowrap">លេខរៀង</th>
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
                  <td className="p-2 border font-medium text-center">{index + 1}</td>
                  <td className="p-2 border">{sibling.name || <span className="text-muted-foreground italic">N/A</span>}</td>
                  <td className="p-2 border">
                    {sibling.gender === "MALE" ? "ប្រុស" : sibling.gender === "FEMALE" ? "ស្រី" : sibling.gender || <span className="text-muted-foreground italic">N/A</span>}
                  </td>
                  <td className="p-2 border">
                    {sibling.dateOfBirth ? formatDate(sibling.dateOfBirth) : <span className="text-muted-foreground italic">N/A</span>}
                  </td>
                  <td className="p-2 border">{sibling.occupation || <span className="text-muted-foreground italic">N/A</span>}</td>
                  <td className="p-2 border">{sibling.phoneNumber || <span className="text-muted-foreground italic">N/A</span>}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground italic border">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
