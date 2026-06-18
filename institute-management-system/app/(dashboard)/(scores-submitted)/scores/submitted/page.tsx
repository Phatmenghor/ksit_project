"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SemesterFilter, SubmissionEnum, tabs } from "@/constants/constant";
import { useRouter, useSearchParams } from "next/navigation";
import { AllStudentScoreModel, SubmissionScoreModel } from "@/model/score/student-score/student-score.response";
import { usePagination } from "@/hooks/use-pagination";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { formatSemester } from "@/utils/map-helper/schedule";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSubmittedScoreData,
  selectSubmittedScoreIsLoading,
  selectSubmittedScoreFilters,
} from "@/features/scores/store/selectors/score-selectors";
import {
  setSearchFilter,
  setClassFilter,
  setScheduleFilter,
  setAcademicYearFilter,
  setSemesterFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
  resetState,
} from "@/features/scores/store/slice/submitted-score-slice";
import { fetchAllSubmittedScoresService } from "@/features/scores/store/thunks/submitted-score-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

type SubmissionItem = SubmissionScoreModel;

const VALID_TABS = tabs.map((t) => t.value);

export default function ScoreSubmittedPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectSubmittedScoreData);
  const isLoading = useAppSelector(selectSubmittedScoreIsLoading);
  const filters = useAppSelector(selectSubmittedScoreFilters);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel | undefined>(undefined);

  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.SCORES.SUBMITTED });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
      const currentTab = tabs.find((t) => t.value === tabParam);
      if (currentTab) dispatch(setStatusFilter(currentTab.status || SubmissionEnum.SUBMITTED));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(
      fetchAllSubmittedScoresService({
        search: searchDebounce,
        status: filters.status,
        classId: filters.classId,
        scheduleId: filters.scheduleId,
        academicYear: filters.academicYear || undefined,
        semester: filters.semester === "ALL" ? undefined : filters.semester,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, filters.status, filters.classId, filters.scheduleId, filters.academicYear, filters.semester, currentPage, currentPageSize]);

  useEffect(() => {
    return () => { dispatch(resetState()); };
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const currentTab = tabs.find((t) => t.value === value);
    dispatch(setStatusFilter(currentTab?.status || SubmissionEnum.SUBMITTED));
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.set("pageNo", "1");
    router.replace(`${ROUTE.SCORES.SUBMITTED}?${params.toString()}`);
  };

  const handleYearChange = (year: number) => {
    dispatch(setAcademicYearFilter(year));
  };

  const handleSemesterChange = (value: string) => {
    dispatch(setSemesterFilter(value));
    updateUrlWithPage(1);
  };

  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
    dispatch(setClassFilter(e?.id));
  };

  const handleScheduleChange = (e: ScheduleModel | null) => {
    setSelectedSchedule(e ?? undefined);
    dispatch(setScheduleFilter(e?.id));
  };

  const columns: TableColumn<SubmissionItem>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => getDisplayIndex(index),
    },
    { key: "teacherName", label: "Teacher Name", render: (s) => s.teacherName },
    { key: "courseName", label: "Course Name", render: (s) => s.courseName },
    { key: "semester", label: "Semester", render: (s) => formatSemester(s.semester) },
    { key: "classCode", label: "Class", render: (s) => s.classCode },
    { key: "submissionDate", label: "Submission Date", render: (s) => DateTimeFormatter(s.submissionDate) },
    {
      key: "action",
      label: "Action",
      width: "80px",
      render: (s) => (
        <Button
          onClick={() => router.push(ROUTE.SCORES.SUBMITTED_DETAIL(String(s.id)))}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const emptyMessage = activeTab === "all" ? "No submitted scores found." : "No approved scores found.";

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Score Submitted" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Submitted List",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "year",
              type: "year",
              label: "Academy Year",
              value: filters.academicYear,
              onChange: handleYearChange,
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              value: filters.semester,
              onChange: handleSemesterChange,
              options: SemesterFilter.map((s) => ({ label: s.label, value: s.value })),
            },
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass,
              onChange: (v) => handleClassChange(v ?? null),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/70">Class</label>
                  <ComboboxSelectClass
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                  />
                </div>
              ),
            },
            {
              id: "schedule",
              type: "custom",
              label: "Schedule",
              value: selectedSchedule,
              onChange: (v) => handleScheduleChange(v ?? null),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/70">Schedule</label>
                  <ComboboxSelectSchedule
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                  />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            dispatch(resetFilters());
            setSelectedClass(undefined);
            setSelectedSchedule(undefined);
          },
        }}
      />

      <div className="container mx-auto mt-3">
        <TabsList className="flex w-full border-b gap-6 pb-1 bg-transparent justify-start">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="relative pb-2 text-sm font-medium transition-colors duration-200 px-1 hover:text-primary data-[state=active]:text-primary"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-200 ${
                  activeTab === value ? "bg-primary" : "bg-transparent"
                }`}
              />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="all" className="space-y-4 w-full">
        <DataTable
          data={data?.content ?? null}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements}
          onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
          pageSize={currentPageSize}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage={emptyMessage}
          getRowKey={(s) => s.id}
        />
      </TabsContent>

      <TabsContent value="accept" className="space-y-4 w-full">
        <DataTable
          data={data?.content ?? null}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements}
          onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
          pageSize={currentPageSize}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage={emptyMessage}
          getRowKey={(s) => s.id}
        />
      </TabsContent>
    </Tabs>
  );
}
