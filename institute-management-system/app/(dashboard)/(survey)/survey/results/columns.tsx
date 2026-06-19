import { TableColumn } from "@/components/shared/data-table";
import { SurveyResponseItem, SurveyReportHeader } from "@/model/survey/survey-result-model";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { formatSemesterOne } from "@/constants/format-enum/format-semester-1";
import React from "react";

export function renderSurveyCellValue(
  item: SurveyResponseItem,
  header: SurveyReportHeader
): React.ReactNode {
  const value = (item as unknown as Record<string, unknown>)[header.key];
  if (value === null || value === undefined) return <span>---</span>;
  if (header.key === "dayOfWeek" && typeof value === "string") {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  if (header.key === "semester" && typeof value === "string") {
    return formatSemesterOne(value);
  }
  if (header.type === "DATE") return formatDate(value as string);
  return value as React.ReactNode;
}

export interface SurveyResultsColumnsProps {
  getDisplayIndex: (index: number) => number;
  surveyHeaders: SurveyReportHeader[];
}

export function createSurveyResultsColumns({
  getDisplayIndex,
  surveyHeaders,
}: SurveyResultsColumnsProps): TableColumn<SurveyResponseItem>[] {
  return [
    { key: "no", label: "#", width: "50px", render: (_, index) => getDisplayIndex(index) },
    ...surveyHeaders.map((header) => ({
      key: header.key,
      label: header.label,
      render: (item: SurveyResponseItem) => renderSurveyCellValue(item, header),
    })),
  ];
}
