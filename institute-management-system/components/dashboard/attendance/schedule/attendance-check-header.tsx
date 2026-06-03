import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Link from "next/link";
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
import { AppIcons } from "@/constants/icons/icon";

interface AttendanceCheckProps {
  scheduleDetail: ScheduleModel | null;
  isSubmitted: boolean;
  submissionTime: Date | null;
  unsavedChanges: Set<number>;
  autoRefresh: boolean;
  refreshProgress: number;
  lastUpdated: Date | null;
}
export default function AttendanceCheckHeader({
  scheduleDetail,
  isSubmitted,
  submissionTime,
  unsavedChanges,
  autoRefresh,
  lastUpdated,
  refreshProgress,
}: AttendanceCheckProps) {
  const router = useRouter();
  return (
    <Card>
      <CardContent className="p-6 space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={ROUTE.DASHBOARD}>Dashboard</BreadcrumbLink>
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

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full flex-shrink-0 hover:cursor-pointer"
            >
              <img
                src={AppIcons.Back}
                alt="back Icon"
                className="h-4 w-4 mr-5 text-muted-foreground"
              />
            </Button>
            <h1 className="text-xl font-semibold">
              {scheduleDetail?.course?.nameEn ||
                scheduleDetail?.course?.nameKH ||
                "Attendance Check"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Submission Status */}
            {isSubmitted && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className="bg-green-600 text-white animate-pulse"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Submitted
                </Badge>
                {submissionTime && (
                  <span className="text-xs text-muted-foreground">
                    {submissionTime.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Unsaved Changes Badge */}
            {unsavedChanges.size > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unsavedChanges.size} Unsaved Changes
              </Badge>
            )}

            {/* Auto-refresh Status */}
            {autoRefresh && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Timer className="h-3 w-3 mr-1" />
                  Auto-refresh: ON
                </Badge>
                {/* Progress bar for auto-refresh */}
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                    style={{ width: `${refreshProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Schedule Details Card */}
        <Card className="overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 transition-all duration-300">
          <CardContent className="p-0">
            <div className="p-4 flex-1">
              <div className="flex gap-4">
                <div className="flex border-l-4 border-amber-500 rounded-xl" />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-1 justify-between">
                    <div className="text-sm font-medium text-amber-600">
                      {scheduleDetail?.course?.code || "- - -"}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {scheduleDetail?.day || "- - -"}
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    {scheduleDetail?.course?.nameEn ||
                      scheduleDetail?.course?.nameKH ||
                      "- - -"}
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 hover:scale-105 transition-transform duration-200">
                  <Clock className="h-4 w-4" />
                  <span>
                    {scheduleDetail?.startTime} - {scheduleDetail?.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-1 hover:scale-105 transition-transform duration-200">
                  <Users className="h-4 w-4" />
                  <span>
                    {(scheduleDetail?.teacher &&
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
                      "- - -"}
                  </span>
                </div>
                <div className="flex items-center gap-1 hover:scale-105 transition-transform duration-200">
                  <MapPin className="h-4 w-4" />
                  <span>{scheduleDetail?.room?.name || "- - -"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
