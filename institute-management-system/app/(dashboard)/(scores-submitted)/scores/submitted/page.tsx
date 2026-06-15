"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SubmittedScoreParam } from "@/model/score/submitted-score/submitted-score.request.model";
import { useDebounce } from "@/utils/debounce/debounce";
import { getAllSubmittedScoreService } from "@/service/score/score.service";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type SubmissionItem = SubmissionScoreModel;

export default function ScoreSubmittedPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submissionsData, setSubmissionsData] = useState<{
    [key: string]: AllStudentScoreModel | null;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAcademicYear, setSelectAcademicYear] = useState<
    number | undefined
  >();
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(
    undefined
  );
  const [selectedSchedule, setSelectedSchedule] = useState<
    ScheduleModel | undefined
  >(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.SCORES.SUBMITTED,
      defaultPageSize: 10,
    });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const submissions = submissionsData[activeTab] || null;

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

  const getCurrentTabStatus = useCallback(() => {
    const currentTab = tabs.find((tab) => tab.value === activeTab);
    return currentTab?.status || SubmissionEnum.SUBMITTED;
  }, [activeTab]);

  const loadSubmittedScore = useCallback(
    async (param: SubmittedScoreParam) => {
      setIsLoading(true);

      try {
        const currentStatus = getCurrentTabStatus();
        const response = await getAllSubmittedScoreService({
          ...param,
          status: currentStatus,
          search: debouncedSearchQuery,
          pageNo: currentPage,
          classId: selectedClass?.id,
          scheduleId: selectedSchedule?.id,
          academicYear: selectAcademicYear,
          semester: selectedSemester === "ALL" ? undefined : selectedSemester,
          pageSize: 30,
        });

        if (response) {
          setSubmissionsData((prev) => ({
            ...prev,
            [activeTab]: response,
          }));

          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading submissions");
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedSearchQuery,
      getCurrentTabStatus,
      selectAcademicYear,
      currentPage,
      selectedClass,
      selectedSchedule,
      updateUrlWithPage,
      selectedSemester,
      activeTab,
    ]
  );

  useEffect(() => {
    loadSubmittedScore({});
  }, [
    currentPage,
    activeTab,
    debouncedSearchQuery,
    selectedClass,
    selectedSchedule,
    selectAcademicYear,
    selectedSemester,
  ]);

  useEffect(() => {
    updateUrlWithPage(1);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    setSubmissionsData({});
  }, [debouncedSearchQuery]);

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    updateUrlWithPage(1);
  };

  const handleYearChange = (e: number) => {
    setSelectAcademicYear(e);
  };

  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
  };

  const handleScheduleChange = (e: ScheduleModel | null) => {
    setSelectedSchedule(e ?? undefined);
  };

  const columns: TableColumn<SubmissionItem>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => getDisplayIndex(index),
    },
    {
      key: "teacherName",
      label: "Teacher Name",
      render: (s) => s.teacherName,
    },
    {
      key: "courseName",
      label: "Course Name",
      render: (s) => s.courseName,
    },
    {
      key: "semester",
      label: "Semester",
      render: (s) => s.semester,
    },
    {
      key: "classCode",
      label: "Class",
      render: (s) => s.classCode,
    },
    {
      key: "submissionDate",
      label: "Submission Date",
      render: (s) => DateTimeFormatter(s.submissionDate),
    },
    {
      key: "action",
      label: "Action",
      width: "80px",
      render: (s) => (
        <Button
          onClick={() =>
            router.push(ROUTE.SCORES.SUBMITTED_DETAIL(String(s.id)))
          }
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const emptyMessage =
    activeTab === "all"
      ? "No submitted scores found."
      : "No approved scores found.";

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full space-y-4"
    >
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Score Submitted</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Submitted List",
          totalCount: submissions?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass,
              onChange: (v) => setSelectedClass(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Class</label>
                  <ComboboxSelectClass
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
            {
              id: "schedule",
              type: "custom",
              label: "Schedule",
              value: selectedSchedule,
              onChange: (v) => setSelectedSchedule(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Schedule</label>
                  <ComboboxSelectSchedule
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
            {
              id: "year",
              type: "year",
              label: "Academic Year",
              value: selectAcademicYear ?? new Date().getFullYear(),
              onChange: handleYearChange,
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              value: selectedSemester,
              onChange: handleSemesterChange,
              options: SemesterFilter.map((s) => ({ label: s.label, value: s.value })),
            },
          ],
          onClearAll: () => {
            setSelectedClass(undefined);
            setSelectedSchedule(undefined);
            setSelectAcademicYear(undefined);
            setSelectedSemester("ALL");
            setSearchQuery("");
          },
        }}
        essentialFilterIds={["class", "schedule", "year", "semester"]}
      />

      <div className="container mx-auto mt-3">
        <TabsList className="flex w-full border-b gap-6 pb-1 bg-transparent justify-start">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={`relative pb-2 text-sm font-medium transition-colors duration-200 px-1 hover:text-primary data-[state=active]:text-primary`}
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
          data={submissions?.content ?? null}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={submissions?.totalPages ?? 0}
          totalElements={submissions?.totalElements}
          onPageChange={handlePageChange}
          emptyMessage={emptyMessage}
          getRowKey={(s) => s.id}
        />
      </TabsContent>

      <TabsContent value="accept" className="space-y-4 w-full">
        <DataTable
          data={submissions?.content ?? null}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={submissions?.totalPages ?? 0}
          totalElements={submissions?.totalElements}
          onPageChange={handlePageChange}
          emptyMessage={emptyMessage}
          getRowKey={(s) => s.id}
        />
      </TabsContent>
    </Tabs>
  );
}
