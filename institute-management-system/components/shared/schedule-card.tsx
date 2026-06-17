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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Teacher } from "@/model/schedules/all-schedule-model";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";

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
        shortText: "Done",
        clickable: false,
      };
    }
    if (schedule.surveyStatus === "NOT_STARTED") {
      return {
        variant: "default" as const,
        className: "bg-primary hover:bg-primary/90 text-white shadow-sm",
        icon: <FileText className="h-3.5 w-3.5" />,
        text: "Take Survey",
        shortText: "Survey",
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
      className={`group border-l-4 border-y border-r border-y-gray-100 border-r-gray-100 border-l-primary bg-white shadow-sm hover:shadow-md hover:border-l-primary/80 transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="flex">
          <div className="flex-1 p-3 sm:p-4 min-w-0">
            {/* ── Row 1: Course ── */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base font-bold text-primary flex-shrink-0">
                  {schedule.course.code}
                </span>
                <span className="text-gray-300 flex-shrink-0 hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
                  {schedule.course.nameEn || schedule.course.nameKH || "—"}
                </span>
              </div>

              {/* Day & Semester badges */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                  {schedule.semester.semester}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:inline-flex">
                  <CalendarDays className="h-3 w-3" />
                  {schedule.day || "—"}
                </span>
              </div>
            </div>

            {/* Day (mobile only) */}
            <div className="sm:hidden mt-1 flex items-center gap-1 text-xs text-gray-500">
              <CalendarDays className="h-3 w-3" />
              <span>{schedule.day || "—"}</span>
            </div>

            {/* ── Row 2: Class info ── */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0">
                <GraduationCap className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 flex-shrink-0">Class:</span>
                <span className="text-xs font-semibold text-primary flex-shrink-0">
                  {schedule.classes.code}
                </span>
                <span className="text-gray-300 flex-shrink-0 hidden sm:inline">•</span>
                <span className="text-xs text-gray-600 truncate min-w-0 hidden sm:block">
                  {schedule.classes.major.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                  {schedule.classes.yearLevel}
                </span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                  {schedule.semester.academyYear}
                </span>
              </div>
            </div>

            {/* Major (mobile only) */}
            <div className="sm:hidden mt-1 text-xs text-gray-500 truncate">
              {schedule.classes.major.name}
            </div>

            {/* ── Divider ── */}
            <div className="my-2.5 sm:my-3 border-t border-gray-100" />

            {/* ── Row 3: Schedule details + actions ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              {/* Time / Teacher / Room */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {schedule.startTime} – {schedule.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
                    {getTeacherName(schedule.teacher)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                    {schedule.room.name || "—"}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {hasActions && (
                <div className="flex items-center gap-1.5 flex-shrink-0 sm:ml-3">
                  {showSurvey && schedule.surveyStatus !== "NONE" && surveyConfig && (
                    <Button
                      variant={surveyConfig.variant}
                      size="sm"
                      className={`h-7 px-2.5 text-xs font-medium transition-all duration-150 ${surveyConfig.className}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (surveyConfig.clickable && onSurveyClick) {
                          onSurveyClick(schedule.id);
                        }
                      }}
                      disabled={!surveyConfig.clickable}
                    >
                      {surveyConfig.icon}
                      <span className="ml-1 sm:hidden">{surveyConfig.shortText}</span>
                      <span className="ml-1 hidden sm:inline">{surveyConfig.text}</span>
                    </Button>
                  )}

                  {showEditButton && onEditClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-150"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(schedule.id);
                      }}
                    >
                      <Pen className="h-3 w-3" />
                    </Button>
                  )}

                  {showDeleteButton && onDeleteClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-150"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick();
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* ── Credits (desktop only) ── */}
            {schedule.course.credit && (
              <div className="mt-2 pt-2 border-t border-gray-50 hidden sm:flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-500">Credits:</span>
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded font-semibold">
                    {schedule.course.credit}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-500">Total Hours:</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-semibold">
                    {schedule.course.totalHour}h
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
