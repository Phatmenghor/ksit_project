// ScheduleCard.tsx
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Teacher } from "@/model/schedules/all-schedule-model";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";

interface ScheduleCardProps {
  schedule: ScheduleModel;
  onClick?: (scheduleId: number) => void;
  className?: string;
  showSurvey?: boolean; // Optional prop to control survey visibility
  onSurveyClick?: (scheduleId: number) => void; // Optional callback for survey click
  showEditButton?: boolean; // Optional prop to control edit button visibility
  showDeleteButton?: boolean; // Optional prop to control edit button visibility
  onEditClick?: (scheduleId: number) => void; // Optional callback for edit click
  onDeleteClick?: () => void; // Optional callback for edit click
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  className = "",
  showSurvey = false, // Default to false
  onSurveyClick,
  showEditButton = false, // Default to false
  onEditClick,
  showDeleteButton = false, // Default to false
  onDeleteClick,
}) => {
  const getTeacherName = (teacher?: Teacher): string => {
    if (!teacher) return "- - -";

    const englishName =
      teacher.englishFirstName || teacher.englishLastName
        ? `${teacher.englishFirstName || ""} ${
            teacher.englishLastName || ""
          }`.trim()
        : null;

    const khmerName =
      teacher.khmerFirstName || teacher.khmerLastName
        ? `${teacher.khmerFirstName || ""} ${
            teacher.khmerLastName || ""
          }`.trim()
        : null;

    return englishName || khmerName || "- - -";
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(schedule.id);
    }
  };

  const getSurveyButtonConfig = () => {
    const isCompleted = schedule.surveyStatus === "COMPLETED";
    const isNotStarted = schedule.surveyStatus === "NOT_STARTED";

    if (isCompleted) {
      return {
        variant: "outline" as const,
        className:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 cursor-default shadow-sm",
        icon: <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
        text: "Completed",
        shortText: "Done",
        clickable: false,
      };
    } else if (isNotStarted) {
      return {
        variant: "default" as const,
        className:
          "bg-primary hover:bg-teal-800 text-white shadow-md hover:shadow-lg transition-all duration-200",
        icon: <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
        text: "Take Survey",
        shortText: "Survey",
        clickable: true,
      };
    }

    return null;
  };

  return (
    <Card
      className={`overflow-hidden bg-amber-50/30 cursor-pointer transition-transform duration-200 hover:scale-[1.01] hover:shadow-md ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 relative overflow-hidden">
        <div className="relative">
          <div className="p-3 sm:p-4 flex-1">
            <div className="flex gap-2 rounded-lg">
              {/* Amber accent bar */}
              <div className="w-1 sm:w-1.5 bg-amber-500 rounded-full" />

              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Top row - Course Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1 font-medium text-amber-600 min-w-0 flex-1">
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-semibold flex-shrink-0 text-sm sm:text-base">
                      {schedule.course.code}
                    </span>
                    <span className="text-gray-600 flex-shrink-0 hidden sm:inline">
                      •
                    </span>
                    <span className="text-xs sm:text-sm truncate min-w-0">
                      {schedule.course.nameEn ||
                        schedule.course.nameKH ||
                        "- - -"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-blue-100 text-blue-700 whitespace-nowrap">
                      {schedule.semester.semester}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
                      {schedule.day || "- - -"}
                    </span>
                  </div>
                </div>

                {/* Bottom row - Class Info */}
                <div className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-800 mt-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-medium flex-shrink-0">Class:</span>
                    <span className="text-amber-600 font-semibold flex-shrink-0">
                      {schedule.classes.code}
                    </span>
                    <span className="text-gray-500 flex-shrink-0 hidden sm:inline">
                      •
                    </span>
                    <span className="truncate min-w-0">
                      {schedule.classes.major.name}
                    </span>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="px-1 sm:px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium whitespace-nowrap">
                      {schedule.classes.yearLevel}
                    </span>
                    <span className="px-1 sm:px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium whitespace-nowrap">
                      Y{schedule.semester.academyYear}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2 sm:my-3" />

            {/* Bottom info section - Responsive layout */}
            <div className="space-y-3 sm:space-y-0">
              {/* Mobile: Stack vertically, Desktop: Single row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Schedule details */}
                <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                  {/* Time - Always first */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>

                  {/* Teacher and Room - Side by side on mobile, inline on desktop */}
                  <div className="grid grid-cols-2 sm:contents gap-2 sm:gap-4 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm min-w-0">
                        {getTeacherName(schedule.teacher)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium whitespace-nowrap text-xs sm:text-sm">
                        {schedule.room.name || "- - -"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons - Full width on mobile, auto on desktop */}
                <div className="flex items-center justify-center sm:justify-end gap-2 flex-shrink-0 w-full sm:w-auto">
                  {/* Survey Button */}
                  {showSurvey &&
                    schedule.surveyStatus !== "NONE" &&
                    (() => {
                      const buttonConfig = getSurveyButtonConfig();
                      if (!buttonConfig) return null;

                      return (
                        <Button
                          variant={buttonConfig.variant}
                          size="sm"
                          className={`h-7 sm:h-8 px-2 sm:px-3 font-medium text-xs transition-all duration-200 whitespace-nowrap flex-1 sm:flex-initial ${buttonConfig.className}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (buttonConfig.clickable && onSurveyClick) {
                              onSurveyClick(schedule.id);
                            }
                          }}
                          disabled={!buttonConfig.clickable}
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            {buttonConfig.icon}
                            <span className="sm:hidden">
                              {buttonConfig.shortText}
                            </span>
                            <span className="hidden sm:inline">
                              {buttonConfig.text}
                            </span>
                          </div>
                        </Button>
                      );
                    })()}

                  {/* Delete Button */}
                  {showDeleteButton && onDeleteClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 active:bg-red-200 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs whitespace-nowrap flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick();
                      }}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {/* Edit Button */}
                  {showEditButton && onEditClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 sm:h-8 px-2 sm:px-3 border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:border-amber-400 hover:text-amber-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs whitespace-nowrap flex-1 sm:flex-initial"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(schedule.id);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Pen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Credit hours - Hide on very small screens, show compactly */}
            {schedule.course.credit && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 hidden sm:flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Credits:</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                    {schedule.course.credit}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Hours:</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
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
