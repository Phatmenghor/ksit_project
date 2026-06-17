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
  Eye,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Teacher } from "@/model/schedules/all-schedule-model";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { formatEnumLabel } from "@/utils/general/format-enum-label";

interface ScheduleCardProps {
  schedule: ScheduleModel;
  onClick?: (scheduleId: number) => void;
  className?: string;
  showSurvey?: boolean;
  onSurveyClick?: (scheduleId: number) => void;
  showViewButton?: boolean;
  onViewClick?: (scheduleId: number) => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onEditClick?: (scheduleId: number) => void;
  onDeleteClick?: () => void;
}

function formatTime12h(time?: string): string {
  if (!time) return "—";
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr ?? "00"} ${period}`;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  className = "",
  showSurvey = false,
  onSurveyClick,
  showViewButton = false,
  onViewClick,
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
    (showViewButton && onViewClick) ||
    (showDeleteButton && onDeleteClick) ||
    (showEditButton && onEditClick);

  return (
    <Card
      className={`group h-full flex flex-col border-2 border-primary/30 bg-white shadow-sm hover:shadow-md hover:border-primary/60 transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col gap-2.5 h-full">
        {/* Group 1: Course identity */}
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
            {schedule.course.code}
          </span>
          <span className="text-gray-300 flex-shrink-0">|</span>
          <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
            {schedule.course.nameEn || schedule.course.nameKH || "—"}
          </span>
        </div>

        {/* Group 2: Semester / Day */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{formatEnumLabel(schedule.semester.semester)}</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatEnumLabel(schedule.day)}
          </span>
        </div>

        {/* Group 3: Class info */}
        <div className="flex items-center gap-1.5 min-w-0">
          <GraduationCap className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 flex-shrink-0">Class:</span>
          <span className="text-xs font-medium text-gray-700 flex-shrink-0">
            {schedule.classes.code}
          </span>
          <span className="text-gray-300 flex-shrink-0">•</span>
          <span className="text-xs text-gray-600 truncate min-w-0 flex-1">
            {schedule.classes.major.name}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            {formatEnumLabel(schedule.classes.yearLevel)}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            {schedule.semester.academyYear}
          </span>
        </div>

        <div className="border-t border-gray-100" />

        {/* Group 4: Time / Teacher / Room */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
            {formatTime12h(schedule.startTime)} – {formatTime12h(schedule.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
            {getTeacherName(schedule.teacher)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 truncate min-w-0">
            {schedule.room.name || "—"}
          </span>
        </div>

        <div className="border-t border-gray-100" />

        {/* Group 5: Credits / Total hours (always rendered for consistent height) */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            <span className="text-gray-500">Credits:</span>{" "}
            <span className="font-medium text-gray-700">
              {schedule.course.credit ?? "—"}
            </span>
          </span>
          <span>
            <span className="text-gray-500">Total Hours:</span>{" "}
            <span className="font-medium text-gray-700">
              {schedule.course.totalHour ? `${schedule.course.totalHour}h` : "—"}
            </span>
          </span>
        </div>

        {/* Group 6: Actions */}
        {hasActions && (
          <div className="flex items-center gap-1.5 mt-auto pt-1.5 border-t border-gray-50">
            {showSurvey && schedule.surveyStatus !== "NONE" && surveyConfig && (
              <Button
                variant={surveyConfig.variant}
                size="sm"
                className={`h-7 px-2.5 text-xs font-medium gap-1 transition-all duration-150 ${surveyConfig.className}`}
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
            )}

            {showViewButton && onViewClick && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewClick(schedule.id);
                }}
              >
                <Eye className="h-3 w-3" />
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
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
