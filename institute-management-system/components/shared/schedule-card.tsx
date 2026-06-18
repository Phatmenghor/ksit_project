import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Users,
  MapPin,
  BookOpen,
  FileText,
  CheckCircle,
  Pen,
  Trash,
  GraduationCap,
  CalendarDays,
  Award,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Teacher } from "@/model/schedules/all-schedule-model";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
import { formatTime12h } from "@/utils/map-helper/schedule";

interface ScheduleCardProps {
  schedule: ScheduleModel;
  onClick?: (scheduleId: number) => void;
  className?: string;
  showSurvey?: boolean;
  onSurveyClick?: (scheduleId: number) => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onEditClick?: (scheduleId: number) => void;
  onDeleteClick?: () => void;
}


const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  className = "",
  showSurvey = false,
  onSurveyClick,
  showEditButton = false,
  onEditClick,
  showDeleteButton = false,
  onDeleteClick,
}) => {
  const getTeacherName = (teacher?: Teacher): string => {
    if (!teacher) return "Not Assigned";
    const englishName =
      teacher.englishFirstName || teacher.englishLastName
        ? `${teacher.englishFirstName || ""} ${teacher.englishLastName || ""}`.trim()
        : null;
    const khmerName =
      teacher.khmerFirstName || teacher.khmerLastName
        ? `${teacher.khmerFirstName || ""} ${teacher.khmerLastName || ""}`.trim()
        : null;
    return englishName || khmerName || "Not Assigned";
  };

  const handleCardClick = () => {
    if (onClick) onClick(schedule.id);
  };

  const getSurveyButtonConfig = () => {
    if (schedule.surveyStatus === "COMPLETED") {
      return {
        variant: "outline" as const,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-default",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        text: "Completed",
        clickable: false,
      };
    }
    if (schedule.surveyStatus === "NOT_STARTED") {
      return {
        variant: "default" as const,
        className: "bg-primary hover:bg-primary/90 text-white shadow-sm",
        icon: <FileText className="h-3.5 w-3.5" />,
        text: "Take Survey",
        clickable: true,
      };
    }
    return null;
  };

  const surveyConfig = getSurveyButtonConfig();
  const hasActions =
    (showSurvey && schedule.surveyStatus !== "NONE" && surveyConfig) ||
    (showDeleteButton && onDeleteClick) ||
    (showEditButton && onEditClick);

  return (
    <Card
      className={`group h-full flex flex-col border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={handleCardClick}
    >
      {/* Colored top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

      <CardContent className="p-0 flex flex-col h-full">
        {/* ── Header row: course identity + action buttons ── */}
        <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-bold text-gray-900 flex-shrink-0">
              {schedule.course.code}
            </span>
            <span className="text-gray-300 flex-shrink-0">|</span>
            <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
              {schedule.course.nameEn || schedule.course.nameKH || "—"}
            </span>
          </div>

          {/* Edit / Delete action buttons — top-right */}
          {(showEditButton || showDeleteButton) && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {showEditButton && onEditClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-primary hover:bg-primary/10 hover:text-primary rounded-md transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(schedule.id);
                  }}
                >
                  <Pen className="h-3.5 w-3.5" />
                </Button>
              )}
              {showDeleteButton && onDeleteClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick();
                  }}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Semester + Day badges ── */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-primary/8 text-primary border-0 px-2 py-0.5"
          >
            {formatEnumLabel(schedule.semester.semester)}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-medium text-gray-600 border-gray-200 px-2 py-0.5 flex items-center gap-1"
          >
            <CalendarDays className="h-3 w-3" />
            {formatEnumLabel(schedule.day)}
          </Badge>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-gray-100" />

        {/* ── Timeline detail block ── */}
        <div className="flex gap-0 px-4 py-3 flex-1">
          {/* Left timeline line */}
          <div className="flex flex-col items-center mr-3 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary mt-0.5" />
            <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-gray-200 my-1" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-px flex-1 bg-gray-200 my-1" />
            <div className="w-2 h-2 rounded-full bg-gray-200" />
          </div>

          {/* Detail rows */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            {/* Time */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                {formatTime12h(schedule.startTime)} – {formatTime12h(schedule.endTime)}
              </span>
            </div>

            {/* Teacher */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
                {getTeacherName(schedule.teacher)}
              </span>
            </div>

            {/* Room */}
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
                {schedule.room.name || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-gray-100" />

        {/* ── Class info row ── */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 min-w-0 bg-gray-50/60">
          <GraduationCap className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-700 flex-shrink-0">
            {schedule.classes.code}
          </span>
          <span className="text-gray-300 flex-shrink-0">·</span>
          <span className="text-xs text-gray-500 truncate min-w-0 flex-1">
            {schedule.classes.major.name}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            {formatEnumLabel(schedule.classes.yearLevel)}
          </span>
          <span className="text-gray-300 flex-shrink-0">·</span>
          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            {schedule.semester.academyYear}
          </span>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-gray-100" />

        {/* ── Credits / Hours ── */}
        <div className="flex items-center gap-4 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-gray-500">
              Credits:{" "}
              <span className="font-semibold text-gray-700">
                {schedule.course.credit ?? "—"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
            <span className="text-xs text-gray-500">
              Hours:{" "}
              <span className="font-semibold text-gray-700">
                {schedule.course.totalHour ? `${schedule.course.totalHour}h` : "—"}
              </span>
            </span>
          </div>
        </div>

        {/* ── Survey button ── */}
        {showSurvey && schedule.surveyStatus !== "NONE" && surveyConfig && (
          <div className="px-4 pb-3 mt-auto">
            <div className="border-t border-gray-100 pt-2.5">
              <Button
                variant={surveyConfig.variant}
                size="sm"
                className={`h-7 px-3 text-xs font-medium gap-1.5 transition-all duration-150 ${surveyConfig.className}`}
                disabled={!surveyConfig.clickable}
                onClick={(e) => {
                  e.stopPropagation();
                  if (surveyConfig.clickable && onSurveyClick) {
                    onSurveyClick(schedule.id);
                  }
                }}
              >
                {surveyConfig.icon}
                {surveyConfig.text}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
