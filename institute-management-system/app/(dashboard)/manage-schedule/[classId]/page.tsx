"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK, DayType, SemesterFilter, StatusEnum } from "@/constants/constant";
import Loading from "@/components/shared/loading";
import { toast } from "sonner";
import {
  deleteScheduleService,
  getAllScheduleService,
} from "@/service/schedule/schedule.service";
import {
  AllScheduleModel,
  ScheduleModel,
} from "@/model/attendance/schedule/schedule-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { useParams, useRouter, useSearchParams } from "next/navigation";

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
import DuplicateScheduleModal from "@/components/dashboard/manage-schedule/duplicate-schedule-modal";
import { usePagination } from "@/hooks/use-pagination";
import ScheduleCard from "@/components/shared/schedule-card";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

const ALL_DAY: DayType = { label: "All", value: "ALL" };

const AllSchedulePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DayType>(ALL_DAY);
  const [scheduleData, setScheduleData] = useState<AllScheduleModel | null>(
    null
  );
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDuplicateScheduleModalOpen, setIsDuplicateScheduleModalOpen] =
    useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isHydrated, setIsHydrated] = useState(false);
  const [classId, setClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setSelectedYear(new Date().getFullYear());

    if (params?.classId) {
      setClassId(Number(params.classId));
    }

    setIsHydrated(true);
  }, [params?.classId]);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.MANAGE_SCHEDULE.All_SCHEDULE_DETAIL(String(classId)),
    defaultPageSize: 10,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;

    const timer = setTimeout(() => {
      const pageParam = searchParams.get("pageNo");
      if (!pageParam) {
        updateUrlWithPage(1, true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams, updateUrlWithPage, isHydrated]);

  const fetchSchedule = useCallback(
    async (filters: AllScheduleFilterModel) => {
      if (!classId || !isHydrated) return;

      setIsLoading(true);
      try {
        const baseFilters = {
          classId: classId,
          search: debouncedSearchQuery,
          status: StatusEnum.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          academyYear: selectedYear,
          semester: selectedSemester != "ALL" ? selectedSemester : undefined,
          dayOfWeek:
            selectedDay?.value !== "ALL" ? selectedDay?.value : undefined,
          ...filters,
        };

        const response = await getAllScheduleService(baseFilters);

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
      classId,
      debouncedSearchQuery,
      selectedDay,
      selectedYear,
      currentPage,
      selectedSemester,
      isHydrated,
    ]
  );

  useEffect(() => {
    if (selectedDay && isHydrated && classId) {
      fetchSchedule({ pageNo: currentPage });
    }
  }, [
    selectedDay,
    debouncedSearchQuery,
    currentPage,
    selectedSemester,
    fetchSchedule,
  ]);

  const handleDaySelect = (value: string | number | null | undefined) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === value) ?? ALL_DAY;
    setSelectedDay(day);
    updateUrlWithPage(1);
  };

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

  const handleEditClick = (scheduleId: number) => {
    router.push(`/manage-schedule/${scheduleId}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedSchedule?.id) return;
    setIsSubmitting(true);

    try {
      const response = await deleteScheduleService(selectedSchedule.id);

      if (response) {
        toast.success("Schedule deleted successfully");

        setScheduleData((prevData) => {
          if (!prevData) return null;

          const updatedContent = prevData.content.filter(
            (schedule) => schedule.id !== selectedSchedule.id
          );

          return {
            ...prevData,
            content: updatedContent,
            totalElements: prevData.totalElements - 1,
          };
        });

        setSelectedSchedule(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Failed to delete schedule");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (schedule: ScheduleModel) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  const handleCardClick = (scheduleId: number) => {
    router.push(ROUTE.STUDENT_LIST(String(scheduleId)));
  };

  if (!isHydrated) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb
            items={[
              { label: "Department List", href: ROUTE.MANAGE_SCHEDULE.DEPARTMENT },
              { label: "Class" },
            ]}
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full flex-shrink-0 hover:cursor-pointer"
            >
              <img
                src={AppIcons.Back}
                alt="back Icon"
                className="h-4 w-4 text-muted-foreground"
              />
            </Button>
            <h3 className="text-lg sm:text-xl font-bold truncate">
              Class Schedule List
            </h3>
          </div>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: selectedDay.label,
          totalCount: scheduleData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search class...",
          onSearchChange: handleSearchChange,
          extraActions: (
            <Button
              onClick={() => setIsDuplicateScheduleModalOpen(true)}
              className="bg-teal-900 hover:bg-teal-950 h-9"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          ),
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
              onChange: (v) => handleDaySelect(v),
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
            {
              id: "semester",
              type: "custom",
              label: "Semester",
              value: selectedSemester,
              onChange: (v) => handleSemesterChange(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Semester</label>
                  <Select onValueChange={onChange} value={value}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select semester" />
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
              ),
            },
          ],
        }}
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4">
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
                      showEditButton={true}
                      showDeleteButton={true}
                      onDeleteClick={() => handleDeleteClick(schedule)}
                      onEditClick={(scheduleId) => {
                        handleEditClick(scheduleId);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No classes scheduled for {selectedDay?.label || "this day"}.
                </div>
              )}
            </div>
          )}

          <DuplicateScheduleModal
            sources={
              scheduleData?.content
                ? Array.from(
                    new Set(
                      scheduleData.content.map(
                        (s) => `${s.classes.id}-${s.semester.id}`
                      )
                    )
                  ).map((key) => {
                    const [sourceClassId, sourceSemesterId] = key
                      .split("-")
                      .map((v) => parseInt(v));
                    return { sourceClassId, sourceSemesterId };
                  })
                : []
            }
            isOpen={isDuplicateScheduleModalOpen}
            onOpenChange={() => setIsDuplicateScheduleModalOpen(false)}
          />
          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setSelectedSchedule(null);
              setIsDeleteDialogOpen(false);
            }}
            onDelete={handleDelete}
            title="Delete Schedule"
            description={
              selectedSchedule && (
                <>
                  Are you sure you want to delete this schedule?
                  <br />
                  <br />
                  <strong>Class:</strong> {selectedSchedule.classes.code} <br />
                  <strong>Course:</strong> {selectedSchedule.course.nameEn} <br />
                  <strong>Teacher:</strong>{" "}
                  {selectedSchedule.teacher.englishFirstName}{" "}
                  {selectedSchedule.teacher.englishLastName} <br />
                  <strong>Day:</strong> {selectedSchedule.day} <br />
                  <strong>Time:</strong> {selectedSchedule.startTime} -{" "}
                  {selectedSchedule.endTime} <br />
                  <strong>Room:</strong> {selectedSchedule.room.name} <br />
                  <strong>Semester:</strong> {selectedSchedule.semester.semester}{" "}
                  ({selectedSchedule.semester.academyYear})
                </>
              )
            }
            isSubmitting={isSubmitting}
          />

          {!isLoading && scheduleData && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={scheduleData.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllSchedulePage;
