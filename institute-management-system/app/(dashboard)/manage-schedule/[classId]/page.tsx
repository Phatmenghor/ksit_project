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
  fetchAllSchedulesService,
} from "@/features/schedules/store/thunks/schedule-thunks";
import { useAppDispatch } from "@/store";
import {
  AllScheduleModel,
  ScheduleModel,
} from "@/model/attendance/schedule/schedule-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { AllScheduleFilterModel } from "@/model/schedules/type-schedule-model";
import DuplicateScheduleModal from "@/components/dashboard/manage-schedule/duplicate-schedule-modal";
import { usePagination } from "@/hooks/use-pagination";
import ScheduleCard from "@/components/shared/schedule-card";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
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
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSelectedYear(new Date().getFullYear());

    if (params?.classId) {
      setClassId(Number(params.classId));
    }

    setIsHydrated(true);
  }, [params?.classId]);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.MANAGE_SCHEDULE.All_SCHEDULE_DETAIL(String(classId)),
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
          pageSize: currentPageSize,
          academyYear: selectedYear,
          semester: selectedSemester != "ALL" ? selectedSemester : undefined,
          dayOfWeek:
            selectedDay?.value !== "ALL" ? selectedDay?.value : undefined,
          ...filters,
        };

        const response = await dispatch(fetchAllSchedulesService(baseFilters)).unwrap();

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
      dispatch,
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
      await dispatch(deleteScheduleService(selectedSchedule.id)).unwrap();

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
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Class Schedule List",
          onBack: () => router.back(),
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
              value: selectedYear ?? 0,
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
              onChange: (v) => handleDaySelect(v),
              options: DAYS_OF_WEEK.map((day) => ({
                value: day.value,
                label: day.label,
              })),
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              placeholder: "Select semester",
              value: selectedSemester,
              onChange: (v) => handleSemesterChange(v),
              options: SemesterFilter.map((semester) => ({
                value: semester.value,
                label: semester.label,
              })),
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
            onSuccess={() => fetchSchedule({ pageNo: currentPage })}
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
              pageSize={currentPageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllSchedulePage;
