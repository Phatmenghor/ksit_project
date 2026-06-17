import React from "react";
import { Separator } from "@/components/ui/separator";
import InfoGrid from "../../shared/user-personal-history";
import { Card, CardContent } from "@/components/ui/card";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";

interface TeacherProps {
  teacher: StaffRespondModel | null;
}

export default function TeacherProfessionalRank({ teacher }: TeacherProps) {
  const infoItems = [
    { label: "ឋាននន្តរស័ក្តិ និងថ្នាក់", value: teacher?.rankAndClass },
    { label: "យោង", value: teacher?.referenceNote },
    { label: "លេខរៀង", value: teacher?.serialNumber },
    { label: "ចុះថ្ងៃទី", value: teacher?.issuedDate },
    { label: "បង្រៀនភាសាអង់គ្លេស", value: teacher?.taughtEnglish },
    { label: "ប្រធានក្រុមបច្ចេកទេស", value: teacher?.technicalTeamLeader },
    { label: "ពីរថ្នាក់ណីរពេល", value: teacher?.twoLevelClass },
    { label: "បង្រៀនឆ្លងសាលា", value: teacher?.teachAcrossSchools },
    { label: "ថ្នាក់គួប", value: teacher?.suitableClass },
    { label: "ថ្ងៃខែឡើងការប្រាក់ចុងក្រោយ", value: teacher?.lastSalaryIncrementDate },
    { label: "បង្រៀននៅឆ្នាំសិក្សា", value: teacher?.academicYearTaught },
    { label: "ថ្នាក់គួបបីកម្រិត", value: teacher?.threeLevelClass },
    { label: "ជួយបង្រៀន", value: teacher?.assistInTeaching },
    { label: "ទទួលបន្ទុកថ្នាក់", value: teacher?.classResponsibility },
    { label: "ម៉ោងលើស", value: teacher?.overtimeHours },
    { label: "ពីរភាសា", value: teacher?.bilingual },
  ];

  return (
    <Card title="ឋានៈវិជ្ជាជីវៈគ្រូបង្រៀន">
      <CardContent className="p-5">
        <div className="mt-2 space-y-7">
          <div
            className="overflow-x-auto overflow-y-auto md:max-h-72 border border-gray-300 rounded-2xl"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#000000 #d1d5db" }}
          >
            <table className="min-w-max w-full text-sm border-collapse">
              <thead>
                <tr className="bg-black text-white text-left">
                  <th className="p-3 border-r border-gray-400 min-w-[200px] whitespace-nowrap">ប្រភេទឋានៈវិជ្ជាជីវៈ</th>
                  <th className="p-3 border-r border-gray-400 min-w-[150px] whitespace-nowrap">បរិយាយ</th>
                  <th className="p-3 border-r border-gray-400 min-w-[120px] whitespace-nowrap">ប្រកាសលេខ</th>
                  <th className="p-3 min-w-[150px] whitespace-nowrap">កាលបរិច្ឆេទទទួល</th>
                </tr>
              </thead>
              <tbody>
                {teacher?.teachersProfessionalRank?.length ? (
                  teacher.teachersProfessionalRank.map((value) => (
                    <tr key={value.id} className="border-t border-gray-300 bg-white hover:bg-gray-50">
                      <td className="p-3 border-r border-gray-300 whitespace-nowrap">{value?.typeOfProfessionalRank || "N/A"}</td>
                      <td className="p-3 border-r border-gray-300 whitespace-nowrap">{value?.description || "N/A"}</td>
                      <td className="p-3 border-r border-gray-300 whitespace-nowrap">{value?.announcementNumber || "N/A"}</td>
                      <td className="p-3 whitespace-nowrap">{value?.dateAccepted || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-gray-300 bg-white">
                    <td colSpan={4} className="p-4 text-center text-muted-foreground italic">No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Separator />

          <InfoGrid data={infoItems} />
        </div>
      </CardContent>
    </Card>
  );
}
