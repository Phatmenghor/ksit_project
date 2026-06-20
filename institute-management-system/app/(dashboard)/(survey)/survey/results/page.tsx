"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { DateRangePicker } from "@/components/shared/start-end-date";
import { SemesterFilter } from "@/constants/constant";
import { formatSemester } from "@/constants/format-enum/format-semester";
import { createSurveyResultsColumns } from "./columns";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import {
  AllSurveyFilterModel,
  SurveyReportHeader,
  SurveyResponseItem,
} from "@/model/survey/survey-result-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { format } from "date-fns";
import { ExcelDownloadButton } from "@/components/shared/excel-download-button";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSurveyData,
  selectSurveyHeaders,
  selectSurveyIsLoading,
  selectSurveyFilters,
} from "@/features/survey/store/selectors/survey-selectors";
import {
  setSearchFilter,
  setSemesterFilter,
  setAcademicYearFilter,
  setClassFilter,
  setStartDateFilter,
  setEndDateFilter,
  setPageNo,
  resetFilters,
} from "@/features/survey/store/slice/survey-slice";
import {
  fetchSurveyResultsService,
  fetchSurveyHeadersService,
  fetchSurveyExcelService,
} from "@/features/survey/store/thunks/survey-thunks";

const hiddenHeaders = [
  "responseId", "submittedAt", "studentNameEnglish", "studentNameKhmer",
  "studentId", "studentEmail", "identifyNumber", "studentPhone",
  "className", "majorName", "scheduleId", "courseCode", "courseName",
  "teacherName", "roomName", "dayOfWeek", "semester", "academyYear",
  "surveyTitle", "overallComment", "departmentName", "timeSlot",
];

export default function SurveyResultPage() {
  const dispatch = useAppDispatch();
  const surveyData = useAppSelector(selectSurveyData);
  const surveyHeaders = useAppSelector(selectSurveyHeaders);
  const isLoading = useAppSelector(selectSurveyIsLoading);
  const filters = useAppSelector(selectSurveyFilters);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.SURVEY.RESULT_LIST });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(fetchSurveyHeadersService({ hiddenHeaders }));
  }, [dispatch]);

  useCachedEffect("survey-results", () => {
    dispatch(
      fetchSurveyResultsService({
        search: searchDebounce,
        academyYear: filters.academicYear,
        semester: filters.semester !== "ALL" ? filters.semester : undefined,
        classId: filters.classId,
        pageNo: currentPage,
        pageSize: currentPageSize,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    );
  }, [dispatch, searchDebounce, filters.academicYear, filters.semester, filters.classId, filters.startDate, filters.endDate, currentPage, currentPageSize]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleYearChange = (year: number) => {
    dispatch(setAcademicYearFilter(year));
  };

  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
    dispatch(setClassFilter(e?.id));
    updateUrlWithPage(1);
  };

  const handleSemesterChange = (value: string | number | null | undefined) => {
    dispatch(setSemesterFilter(value ? String(value) : "ALL"));
    updateUrlWithPage(1);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    dispatch(setStartDateFilter(date ? format(date, "yyyy-MM-dd") : undefined));
    updateUrlWithPage(1);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    dispatch(setEndDateFilter(date ? format(date, "yyyy-MM-dd") : undefined));
    updateUrlWithPage(1);
  };

  const clearStartDate = () => handleStartDateChange(undefined);
  const clearEndDate = () => handleEndDateChange(undefined);

  const exportToExcel = async () => {
    setIsSubmitting(true);
    try {
      const filter: AllSurveyFilterModel = {
        search: searchDebounce,
        academyYear: filters.academicYear,
        semester: filters.semester !== "ALL" ? filters.semester : undefined,
        classId: filters.classId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const response: SurveyResponseItem[] = await dispatch(fetchSurveyExcelService(filter)).unwrap();
      const headersData = await dispatch(fetchSurveyHeadersService({ hiddenHeaders })).unwrap();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Survey Result Data");

      const headers: SurveyReportHeader[] = [
        { key: "no", label: "No.", type: "STATIC", category: "STATIC", questionId: 0, displayOrder: 0 },
        ...(headersData && Array.isArray(headersData) ? headersData : surveyHeaders),
      ];

      const columns = headers.map((h) => h.label);
      const columnKeys = headers.map((h) => h.key);

      worksheet.columns = columns.map((label) => ({ header: label, key: label, width: 20 }));
      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Survey Result Data";
      titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };

      const headerRow = worksheet.getRow(3);
      columns.forEach((text, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF007ACC" } };
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
        const columnWidths = [5, 20, 25, 27, 20, 15, 15, 15, 30];
        worksheet.getColumn(idx + 1).width = columnWidths[idx] || 25;
      });
      worksheet.getRow(3).commit();

      response.forEach((item: any, i) => {
        const rowData = columnKeys.map((key) => {
          if (key === "no") return i + 1;
          if ((key === "createdAt" || key === "updatedAt" || key.includes("Date")) && item[key]) {
            try { return new Date(item[key]); } catch { return item[key] || "---"; }
          }
          return item[key] || "---";
        });
        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" } };
          cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: false };
          const columnKey = columnKeys[colNumber - 1];
          if ((columnKey === "createdAt" || columnKey === "updatedAt" || columnKey.includes("Date")) && cell.value instanceof Date) {
            cell.numFmt = "dd-mm-yyyy";
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `survey_result_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success(`Excel file exported successfully! Total records: ${response.length}`);
    } catch {
      toast.error("Failed to export data to Excel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => createSurveyResultsColumns({ getDisplayIndex, surveyHeaders }),
    [surveyHeaders, getDisplayIndex]
  );

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Survey Result" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Survey Result",
          totalCount: surveyData?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search by name or ID...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass,
              onChange: (v) => handleClassChange(v ?? null),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Class</label>
                  <ComboboxSelectClass
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                  />
                </div>
              ),
            },
            {
              id: "year",
              type: "custom",
              label: "Academic Year",
              value: filters.academicYear ?? new Date().getFullYear() ?? 0,
              onChange: (v: unknown) => handleYearChange((v as number) || 0),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <AcademyYearFilter
                  value={(value as number) ?? 0}
                  onChange={(y) => onChange(y)}
                />
              ),
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              value: filters.semester,
              onChange: handleSemesterChange,
              options: SemesterFilter.map((s) => ({ label: s.label, value: s.value })),
            },
          ],
          onClearAll: () => {
            dispatch(resetFilters());
            setSelectedClass(undefined);
            setStartDate(undefined);
            setEndDate(undefined);
          },
        }}
        essentialFilterIds={["class", "year", "semester"]}
      />

      <div className="flex flex-col lg:flex-row justify-between gap-4 w-full">
        <div className="flex-1 lg:flex-none min-w-0">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            clearStartDate={clearStartDate}
            clearEndDate={clearEndDate}
          />
        </div>

        <div className="flex justify-start lg:justify-end items-center gap-2 flex-shrink-0">
          <span className="text-sm whitespace-nowrap">Export Data by Class</span>
          <ExcelDownloadButton onClick={exportToExcel} isLoading={isSubmitting} />
        </div>
      </div>

      <DataTable
        data={surveyData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={surveyData?.totalPages ?? 0}
        totalElements={surveyData?.totalElements}
        onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No Record"
        getRowKey={(s) => s.responseId}
      />
    </div>
  );
}
