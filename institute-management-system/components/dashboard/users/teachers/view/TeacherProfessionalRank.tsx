import React from "react";
import { Separator } from "@/components/ui/separator";
import InfoGrid from "../../shared/user-personal-history";
import { Card, CardContent } from "@/components/ui/card";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { formatValue } from "@/utils/map-helper/student";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeacherProps {
  teacher: StaffRespondModel | null;
}

export default function TeacherProfessionalRank({ teacher }: TeacherProps) {
  const isMobile = useIsMobile();

  const infoItems = [
    {
      label: "ឋាននន្តរស័ក្តិ និងថ្នាក់",
      value: formatValue(teacher?.rankAndClass),
    },
    {
      label: "យោង",
      value: formatValue(teacher?.referenceNote),
    },
    {
      label: "លេខរៀង",
      value: formatValue(teacher?.serialNumber),
    },
    {
      label: "ចុះថ្ងៃទី",
      value: formatValue(teacher?.issuedDate),
    },
    {
      label: "បង្រៀនភាសាអង់គ្លេស",
      value: formatValue(teacher?.taughtEnglish),
    },
    {
      label: "ប្រធានក្រុមបច្ចេកទេស",
      value: formatValue(teacher?.technicalTeamLeader),
    },
    {
      label: "ពីរថ្នាក់ណីរពេល",
      value: formatValue(teacher?.twoLevelClass),
    },
    {
      label: "បង្រៀនឆ្លងសាលា",
      value: formatValue(teacher?.teachAcrossSchools),
    },
    {
      label: "ថ្នាក់គួប",
      value: formatValue(teacher?.suitableClass),
    },
    {
      label: "ថ្ងៃខែឡើងការប្រាក់ចុងក្រោយ",
      value: formatValue(teacher?.lastSalaryIncrementDate),
    },
    {
      label: "បង្រៀននៅឆ្នាំសិក្សា",
      value: formatValue(teacher?.academicYearTaught),
    },
    {
      label: "ថ្នាក់គួបបីកម្រិត",
      value: formatValue(teacher?.threeLevelClass),
    },
    {
      label: "ជួយបង្រៀន",
      value: formatValue(teacher?.assistInTeaching),
    },
    {
      label: "ទទួលបន្ទុកថ្នាក់",
      value: formatValue(teacher?.classResponsibility),
    },
    {
      label: "ម៉ោងលើស",
      value: formatValue(teacher?.overtimeHours),
    },
    {
      label: "ពីរភាសា",
      value: formatValue(teacher?.bilingual),
    },
  ];

  return (
    <Card title="ឋានៈវិជ្ជាជីវៈគ្រូបង្រៀន">
      <CardContent className="p-5">
        <div className="mt-2">
          <div className="space-y-7">
            {/* Table container with horizontal scroll */}
            <div
              className="relative overflow-x-auto border border-gray-300 rounded-2xl overflow-hidden"
              style={{
                scrollbarWidth: "thin",
                maxHeight: "300px",
                scrollbarColor: "#000000 #d1d5db",
              }}
            >
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-black text-white text-left">
                    <th className="p-3 border-r border-gray-400 min-w-[200px] whitespace-nowrap">
                      ប្រភេទឋានៈវិជ្ជាជីវៈ
                    </th>
                    <th className="p-3 border-r border-gray-400 min-w-[150px] whitespace-nowrap">
                      បរិយាយ
                    </th>
                    <th className="p-3 border-r border-gray-400 min-w-[120px] whitespace-nowrap">
                      ប្រកាសលេខ
                    </th>
                    <th className="p-3 min-w-[150px] whitespace-nowrap">
                      កាលបរិច្ឆេទទទួល
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teacher?.teachersProfessionalRank?.length ? (
                    teacher.teachersProfessionalRank.map((value) => (
                      <tr
                        key={value.id}
                        className="border-t border-gray-300 bg-white hover:bg-gray-50"
                      >
                        <td className="p-3 border-r border-gray-300 whitespace-nowrap">
                          {value?.typeOfProfessionalRank || "---"}
                        </td>
                        <td className="p-3 border-r border-gray-300 whitespace-nowrap">
                          {value?.description || "---"}
                        </td>
                        <td className="p-3 border-r border-gray-300 whitespace-nowrap">
                          {value?.announcementNumber || "---"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {value?.dateAccepted || "---"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-gray-300 bg-white">
                      <td className="p-3 border-r border-gray-300 text-center whitespace-nowrap">
                        ---
                      </td>
                      <td className="p-3 border-r border-gray-300 text-center whitespace-nowrap">
                        ---
                      </td>
                      <td className="p-3 border-r border-gray-300 text-center whitespace-nowrap">
                        ---
                      </td>
                      <td className="p-3 border-r border-gray-300 text-center whitespace-nowrap">
                        ---
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Separator />

            <div>
              <InfoGrid data={infoItems} columns={isMobile ? 1 : 2} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
