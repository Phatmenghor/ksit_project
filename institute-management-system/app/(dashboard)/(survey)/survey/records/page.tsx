"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Clock, CalendarX } from "lucide-react";
import { DAYS_OF_WEEK, DayType, SemesterFilter, StatusEnum } from "@/constants/constant";
import Loading from "@/components/shared/loading";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import ScheduleCard from "@/components/shared/schedule-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectScheduleData,
  selectScheduleIsLoading,
  selectScheduleFilters,
} from "@/features/schedules/store/selectors/schedule-selectors";
import {
  setSearchFilter,
  setDayFilter,
  setSemesterFilter,
  setAcademicYearFilter,
  setCourseFilter,
  setPageNo,
} from "@/features/schedules/store/slice/schedule-slice";
import { fetchMySchedulesService } from "@/features/schedules/store/thunks/schedule-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

const WEEKDAY_VALUES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const getCurrentDay = (): DayType => {
  const dayValue = WEEKDAY_VALUES[new Date().getDay()];
  return DAYS_OF_WEEK.find((d) => d.value === dayValue) ?? DAYS_OF_WEEK[0];
};

const ScheduleAllPage = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectScheduleData);
  const isLoading = useAppSelector(selectScheduleIsLoading);
  const filters = useAppSelector(selectScheduleFilters);

  const [selectedCourse, setSelectedCourse] = useState<CourseModel | null>(null);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } =
    usePagination({ baseRoute: ROUTE.SURVEY.STUDENT_RECORDS });

  const searchDebounce = useDebounce(filters.search, 500);

  const selectedDay = DAYS_OF_WEEK.find((d) => d.value === filters.dayOfWeek) ?? getCurrentDay();

  const isMounted = useRef(false);

  useCachedEffect("survey-records", () => {
    dispatch(
      fetchMySchedulesService({
        search: searchDebounce,
        status: StatusEnum.ACTIVE,
        academyYear: filters.academicYear,
        pageNo: currentPage,
        pageSize: currentPageSize,
        dayOfWeek: filters.dayOfWeek !== "ALL" ? filters.dayOfWeek : undefined,
        semester: filters.semester !== "ALL" ? filters.semester : undefined,
        courseId: filters.courseId,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchDebounce, filters.dayOfWeek, filters.academicYear, filters.semester, filters.courseId, currentPage, currentPageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleYearChange = (year: number) => {
    dispatch(setAcademicYearFilter(year));
    updateUrlWithPage(1);
  };

  const handleDayChange = (value: string | number | null | undefined) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === value) ?? DAYS_OF_WEEK[0];
    dispatch(setDayFilter(day.value));
    dispatch(setPageNo(1));
    updateUrlWithPage(1);
  };

  const handleSemesterChange = (value: string | number | null | undefined) => {
    dispatch(setSemesterFilter(value ? String(value) : "ALL"));
    updateUrlWithPage(1);
  };

  const handleCourseChange = (course: CourseModel | null) => {
    setSelectedCourse(course);
    dispatch(setCourseFilter(course?.id));
    updateUrlWithPage(1);
  };

  const handleCardClick = (scheduleId: number) => {
    router.push(ROUTE.SURVEY.STUDENT_RECORD(String(scheduleId)));
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Survey Response Records" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Survey Response Records",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search room, instructor...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "year",
              type: "custom",
              label: "Academic Year",
              value: filters.academicYear ?? 0,
              onChange: (v: unknown) => handleYearChange((v as number) || 0),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <AcademyYearFilter
                  value={(value as number) ?? 0}
                  onChange={(y) => onChange(y)}
                />
              ),
            },
            {
              id: "day",
              type: "select",
              label: "Day",
              placeholder: "Select a day",
              value: selectedDay.value,
              onChange: (v) => handleDayChange(v),
              options: DAYS_OF_WEEK.map((day) => ({ value: day.value, label: day.label })),
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              placeholder: "Select a semester",
              value: filters.semester,
              onChange: (v) => handleSemesterChange(v),
              options: SemesterFilter.map((s) => ({ value: s.value, label: s.label })),
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
                  <ComboboxSelectCourse dataSelect={value} onChangeSelected={onChange} className="h-9" />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            dispatch(setSearchFilter(""));
            dispatch(setAcademicYearFilter(new Date().getFullYear()));
            dispatch(setDayFilter(getCurrentDay().value));
            dispatch(setSemesterFilter("ALL"));
            dispatch(setCourseFilter(undefined));
            setSelectedCourse(null);
          },
        }}
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{selectedDay.label}</h2>
            </div>
            <p className="text-sm text-muted-foreground">Total Schedule: {data?.totalElements || 0}</p>
          </div>

          {isLoading ? (
            <Loading />
          ) : (
            <div>
              {data && data.totalElements > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.content.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onClick={handleCardClick}
                      showSurvey={false}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarX}
                  message={`No classes scheduled for ${selectedDay?.label}`}
                  description="Try selecting a different day or check back later"
                />
              )}
            </div>
          )}

          {!isLoading && data && data.totalPages > 1 && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={data.totalPages}
              onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
              pageSize={currentPageSize}
              onPageSizeChange={handlePageSizeChange}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleAllPage;
