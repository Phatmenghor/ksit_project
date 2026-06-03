import React, { useMemo } from "react";
import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { convertToWeeklySchedule } from "@/utils/map-helper/schedule";

const ScheduleTeacherTable = ({
  scheduleList,
}: {
  scheduleList: ScheduleModel[];
}) => {
  const scheduleData = convertToWeeklySchedule(scheduleList);

  // Get teacher info and teaching schedule summary
  const teacherScheduleInfo = useMemo(() => {
    if (!scheduleList || scheduleList.length === 0) {
      return {
        teacherName: "---",
        teacherEmail: "---",
        teachingDays: [],
        timeSlots: [],
        totalClasses: 0,
      };
    }

    const teacher = scheduleList[0].teacher;
    const englishName = `${teacher?.englishFirstName || ""} ${
      teacher?.englishLastName || ""
    }`.trim();
    const khmerName = `${teacher?.khmerFirstName || ""} ${
      teacher?.khmerLastName || ""
    }`.trim();

    // Get unique days the teacher is teaching
    const teachingDays = [...new Set(scheduleList.map((s) => s.day))].filter(
      Boolean
    );

    // Get all time slots with day context
    const timeSlots = scheduleList.map((s) => ({
      day: s.day,
      time: `${s.startTime}-${s.endTime}`,
      subject: s.course?.code || "Unknown",
      room: s.room?.name || "TBA",
    }));

    return {
      teacherName: englishName || khmerName || teacher?.username || "---",
      teacherEmail: teacher?.email || "---",
      teachingDays,
      timeSlots,
      totalClasses: scheduleList.length,
    };
  }, [scheduleList]);

  const TableHeader = () => (
    <thead>
      <tr className="bg-black text-white">
        <th className="px-4 py-3 text-left font-medium">Subject</th>
        <th className="px-4 py-3 text-left font-medium">Class</th>
        <th className="px-4 py-3 text-left font-medium">Start - Finish time</th>
        <th className="px-4 py-3 text-left font-medium">Room</th>
      </tr>
    </thead>
  );

  const TableRow = ({ classInfo }: any) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-700">
        {classInfo.subjectCode || "---"}
      </td>
      <td className="px-4 py-3 text-gray-700">{classInfo.subject || "---"}</td>
      <td className="px-4 py-3 text-gray-700">{classInfo.datetime || "---"}</td>
      <td className="px-4 py-3 text-gray-700">{classInfo.room || "---"}</td>
    </tr>
  );

  return (
    <Card>
      <CardContent className="mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3 bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="w-8 h-8 bg-orange-200 rounded flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Schedule For Teacher: {teacherScheduleInfo.teacherName}
            </h1>
            <p className="text-sm text-gray-600">
              Teaching Days:{" "}
              {teacherScheduleInfo.teachingDays.length > 0
                ? teacherScheduleInfo.teachingDays.join(", ")
                : "No days scheduled"}{" "}
              | Times:{" "}
              {teacherScheduleInfo.timeSlots.length > 0
                ? [
                    ...new Set(
                      teacherScheduleInfo.timeSlots.map((slot) => slot.time)
                    ),
                  ].join(", ")
                : "No times scheduled"}{" "}
              | Total Classes: {teacherScheduleInfo.totalClasses} | Class:{" "}
              {scheduleData.classInfo?.class || "---"} | Semester:{" "}
              {scheduleData.classInfo?.semester || "---"} | Major:{" "}
              {scheduleData.classInfo.major || "---"} | Academic Year:{" "}
              {scheduleData.classInfo?.academicYear || "---"}
            </p>
          </div>
        </div>

        {/* Schedule Tables */}
        <div className="space-y-8">
          {scheduleData.weeklySchedule.map((daySchedule, index) => (
            <div key={index} className="bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {daySchedule.day}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({daySchedule.classes.length} classes)
                </span>
              </h2>

              <div
                className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#000000 #d1d5db",
                }}
              >
                <table className="w-full">
                  <TableHeader />
                  <tbody className="bg-white">
                    {daySchedule.classes.length > 0 ? (
                      daySchedule.classes.map(
                        (classInfo: any, classIndex: number) => (
                          <TableRow key={classIndex} classInfo={classInfo} />
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No classes scheduled for this day
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleTeacherTable;
