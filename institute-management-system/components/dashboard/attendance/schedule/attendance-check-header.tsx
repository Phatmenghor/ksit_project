import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Timer,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { useRouter } from "next/navigation";
import { formatTime12h } from "@/utils/map-helper/schedule";
import { AppIcons } from "@/constants/icons/icon";

interface AttendanceCheckProps {
  scheduleDetail: ScheduleModel | null;
  isSubmitted: boolean;
  submissionTime: Date | null;
  unsavedChanges: Set<number>;
  lastUpdated: Date | null;
}
export default function AttendanceCheckHeader({
  scheduleDetail,
  isSubmitted,
  submissionTime,
  unsavedChanges,
  lastUpdated,
}: AttendanceCheckProps) {
  const router = useRouter();

  const teacherName =
    (scheduleDetail?.teacher &&
      (scheduleDetail.teacher.englishFirstName ||
      scheduleDetail.teacher.englishLastName
        ? `${scheduleDetail.teacher.englishFirstName || ""} ${
            scheduleDetail.teacher.englishLastName || ""
          }`.trim()
        : scheduleDetail.teacher.khmerFirstName ||
          scheduleDetail.teacher.khmerLastName
        ? `${scheduleDetail.teacher.khmerFirstName || ""} ${
            scheduleDetail.teacher.khmerLastName || ""
          }`.trim()
        : "- - -")) ||
    "- - -";

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        {/* Top bar: breadcrumb + status */}
        <div className="flex flex-col gap-3 px-6 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.ATTENDANCE.CLASS_SCHEDULE}>
                  Schedule
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Class</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isSubmitted && (
              <Badge
                variant="default"
                className="gap-1 bg-green-600 text-white"
              >
                <CheckCircle className="h-3 w-3" />
                Submitted
                {submissionTime && (
                  <span className="font-normal opacity-90">
                    · {submissionTime.toLocaleTimeString()}
                  </span>
                )}
              </Badge>
            )}

            {unsavedChanges.size > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unsavedChanges.size} Unsaved Changes
              </Badge>
            )}

            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Title row */}
        <div className="flex items-center gap-3 px-6 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 rounded-full"
          >
            <img src={AppIcons.Back} alt="Back" className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold leading-tight">
              {scheduleDetail?.course?.nameEn ||
                scheduleDetail?.course?.nameKH ||
                "Attendance Check"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {scheduleDetail?.course?.code || "- - -"} · Take attendance for
              today's class
            </p>
          </div>
        </div>

        {/* Schedule info strip */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-amber-500" />
            <span className="font-medium">
              {scheduleDetail?.day || "- - -"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime12h(scheduleDetail?.startTime)} –{" "}
              {formatTime12h(scheduleDetail?.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{teacherName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{scheduleDetail?.room?.name || "- - -"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
