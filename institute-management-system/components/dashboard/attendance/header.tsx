"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Clock, GraduationCap, MapPin, Users } from "lucide-react";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { formatTime12h } from "@/utils/map-helper/schedule";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
import { ROUTE } from "@/constants/routes";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  title: string;
  schedule: ScheduleModel | null;
}

export default function AttendanceHeader({ title, schedule }: Props) {
  const router = useRouter();

  const teacherName =
    schedule?.teacher
      ? (schedule.teacher.englishFirstName || schedule.teacher.englishLastName
          ? `${schedule.teacher.englishFirstName || ""} ${schedule.teacher.englishLastName || ""}`.trim()
          : `${schedule.teacher.khmerFirstName || ""} ${schedule.teacher.khmerLastName || ""}`.trim()) || "---"
      : "---";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Breadcrumb */}
        <div className="px-5 pt-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.ATTENDANCE.HISTORY_RECORD}>
                  Attendance
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-3 px-5 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 flex-shrink-0 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight">
              {schedule?.course?.nameEn || schedule?.course?.nameKH || "---"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {schedule?.course?.code || "---"} · {schedule?.classes?.code || "---"}
              {schedule?.classes?.major?.name ? ` · ${schedule.classes.major.name}` : ""}
            </p>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-muted/30 px-5 py-3">
          <InfoItem
            icon={<Clock className="h-4 w-4 flex-shrink-0" />}
            text={`${schedule?.day ? `${schedule.day}, ` : ""}${formatTime12h(schedule?.startTime)} - ${formatTime12h(schedule?.endTime)}`}
          />
          <InfoItem
            icon={<Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            text={teacherName}
          />
          <InfoItem
            icon={<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            text={schedule?.room?.name || "---"}
          />
          {formatEnumLabel(schedule?.classes?.degree) && (
            <InfoItem
              icon={<GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              text={`${formatEnumLabel(schedule?.classes?.degree)}${schedule?.classes?.academyYear != null ? ` · Year ${schedule.classes.academyYear}` : ""}`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0 text-sm text-muted-foreground">
      {icon}
      <span className="truncate" title={text}>
        {text}
      </span>
    </div>
  );
}
