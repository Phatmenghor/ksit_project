"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { DateRangePicker } from "@/components/shared/start-end-date";
import { Button } from "@/components/ui/button";
import { SemesterFilter } from "@/constants/constant";
import { formatSemester } from "@/constants/format-enum/format-semester";
import { formatSemesterOne } from "@/constants/format-enum/format-semester-1";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import {
  AllSurveyFilterModel,
  SurveyReportHeader,
  SurveyReportHeadersRequest,
  SurveyResponseData,
  SurveyResponseItem,
} from "@/model/survey/survey-result-model";
import {
  getAllSurveyResultExcelService,
  getAllSurveyResultService,
  getSurveyReportHeadersService,
} from "@/service/survey/survey.service";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { useDebounce } from "@/utils/debounce/debounce";
import { format } from "date-fns";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Tally1,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";

export default function SurveyResultPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");

  const [selectAcademicYear, setSelectAcademicYear] = useState<
    number | undefined
  >();
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(
    undefined
  );

  const [surveyHeaders, setSurveyHeaders] = useState<SurveyReportHeader[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyResponseData | null>(null);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.SURVEY.RESULT_LIST,
      defaultPageSize: 20,
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

  const hiddenHeaders = [
    "responseId",
    "submittedAt",
    "studentNameEnglish",
    "studentNameKhmer",
    "studentId",
    "studentEmail",
    "identifyNumber",
    "studentPhone",
    "className",
    "majorName",
    "scheduleId",
    "courseCode",
    "courseName",
    "teacherName",
    "roomName",
    "dayOfWeek",
    "semester",
    "academyYear",
    "surveyTitle",
    "overallComment",
    "departmentName",
    "timeSlot",
  ];

  const fetchSurveyResults = useCallback(
    async (filter: AllSurveyFilterModel = {}) => {
      setIsLoading(true);
      try {
        const headersRequestBody: SurveyReportHeadersRequest = {
          hiddenHeaders: hiddenHeaders,
        };

        const surveyFilter: AllSurveyFilterModel = {
          search: debouncedSearchQuery,
          academyYear: selectAcademicYear,
          semester: selectedSemester != "ALL" ? selectedSemester : undefined,
          classId: selectedClass?.id,
          pageNo: currentPage,
          pageSize: 30,
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          ...filter,
        };

        const [headersData, previewData] = await Promise.all([
          getSurveyReportHeadersService(headersRequestBody),
          getAllSurveyResultService(surveyFilter),
        ]);

        if (headersData) {
          setSurveyHeaders(headersData);
        }

        if (previewData) {
          setSurveyData(previewData);
          if (
            previewData.totalPages > 0 &&
            currentPage > previewData.totalPages
          ) {
            updateUrlWithPage(previewData.totalPages);
            return;
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedSearchQuery,
      selectedClass,
      selectAcademicYear,
      selectedSemester,
      startDate,
      currentPage,
      endDate,
    ]
  );

  useEffect(() => {
    fetchSurveyResults({ pageNo: currentPage });
  }, [
    debouncedSearchQuery,
    selectedClass,
    currentPage,
    selectAcademicYear,
    selectedSemester,
    startDate,
    endDate,
  ]);

  const renderCellValue = (
    item: SurveyResponseItem,
    header: SurveyReportHeader
  ): React.ReactNode => {
    const value = (item as any)[header.key];

    if (value === null || value === undefined) {
      return <span>---</span>;
    }

    if (header.key === "dayOfWeek" && typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    if (header.key === "semester" && typeof value === "string") {
      return formatSemesterOne(value);
    }

    switch (header.type) {
      case "DATE":
        return formatDate(value as string);
    }
    return value;
  };

  const handleYearChange = (e: number) => {
    setSelectAcademicYear(e);
  };

  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
    updateUrlWithPage(1);
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    updateUrlWithPage(1);
  };

  const clearStartDate = () => {
    setStartDate(undefined);
    updateUrlWithPage(1);
  };

  const clearEndDate = () => {
    setEndDate(undefined);
    updateUrlWithPage(1);
  };

  const exportToExcel = async () => {
    setIsSubmitting(true);

    try {
      const filter: AllSurveyFilterModel = {
        search: debouncedSearchQuery,
        academyYear: selectAcademicYear,
        semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
        classId: selectedClass?.id,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      };

      const response: SurveyResponseItem[] =
        await getAllSurveyResultExcelService(filter);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Survey Result Data");

      const headersData = await getSurveyReportHeadersService({
        hiddenHeaders,
      });
      const headers: SurveyReportHeader[] = [
        { key: "no", label: "No." },
        ...(headersData && Array.isArray(headersData)
          ? headersData
          : surveyHeaders),
      ];

      const columns = headers.map((header: SurveyReportHeader) => header.label);
      const columnKeys = headers.map(
        (header: SurveyReportHeader) => header.key
      );

      worksheet.columns = columns.map((label) => ({
        header: label,
        key: label,
        width: 20,
      }));

      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Survey Result Data";
      titleCell.font = {
        size: 16,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };

      const headerRow = worksheet.getRow(3);
      columns.forEach((text: string, idx: number) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF007ACC" },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        const columnWidths = [5, 20, 25, 27, 20, 15, 15, 15, 30];
        worksheet.getColumn(idx + 1).width = columnWidths[idx] || 25;
      });
      worksheet.getRow(3).commit();

      response.forEach((item: any, i: number) => {
        const rowData = columnKeys.map((key: string) => {
          if (key === "no") return i + 1;

          if (
            (key === "createdAt" ||
              key === "updatedAt" ||
              key.includes("Date")) &&
            item[key]
          ) {
            try {
              return new Date(item[key]);
            } catch (error) {
              return item[key] || "---";
            }
          }

          return item[key] || "---";
        });

        const row = worksheet.addRow(rowData);

        row.eachCell((cell, colNumber) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" },
          };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: false,
          };

          const columnKey = columnKeys[colNumber - 1];
          if (
            (columnKey === "createdAt" ||
              columnKey === "updatedAt" ||
              columnKey.includes("Date")) &&
            cell.value instanceof Date
          ) {
            cell.numFmt = "dd-mm-yyyy";
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `survey_result_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      saveAs(blob, fileName);

      toast.success(
        `Excel file exported successfully! Total records: ${response.length}`
      );
      setIsSubmitting(false);
    } catch (error: unknown) {
      toast.error("Failed to export data to Excel.");
      setIsSubmitting(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Build dynamic columns from surveyHeaders
  const columns: TableColumn<SurveyResponseItem>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => getDisplayIndex(index),
    },
    ...surveyHeaders.map((header) => ({
      key: header.key,
      label: header.label,
      render: (item: SurveyResponseItem) => renderCellValue(item, header),
    })),
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Survey Result</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Survey Result",
          totalCount: surveyData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search by name or ID...",
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
                    disabled={isLoading}
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
            setSelectAcademicYear(undefined);
            setSelectedSemester("ALL");
            setStartDate(undefined);
            setEndDate(undefined);
            setSearchQuery("");
          },
        }}
        essentialFilterIds={["class", "year", "semester"]}
      />

      {/* Date Range + Export row */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 w-full">
        <div className="flex-1 lg:flex-none min-w-0">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            clearStartDate={clearStartDate}
            clearEndDate={clearEndDate}
          />
        </div>

        <div className="flex justify-start lg:justify-end items-center gap-2 flex-shrink-0">
          <span className="text-sm whitespace-nowrap">Export Data by Class</span>
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="h-8 px-2 border-gray-200 py-5 flex items-center gap-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Exporting...</span>
              </div>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="ml-1 text-xs font-medium">Excel</span>
                <Tally1 className="-mr-[12px] text-gray-300 flex-shrink-0" />
                <Download className="h-4 w-4 flex-shrink-0" />
              </>
            )}
          </Button>
        </div>
      </div>

      <DataTable
        data={surveyData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={surveyData?.totalPages ?? 0}
        totalElements={surveyData?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No Record"
        getRowKey={(s) => s.responseId}
      />
    </div>
  );
}
