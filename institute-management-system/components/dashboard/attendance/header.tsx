"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppIcons } from "@/constants/icons/icon";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  title: string;
  schedule: ScheduleModel | null;
}

export default function AttendanceHeader({ title, schedule }: Props) {
  const router = useRouter();

  return (
    <Card className="shadow-md">
      <CardContent className="p-4 sm:p-6 space-y-3">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs sm:text-sm text-muted-foreground space-x-1 sm:space-x-2 overflow-x-auto">
          <Link
            href="/dashboard"
            className="hover:text-foreground whitespace-nowrap"
          >
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link
            href="/student-score"
            className="hover:text-foreground whitespace-nowrap"
          >
            Student Score
          </Link>
          <span>&gt;</span>
          <span className="text-foreground font-medium truncate">{title}</span>
        </nav>

        {/* Header Section with Back Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              asChild
              className="rounded-full flex-shrink-0 hover:cursor-pointer"
            >
              <img
                src={AppIcons.Back}
                alt="back Icon"
                className="h-4 w-4 mr-3 sm:mr-5 text-muted-foreground"
              />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
              {schedule?.course?.subject.name || "---"}
            </h1>
          </div>
        </div>

        <Separator />

        {/* Class Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <DetailBlock label="Class" value={schedule?.classes.code ?? "---"} />
          <DetailBlock
            label="Department"
            value={schedule?.course.department.name || "---"}
          />
          <DetailBlock
            label="Major"
            value={schedule?.classes.major.name || "---"}
          />
          <DetailBlock
            label="Degree"
            value={schedule?.classes.degree || "---"}
          />
          <DetailBlock
            label="Year Level"
            value={
              schedule?.classes?.academyYear !== undefined &&
              schedule?.classes?.academyYear !== null
                ? String(schedule.classes.academyYear)
                : "---"
            }
          />
        </div>

        {/* Course Details */}
        <div className="bg-amber-50 border- border-amber-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="flex border-l-4 border-amber-500 rounded-xl flex-shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1 justify-between">
                  <div className="text-sm font-medium text-amber-600 truncate">
                    {schedule?.course?.code || "- - -"}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {schedule?.day || "- - -"}
                  </span>
                </div>
                <div className="text-sm font-medium truncate">
                  {schedule?.course?.nameEn ||
                    schedule?.course?.nameKH ||
                    "- - -"}
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
              {schedule?.course?.subject.name || "- - -"} —{" "}
              {`${schedule?.course.totalHour} hrs / ${
                schedule?.course.credit || "- - -"
              } credits`}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6">
            <InfoItem
              icon={
                <img
                  src={AppIcons.Time}
                  alt="Time Icon"
                  className="h-4 w-4 flex-shrink-0"
                />
              }
              text={`${schedule?.startTime} - ${schedule?.endTime}`}
            />
            <InfoItem
              icon={
                <img
                  src={AppIcons.User}
                  alt="User Icon"
                  className="h-5 w-5 text-muted-foreground flex-shrink-0"
                />
              }
              text={
                `${schedule?.teacher.khmerFirstName ?? ""} ${
                  schedule?.teacher.khmerLastName ?? ""
                }`.trim() || "---"
              }
            />
            <InfoItem
              icon={
                <img
                  src={AppIcons.Location}
                  alt="Location Icon"
                  className="h-5 w-5 text-muted-foreground flex-shrink-0"
                />
              }
              text={schedule?.room.name || "---"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs text-muted-foreground font-medium uppercase truncate">
        {label}
      </h3>
      <p
        className="text-sm font-semibold text-foreground truncate"
        title={value || "---"}
      >
        {value || "---"}
      </p>
    </div>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
      {icon}
      <span className="truncate" title={text}>
        {text}
      </span>
    </div>
  );
}
