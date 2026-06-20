"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { Copy, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK, DayType, SemesterFilter, StatusEnum } from "@/constants/constant";
import Loading from "@/components/shared/loading";
import { toast } from "sonner";
import {
  deleteScheduleService,
  fetchAllSchedulesService,
} from "@/features/schedules/store/thunks/schedule-thunks";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectScheduleData,
  selectScheduleIsLoading,
} from "@/features/schedules/store/selectors/schedule-selectors";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { useParams, useRouter } from "next/navigation";
import DuplicateScheduleModal from "@/components/dashboard/manage-schedule/duplicate-schedule-modal";
import { usePagination } from "@/hooks/use-pagination";
import ScheduleCard from "@/components/shared/schedule-card";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useCachedList } from "@/hooks/use-cached-list";

const ALL_DAY: DayType = { label: "All", value: "ALL" };

const AllSchedulePage = () => {
  const dispatch = useAppDispatch();
  // Read data directly from Redux — the singleton store persists it across navigation.
  const scheduleData = useAppSelector(selectScheduleData);
  const isLoading = useAppSelector(selectScheduleIsLoading);

  const params = useParams();
  const classId = params?.classId ? Number(params.classId) : null;
  const router = useRouter();

  // Filters persist per-classId across navigation via module-level storage.
  const [searchQuery, setSearchQuery] = usePersistentState<string>(`ms-cls-search-${classId}`, "");
  const [selectedDay, setSelectedDay] = usePersistentState<DayType>(`ms-cls-day-${classId}`, ALL_DAY);
  const [selectedSemester, setSelectedSemester] = usePersistentState<string>(`ms-cls-semester-${classId}`, "ALL");
  const [selectedYear, setSelectedYear] = usePersistentState<number>(`ms-cls-year-${classId}`, new Date().getFullYear());

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicateScheduleModalOpen, setIsDuplicateScheduleModalOpen] = useState(false);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.MANAGE_SCHEDULE.All_SCHEDULE_DETAIL(String(classId)),
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const queryKey = JSON.stringify({
    classId,
    search: debouncedSearchQuery,
    day: selectedDay?.value,
    year: selectedYear,
    semester: selectedSemester,
    page: currentPage,
    size: currentPageSize,
  });

  const doFetch = () => {
    if (!classId) return;
    dispatch(fetchAllSchedulesService({
      classId,
      search: debouncedSearchQuery,
      status: StatusEnum.ACTIVE,
      pageNo: currentPage,
      pageSize: currentPageSize,
      academyYear: selectedYear,
      semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
      dayOfWeek: selectedDay?.value !== "ALL" ? selectedDay?.value : undefined,
    }));
  };

  // Only fetches when classId/filters/page actually change; cache hit on back-nav.
  useCachedList(`ms-cls-${classId}`, queryKey, doFetch);

  const handleDaySelect = (value: string | number | null | undefined) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === value) ?? ALL_DAY;
    setSelectedDay(day);
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleSemesterChange = (semester: string | number | null | undefined) => {
    setSelectedSemester(semester ? String(semester) : "ALL");
    if (currentPage !== 1) updateUrlWithPage(1);
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
      setSelectedSchedule(null);
      setIsDeleteDialogOpen(false);
    } catch {
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
                      onEditClick={(scheduleId) => handleEditClick(scheduleId)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarX}
                  message={`No classes scheduled for ${selectedDay?.label || "this day"}`}
                  description="Try selecting a different day or check back later"
                />
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
            onSuccess={() => doFetch()}
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
                  <br /><br />
                  <strong>Class:</strong> {selectedSchedule.classes.code}<br />
                  <strong>Course:</strong> {selectedSchedule.course.nameEn}<br />
                  <strong>Teacher:</strong> {selectedSchedule.teacher.englishFirstName} {selectedSchedule.teacher.englishLastName}<br />
                  <strong>Day:</strong> {selectedSchedule.day}<br />
                  <strong>Time:</strong> {selectedSchedule.startTime} - {selectedSchedule.endTime}<br />
                  <strong>Room:</strong> {selectedSchedule.room.name}<br />
                  <strong>Semester:</strong> {selectedSchedule.semester.semester} ({selectedSchedule.semester.academyYear})
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
