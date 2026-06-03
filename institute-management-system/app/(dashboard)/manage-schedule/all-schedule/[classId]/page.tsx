"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Users,
  MapPin,
  Edit,
  Pen,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DAYS_OF_WEEK,
  DayType,
  SemesterFilter,
  StatusEnum,
} from "@/constants/constant";
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
import { Separator } from "@/components/ui/separator";
import PaginationPage from "@/components/shared/pagination-page";
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

const AllSchedulePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<DayType>({
    label: "All",
    value: "ALL",
  });
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

  // Fix hydration issue: Use stable default and update on client mount
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isHydrated, setIsHydrated] = useState(false);
  const [classId, setClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle hydration and initial setup
  useEffect(() => {
    // Set current year after hydration
    setSelectedYear(new Date().getFullYear());

    // Set classId after hydration
    if (params?.classId) {
      setClassId(Number(params.classId));
    }

    setIsHydrated(true);
  }, [params?.classId]);

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
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

  // Handle initial URL setup after hydration
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
        console.log("## ===", selectedSemester);
        // Create base filters object
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
        // Handle case where current page exceeds total pages
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
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

  const handleEditClick = (scheduleId: number) => {
    router.push(ROUTE.MANAGE_SCHEDULE.UPDATE_SCHEDULE + `${scheduleId}`);
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
      console.error("Error deleting schedule:", error);
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

  // Don't render until hydrated to avoid mismatches
  if (!isHydrated) {
    return <Loading />;
  }

  return (
    <div>
      <Card>
        <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* Breadcrumb - Hide on very small screens */}
          <div className="hidden sm:block">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={ROUTE.DASHBOARD}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={ROUTE.MANAGE_SCHEDULE.DEPARTMENT}>
                    Department List
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Class</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header with back button and title */}
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

          {/* Search and filters section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 flex-wrap">
            {/* Search input - full width on mobile, limited on desktop */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search class..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filters and actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center">
              {/* Year and Semester selectors */}
              <div className="flex gap-2">
                <div className="flex-1 sm:flex-none">
                  <YearSelector
                    value={selectedYear}
                    onChange={setSelectedYear}
                  />
                </div>
                <div className="flex-1 sm:flex-none">
                  <Select
                    onValueChange={setSelectedSemester}
                    value={selectedSemester}
                  >
                    <SelectTrigger className="w-full sm:w-auto">
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
              </div>

              {/* Duplicate button */}
              <Button
                onClick={() => setIsDuplicateScheduleModalOpen(true)}
                className="bg-teal-900 hover:bg-teal-950 w-full sm:w-auto"
              >
                <Copy className="h-4 w-4 mr-2" />
                <span className="sm:inline">Duplicate</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
          {DAYS_OF_WEEK.map((day) => (
            <Button
              key={day.value}
              variant={selectedDay?.value === day.value ? "default" : "outline"}
              className="whitespace-nowrap"
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
          itemName={selectedSchedule?.classes.code}
          isSubmitting={isSubmitting}
        />

        {/* Pagination - FIXED to use handlePageChange */}
        {!isLoading && scheduleData && (
          <div className="mt-8 flex justify-end">
            <PaginationPage
              currentPage={currentPage}
              totalPages={scheduleData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSchedulePage;
