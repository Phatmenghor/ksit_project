"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Loading from "@/components/shared/loading";
import PaginationPage from "@/components/shared/pagination-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppIcons } from "@/constants/icons/icon";
import { usePagination } from "@/hooks/use-pagination";

export default function AllStudentResultPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = rawId && !isNaN(Number(rawId)) ? Number(rawId) : null;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [surveyHeaders, setSurveyHeaders] = useState<SurveyReportHeader[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyResponseData | null>(null);
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.SURVEY.STUDENT_RECORD(String(rawId)),
      defaultPageSize: 10,
    });

  const router = useRouter();
  // Hidden headers state - you can modify this to control which headers to hide
  const hiddenHeaders = [
    "responseId",
    "submittedAt",
    "studentId",
    "studentEmail",
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

  const fetchSurveyResults = useCallback(
    async (filter: AllSurveyFilterModel = {}) => {
      setIsLoading(true);
      try {
        if (!id) {
          toast.error("Invalid schedule ID");
          return;
        }
        // Prepare headers request body
        const headersRequestBody: SurveyReportHeadersRequest = {
          hiddenHeaders: hiddenHeaders,
        };

        const surveyFilter: AllSurveyFilterModel = {
          search: debouncedSearchQuery,
          scheduleId: id,
          pageNo: currentPage,
          pageSize: 30,
          ...filter,
        };

        // Fetch both headers and data simultaneously
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
        console.error("Error fetching survey results:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, currentPage]
  );

  useEffect(() => {
    fetchSurveyResults({ pageNo: currentPage });
  }, [debouncedSearchQuery, currentPage]);

  // Render cell value based on type
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

  const exportToExcel = async () => {
    setIsSubmitting(true);

    try {
      const filter: AllSurveyFilterModel = {};

      // Call the service to export data
      const response: SurveyResponseItem[] =
        await getAllSurveyResultExcelService(filter);

      // Use API data if available, otherwise use current data
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Survey Result Data");

      // Header table excel
      const headersData = await getSurveyReportHeadersService({
        hiddenHeaders,
      });
      const headers: SurveyReportHeader[] = [
        { key: "no", label: "No." }, // Inject static "No." column
        ...(headersData && Array.isArray(headersData)
          ? headersData
          : surveyHeaders),
      ];

      // Extract column labels and keys for dynamic mapping
      const columns = headers.map((header: SurveyReportHeader) => header.label);
      const columnKeys = headers.map(
        (header: SurveyReportHeader) => header.key
      );

      worksheet.columns = columns.map((label) => ({
        header: label,
        key: label,
        width: 20,
      }));

      // Add title row at Row 1
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

      // Add header row at Row 3
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

        // Dynamic column widths or fallback to default
        const columnWidths = [5, 20, 25, 27, 20, 15, 15, 15, 30];
        worksheet.getColumn(idx + 1).width = columnWidths[idx] || 25;
      });
      worksheet.getRow(3).commit();

      // Add data rows starting at row 4 - DYNAMIC DATA MAPPING
      response.forEach((item: any, i: number) => {
        // Create row data dynamically based on column keys
        const rowData = columnKeys.map((key: string) => {
          // Handle special cases for sequential numbering
          if (key === "no") return i + 1;

          // Handle date formatting for specific date fields
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

          // Return the actual data value or fallback
          return item[key] || "---";
        });

        //   rowData.push(" ");

        const row = worksheet.addRow(rowData);
        //   row.height = 30;

        // Zebra striping
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

          // Format dates dynamically
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

      // File name
      const fileName = `survey_result_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      saveAs(blob, fileName);

      toast.success(
        `Excel file exported successfully! Total records: ${response.length}`
      );
      setIsSubmitting(false);
    } catch (error: unknown) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export data to Excel.");
      setIsSubmitting(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full">
        <Card className="w-full">
          <CardContent className="py-6 space-y-3 w-full">
            {/* Breadcrumb Section */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={ROUTE.DASHBOARD}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Survey Student Result</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                asChild
                className="rounded-full flex-shrink-0 hover:cursor-pointer"
              >
                <img
                  src={AppIcons.Back}
                  alt="back Icon"
                  className="h-4 w-4 mr-3 sm:mr-5 text-muted-foreground"
                />
              </Button>
              <h3 className="lg:text-2xl text-lg font-bold text-gray-900">
                Survey Result
              </h3>
            </div>

            {/* Full Width Content Section */}
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between">
              <div className="relative w-full  max-w-[65%]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or ID..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex justify-start lg:justify-end items-center gap-2 flex-shrink-0">
                <span className="text-sm whitespace-nowrap">
                  Export Data by Class
                </span>
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
          </CardContent>
        </Card>
      </div>

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {surveyHeaders.map((header) => (
                  <TableHead key={header.key}>{header.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveyData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No Record
                  </TableCell>
                </TableRow>
              ) : (
                surveyData?.content.map((survey, index) => {
                  return (
                    <TableRow key={survey.responseId}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      {surveyHeaders.map((header) => (
                        <TableCell key={`${survey.responseId}-${header.key}`}>
                          {renderCellValue(survey, header)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {surveyData && (
        <div className="mt-8 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={surveyData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
