"use client";

import React, { useMemo } from "react";
import { Clock, MapPin, User } from "lucide-react";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { convertToWeeklySchedule, formatSemester, formatAcademyYear } from "@/utils/map-helper/schedule";
import { cn } from "@/lib/utils";

const DAY_COLORS: Record<string, { pill: string; header: string }> = {
  Monday:    { pill: "bg-blue-100 text-blue-700 border-blue-200",      header: "bg-blue-50/70" },
  Tuesday:   { pill: "bg-violet-100 text-violet-700 border-violet-200", header: "bg-violet-50/70" },
  Wednesday: { pill: "bg-emerald-100 text-emerald-700 border-emerald-200", header: "bg-emerald-50/70" },
  Thursday:  { pill: "bg-amber-100 text-amber-700 border-amber-200",   header: "bg-amber-50/70" },
  Friday:    { pill: "bg-rose-100 text-rose-700 border-rose-200",      header: "bg-rose-50/70" },
  Saturday:  { pill: "bg-orange-100 text-orange-700 border-orange-200", header: "bg-orange-50/70" },
  Sunday:    { pill: "bg-red-100 text-red-700 border-red-200",         header: "bg-red-50/70" },
};
const DEFAULT_STYLE = { pill: "bg-muted text-muted-foreground border-border", header: "bg-muted/40" };

export default function ScheduleTeacherTable({ scheduleList }: { scheduleList: ScheduleModel[] }) {
  const { classInfo, weeklySchedule } = convertToWeeklySchedule(scheduleList);
  const activeDays = weeklySchedule.filter((d) => d.classes.length > 0);

  const teacherInfo = useMemo(() => {
    if (!scheduleList.length) return null;
    const t = scheduleList[0].teacher;
    if (!t) return null;
    const name =
      `${t.englishFirstName ?? ""} ${t.englishLastName ?? ""}`.trim() ||
      `${t.khmerFirstName ?? ""} ${t.khmerLastName ?? ""}`.trim() ||
      t.username ||
      "Unknown";
    return { name, totalClasses: scheduleList.length };
  }, [scheduleList]);

  if (!teacherInfo) return null;

  return (
    <div className="space-y-3">
      {/* Info bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
          <User className="h-3 w-3 text-muted-foreground" />
          Instructor Schedule
        </span>
        <span className="text-muted-foreground/50 text-xs select-none">·</span>
        <span className="text-xs text-muted-foreground">{teacherInfo.name}</span>
        <span className="text-muted-foreground/50 text-xs select-none">·</span>
        <span className="text-xs text-muted-foreground">
          {teacherInfo.totalClasses} session{teacherInfo.totalClasses !== 1 ? "s" : ""}
        </span>
        {classInfo.semester !== "---" && (
          <>
            <span className="text-muted-foreground/50 text-xs select-none">·</span>
            <span className="text-xs text-muted-foreground">{formatSemester(classInfo.semester)}</span>
          </>
        )}
        {classInfo.academicYear !== "---" && (
          <>
            <span className="text-muted-foreground/50 text-xs select-none">·</span>
            <span className="text-xs text-muted-foreground">{formatAcademyYear(classInfo.academicYear)}</span>
          </>
        )}
      </div>

      {/* Day tables */}
      {activeDays.length === 0 ? (
        <p className="text-sm text-muted-foreground py-3 text-center">No schedules found</p>
      ) : (
        <div className="space-y-3">
          {activeDays.map((daySchedule, i) => {
            const colors = DAY_COLORS[daySchedule.day] ?? DEFAULT_STYLE;
            return (
              <div key={i} className="rounded-lg border border-border/60 overflow-hidden">
                {/* Day header row */}
                <div className={cn("flex items-center justify-between px-3 py-2 border-b border-border/40", colors.header)}>
                  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", colors.pill)}>
                    {daySchedule.day}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {daySchedule.classes.length} session{daySchedule.classes.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/40">
                        {["Course", "Time", "Room"].map((h) => (
                          <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {daySchedule.classes.map((c, j) => (
                        <tr
                          key={j}
                          className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-2.5">
                            <p className="text-xs font-semibold text-foreground leading-tight">{c.subjectCode}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{c.subject}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1 text-xs text-foreground/80">
                              <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                              {c.datetime}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1 text-xs text-foreground/80">
                              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                              {c.room}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
