import { TableColumn } from "@/components/shared/data-table";
import { SurveyResponseItem, SurveyReportHeader } from "@/model/survey/survey-result-model";
import { renderSurveyCellValue } from "../../results/columns";

export interface SurveyRecordDetailColumnsProps {
  getDisplayIndex: (index: number) => number;
  surveyHeaders: SurveyReportHeader[];
}

export function createSurveyRecordDetailColumns({
  getDisplayIndex,
  surveyHeaders,
}: SurveyRecordDetailColumnsProps): TableColumn<SurveyResponseItem>[] {
  return [
    { key: "no", label: "#", width: "50px", render: (_, i) => getDisplayIndex(i) },
    ...surveyHeaders.map((header) => ({
      key: header.key,
      label: header.label,
      render: (item: SurveyResponseItem) => renderSurveyCellValue(item, header),
    })),
  ];
}
