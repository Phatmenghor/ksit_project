import React from "react";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import { educationLevels } from "@/constants/constant";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

interface StudentProfileProps {
  student: StudentByIdModel | null;
}

export default function StudentStudyHistory({ student }: StudentProfileProps) {
  return (
    <CollapsibleCard title="ប្រវត្តិការសិក្សា">
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
                <th className="p-2 border">កម្រិតថ្នាក់</th>
                <th className="p-2 border">ឈ្មោះសាលារៀន</th>
                <th className="p-2 border">ខេត្ត/រាជធានី</th>
                <th className="p-2 border">ឆ្នាំសិក្សា</th>
                <th className="p-2 border">សញ្ញាប័ត្រទទួលបាន</th>
                <th className="p-2 border">និទ្ទេសរួម</th>
              </tr>
            </thead>
            <tbody>
              {educationLevels.map(({ label, value }, idx) => {
                const record = student?.studentStudiesHistory.find(
                  (s) => s.typeStudies === value
                );

                return (
                  <tr key={idx} className="border-t">
                    <td className="p-2 border font-medium">{label}</td>
                    <td className="p-2 border">
                      {record?.schoolName || "---"}
                    </td>
                    <td className="p-2 border">{record?.location || "---"}</td>
                    <td className="p-2 border">
                      {record
                        ? `${record.fromYear ?? ""} - ${
                            record.endYear ?? ""
                          }`.trim()
                        : "---"}
                    </td>
                    <td className="p-2 border">
                      {record?.obtainedCertificate || "---"}
                    </td>
                    <td className="p-2 border">
                      {record?.overallGrade || "---"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleCard>
  );
}
