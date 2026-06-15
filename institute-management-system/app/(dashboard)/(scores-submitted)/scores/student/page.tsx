"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ROUTE } from "@/constants/routes";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
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
import { AllScheduleModel } from "@/model/attendance/schedule/schedule-model";
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
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { AppIcons } from "@/constants/icons/icon";
import { usePagination } from "@/hooks/use-pagination";
import ScheduleCard from "@/components/shared/schedule-card";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { ScheduleFilterModel } from "@/model/attendance/schedule/schedule-filter";

export default function AllSchedulePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<DayType>({
    label: "All",
    value: "ALL",
  });
  const [scheduleData, setScheduleData] = useState<AllScheduleModel | null>(
    null
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(
    undefined
  );

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange } =
    usePagination({
      baseRoute: ROUTE.SCORES.STUDENT_SCORE,
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
        const baseFilters: ScheduleFilterModel = {
          search: debouncedSearchQuery,
          status: StatusEnum.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          classId: selectedClass?.id,
          academyYear: selectedYear,
          semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
          dayOfWeek:
            selectedDay?.value !== "ALL" ? selectedDay?.value : undefined,
          ...filters,
        };

        const response = await getAllMyScheduleService(baseFilters);
        setScheduleData(response);
        // Handle case where current page exceeds total pages
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch {
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
      selectedClass,
      selectedYear,
      selectedSemester,
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
    selectedClass,
    debouncedSearchQuery,
    currentPage,
  ]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateUrlWithPage(1);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    updateUrlWithPage(1);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleDaySelect = (day: DayType) => {
    setSelectedDay(day);
    updateUrlWithPage(1);
  };

  const handleCardClick = (scheduleId: number) => {
    router.push(ROUTE.SCORES.STUDENT_SCORE_DETAIL(String(scheduleId)));
  };
  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
  };

  return (
    <div>
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Student Score", href: "" },
        ]}
        searchValue={searchQuery}
        searchPlaceholder="Search..."
        title="Student Score"
        onSearchChange={handleSearchChange}
        customSelect={
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
            <div className="w-full min-w-[200px] md:w-1/2">
              <div className="w-full min-w-[200px]">
                <YearSelector
                  title="Select Year"
                  onChange={handleYearChange}
                  value={selectedYear || 0}
                />
              </div>
            </div>

            <div className="w-full min-w-[200px] md:w-1/2">
              <ComboboxSelectClass
                dataSelect={selectedClass ?? null}
                onChangeSelected={handleClassChange}
              />
            </div>

            <Select
              onValueChange={handleSemesterChange}
              value={selectedSemester}
            >
              <SelectTrigger>
                <img
                  src={AppIcons.Filter}
                  alt="Time Icon"
                  className="h-4 w-4 text-muted-foreground"
                />
                <SelectValue
                  className="underline underline-offset-1"
                  placeholder="Select a semester"
                />
              </SelectTrigger>
              <SelectContent>
                {SemesterFilter.map((semester) => (
                  <SelectItem key={semester.value} value={semester.value}>
                    {semester.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="relative flex items-center my-6 ">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 z-10 rounded-full"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 px-16 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {DAYS_OF_WEEK.map((day, index) => (
            <Button
              key={day.label}
              variant={selectedDay?.value === day.value ? "default" : "outline"}
              className={`whitespace-nowrap transition-colors duration-200 ${
                selectedDay?.value === day.value
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "hover:bg-amber-100"
              }`}
              onClick={() => handleDaySelect(day)}
            >
              {day.label}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 z-10 rounded-full"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="mb-4">
          <h2 className="text-lg font-bold">
            {selectedDay ? `${selectedDay.label}` : ""}
          </h2>
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
      </div>
    </div>
  );
}
