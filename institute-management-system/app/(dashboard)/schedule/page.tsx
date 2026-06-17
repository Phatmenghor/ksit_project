"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DAYS_OF_WEEK,
  DayType,
  SemesterFilter,
  StatusEnum,
} from "@/constants/constant";
import Loading from "@/components/shared/loading";
import { toast } from "sonner";
import { getAllMyScheduleService } from "@/service/schedule/schedule.service";
import { useDebounce } from "@/utils/debounce/debounce";
import PaginationPage from "@/components/shared/pagination-page";
import { useRouter, useSearchParams } from "next/navigation";

import { AllScheduleFilterModel } from "@/model/schedules/type-schedule-model";
import { YearSelector } from "@/components/shared/year-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppIcons } from "@/constants/icons/icon";
import { usePagination } from "@/hooks/use-pagination";
import ScheduleCard from "@/components/shared/schedule-card";
import { AllScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";

const ScheduleAllPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DayType>({
    label: "All",
    value: "ALL",
  });
  const [scheduleData, setScheduleData] = useState<AllScheduleModel | null>(
    null
  );
  const [selectedCourse, setSelectCourse] = useState<CourseModel | null>(null);

  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.SCHEDULE.ROOT,
    defaultPageSize: 10,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  // Then add this effect for initial URL setup
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      // Use replace: true to avoid adding to browser history
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
          academyYear: selectedYear,
          pageNo: currentPage,
          courseId: selectedCourse?.id,
          pageSize: 30,
          semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
          dayOfWeek:
            selectedDay?.value !== "ALL" ? selectedDay?.value : undefined,
          ...filters,
        };

        const response = await getAllMyScheduleService(baseFilters);

        setScheduleData(response);
      } catch (error) {
        toast.error("An error occurred while loading classes");
        setScheduleData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedSearchQuery,
      selectedDay,
      currentPage,
      selectedYear,
      selectedSemester,
      selectedCourse?.id,
      updateUrlWithPage,
    ]
  );

  // Fetch schedule when any filter changes
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
    fetchSchedule,
    selectedCourse?.id,
  ]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateUrlWithPage(1);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    updateUrlWithPage(1);
  };

  const handleDayChange = (value: string) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === value) ?? DAYS_OF_WEEK[0];
    setSelectedDay(day);
    updateUrlWithPage(1);
  };

  const handleCardClick = (scheduleId: number) => {
    router.push(ROUTE.STUDENT_LIST(String(scheduleId)));
  };

  const handleCourseChange = (course: CourseModel) => {
    setSelectCourse(course);
    updateUrlWithPage(1);
  };

  return (
    <div className="space-y-4">
      <CardHeaderSection
        title="All Schedule"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Schedule", href: ROUTE.SCHEDULE.ROOT },
        ]}
        searchPlaceholder="Search room, instructor..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
      >
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full sm:w-auto"
          />

          <Select onValueChange={handleDayChange} value={selectedDay.value}>
            <SelectTrigger className="w-full sm:w-[160px] gap-2">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={handleSemesterChange}
            value={selectedSemester}
          >
            <SelectTrigger className="w-full sm:w-[180px] gap-2">
              <img
                src={AppIcons.Filter}
                alt="Time Icon"
                className="h-4 w-4 text-muted-foreground"
              />
              <SelectValue placeholder="Select a semester" />
            </SelectTrigger>
            <SelectContent>
              {SemesterFilter.map((semester) => (
                <SelectItem key={semester.value} value={semester.value}>
                  {semester.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-full sm:w-[220px]">
            <ComboboxSelectCourse
              dataSelect={selectedCourse}
              onChangeSelected={handleCourseChange}
            />
          </div>
        </div>
      </CardHeaderSection>

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

          {/* Pagination */}
          {!isLoading && scheduleData && scheduleData.totalPages > 1 && (
            <div className="mt-8 flex justify-end">
              <div>
                <PaginationPage
                  currentPage={currentPage}
                  totalPages={scheduleData.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleAllPage;
