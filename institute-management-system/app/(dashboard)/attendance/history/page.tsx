"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Clock } from "lucide-react";
import { DAYS_OF_WEEK, DayType, StatusEnum } from "@/constants/constant";
import Loading from "@/components/shared/loading";
import { toast } from "sonner";
import { getAllMyScheduleService } from "@/service/schedule/schedule.service";
import { AllScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { ScheduleFilterModel } from "@/model/attendance/schedule/schedule-filter";
import { useRouter, useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import ScheduleCard from "@/components/shared/schedule-card";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { YearSelector } from "@/components/shared/year-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const HistoryRecordSchedulePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DayType>(getCurrentDay());
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [scheduleData, setScheduleData] = useState<AllScheduleModel | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.ATTENDANCE.HISTORY_RECORD,
    defaultPageSize: 10,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  const fetchSchedule = useCallback(
    async (filters: ScheduleFilterModel) => {
      setIsLoading(true);
      try {
        const response = await getAllMyScheduleService({
          search: debouncedSearchQuery,
          status: StatusEnum.ACTIVE,
          academyYear: selectedYear,
          pageNo: currentPage,
          pageSize: 30,
          dayOfWeek:
            selectedDay && selectedDay.value !== "ALL"
              ? selectedDay.value
              : undefined,
          ...filters,
        });
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
    [debouncedSearchQuery, selectedDay, selectedYear, currentPage]
  );

  useEffect(() => {
    if (selectedDay) {
      fetchSchedule({ pageNo: currentPage });
    }
  }, [selectedDay, selectedYear, debouncedSearchQuery, currentPage]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateUrlWithPage(1);
  };

  const handleDayChange = (value: string | number | null | undefined) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === value) ?? DAYS_OF_WEEK[0];
    setSelectedDay(day);
    updateUrlWithPage(1);
  };

  const handleCardClick = (scheduleId: number) => {
    router.push(
      `${ROUTE.ATTENDANCE.STUDENT_LIST_HISTORY_RECORD(String(scheduleId))}`
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Class Schedule List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Class Schedule List",
          totalCount: scheduleData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search room, instructor...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "year",
              type: "custom",
              label: "Academic Year",
              value: selectedYear,
              onChange: (v) => handleYearChange(v ?? new Date().getFullYear()),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Academic Year</label>
                  <YearSelector value={value} onChange={onChange} className="h-9" />
                </div>
              ),
            },
            {
              id: "day",
              type: "custom",
              label: "Day",
              value: selectedDay.value,
              onChange: (v) => handleDayChange(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Day</label>
                  <Select onValueChange={onChange} value={value}>
                    <SelectTrigger className="h-9">
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
                </div>
              ),
            },
          ],
          onClearAll: () => {
            setSelectedYear(new Date().getFullYear());
            setSelectedDay(getCurrentDay());
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

export default HistoryRecordSchedulePage;
