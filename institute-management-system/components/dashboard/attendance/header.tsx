"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";
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
    <Card>
      <CardContent className="p-6 space-y-3">
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
            <h1 className="text-xl font-semibold">
              {schedule?.course?.nameEn || schedule?.course?.nameKH || "---"}
            </h1>
          </div>
        </div>

        {/* Class Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <DetailBlock label="Class" value={schedule?.classes?.code} />
          <DetailBlock label="Department" value={schedule?.course?.department?.name} />
          <DetailBlock label="Major" value={schedule?.classes?.major?.name} />
          <DetailBlock label="Degree" value={formatEnumLabel(schedule?.classes?.degree)} />
          <DetailBlock
            label="Year Level"
            value={
              schedule?.classes?.academyYear != null
                ? String(schedule.classes.academyYear)
                : undefined
            }
          />
        </div>

        {/* Course Card */}
        <Card className="overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-4">
              <div className="flex border-l-4 border-amber-500 rounded-xl flex-shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1 justify-between">
                  <span className="text-sm font-medium text-amber-600 truncate">
                    {schedule?.course?.code || "- - -"}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {schedule?.day || "- - -"}
                  </span>
                </div>
                <div className="text-sm font-medium truncate">
                  {schedule?.course?.nameEn || schedule?.course?.nameKH || "- - -"}
                </div>
                {(schedule?.course?.totalHour || schedule?.course?.credit) && (
                  <div className="text-xs text-muted-foreground">
                    {schedule?.course?.subject?.name || ""}{" "}
                    {schedule?.course?.totalHour ? `— ${schedule.course.totalHour} hrs` : ""}
                    {schedule?.course?.credit ? ` / ${schedule.course.credit} credits` : ""}
                  </div>
                )}
              </div>
            </div>

            <Separator className="border-amber-200" />

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-sm text-foreground">
              <InfoItem
                icon={<Clock className="h-4 w-4 flex-shrink-0" />}
                text={`${formatTime12h(schedule?.startTime)} - ${formatTime12h(schedule?.endTime)}`}
              />
              <InfoItem
                icon={<Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                text={teacherName}
              />
              <InfoItem
                icon={<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                text={schedule?.room?.name || "---"}
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground font-medium uppercase truncate">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate" title={value || "---"}>
        {value || "---"}
      </p>
    </div>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {icon}
      <span className="truncate" title={text}>
        {text}
      </span>
    </div>
  );
}
