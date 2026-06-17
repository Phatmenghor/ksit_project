"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Clock } from "lucide-react";
import {
  DAYS_OF_WEEK,
  DayType,
  SemesterFilter,
  StatusEnum,
} from "@/constants/constant";
import Loading from "@/components/shared/loading";
import { toast } from "sonner";
import { getAllMyScheduleService } from "@/service/schedule/schedule.service";
import { AllScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { useRouter, useSearchParams } from "next/navigation";

import { AllScheduleFilterModel } from "@/model/schedules/type-schedule-model";
import { usePagination } from "@/hooks/use-pagination";
import ScheduleCard from "@/components/shared/schedule-card";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";

const WEEKDAY_VALUES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const getCurrentDay = (): DayType => {
  const dayValue = WEEKDAY_VALUES[new Date().getDay()];
  return DAYS_OF_WEEK.find((d) => d.value === dayValue) ?? DAYS_OF_WEEK[0];
};

const ScheduleAllPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DayType>(getCurrentDay());
  const [scheduleData, setScheduleData] = useState<AllScheduleModel | null>(
    null
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedCourse, setSelectCourse] = useState<CourseModel | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.SURVEY.STUDENT_RECORDS,
    defaultPageSize: 10,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const fetchSchedule = useCallback(
    async (filters: AllScheduleFilterModel) => {
      setIsLoading(true);
      try {
        const baseFilters = {
          search: debouncedSearchQuery,
          status: StatusEnum.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          courseId: selectedCourse?.id,
          academyYear: selectedYear,
          semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
          dayOfWeek:
            selectedDay?.value !== "ALL" ? selectedDay?.value : undefined,
          ...filters,
        };

        const response = await getAllMyScheduleService(baseFilters);

        setScheduleData(response);
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch (error) {
        toast.error("An error occurred while loading classes");
        setScheduleData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedSearchQuery,
      currentPage,
      selectedDay,
      selectedYear,
      selectedSemester,
      selectedCourse?.id,
    ]
  );

  useEffect(() => {
    if (selectedDay) {
      fetchSchedule({ pageNo: currentPage });
    }
  }, [
    selectedDay,
    selectedYear,
    selectedSemester,
    debouncedSearchQuery,
    currentPage,
    selectedCourse?.id,
  ]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateUrlWithPage(1);
  };

  const handleSemesterChange = (
    semester: string | number | null | undefined
  ) => {
    setSelectedSemester(semester ? String(semester) : "ALL");
    updateUrlWithPage(1);
  };

  const handleCourseChange = (course: CourseModel) => {
    setSelectCourse(course);
    updateUrlWithPage(1);
  };

  const handleDayChange = (value: string | number | null | undefined) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === value) ?? DAYS_OF_WEEK[0];
    setSelectedDay(day);
    updateUrlWithPage(1);
  };

  const handleCardClick = (scheduleId: number) => {
    router.push(ROUTE.SURVEY.STUDENT_RECORD(String(scheduleId)));
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "All Schedule" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "All Schedule",
          totalCount: scheduleData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search room, instructor...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "year",
              type: "year",
              label: "Academic Year",
              value: selectedYear,
              onChange: handleYearChange,
            },
            {
              id: "day",
              type: "select",
              label: "Day",
              placeholder: "Select a day",
              value: selectedDay.value,
              onChange: (v) => handleDayChange(v),
              options: DAYS_OF_WEEK.map((day) => ({
                value: day.value,
                label: day.label,
              })),
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              placeholder: "Select a semester",
              value: selectedSemester,
              onChange: (v) => handleSemesterChange(v),
              options: SemesterFilter.map((semester) => ({
                value: semester.value,
                label: semester.label,
              })),
            },
            {
              id: "course",
              type: "custom",
              label: "Course",
              value: selectedCourse ?? null,
              onChange: (v) => handleCourseChange(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Course</label>
                  <ComboboxSelectCourse
                    dataSelect={value}
                    onChangeSelected={onChange}
                    className="h-9"
                  />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            setSelectedYear(new Date().getFullYear());
            setSelectedDay(getCurrentDay());
            setSelectedSemester("ALL");
            setSelectCourse(null);
            setSearchQuery("");
          },
        }}
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h2 className="text-lg font-bold">{selectedDay.label}</h2>
            <p className="text-sm text-muted-foreground">
              Total Schedule: {scheduleData?.totalElements || 0}
            </p>
          </div>

          {isLoading ? (
            <Loading />
          ) : (
            <div>
              {scheduleData && scheduleData.totalElements > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduleData.content.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onClick={handleCardClick}
                      showSurvey={true}
                      onSurveyClick={(scheduleId) => {
                        router.push(ROUTE.SURVEY.SURVEY_FORM(String(scheduleId)));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-amber-500" />
                    </div>
                  </div>
                  <p className="text-lg font-medium">
                    No classes scheduled for {selectedDay?.label}
                  </p>
                  <p className="text-sm mt-2 opacity-60">
                    Try selecting a different day or check back later
                  </p>
                </div>
              )}
            </div>
          )}

          {!isLoading && scheduleData && scheduleData.totalPages > 1 && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={scheduleData.totalPages}
              onPageChange={handlePageChange}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleAllPage;
