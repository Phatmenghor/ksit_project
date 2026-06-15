"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { getAllSemesterService } from "@/service/master-data/semester.service";

interface ComboboxSelectSemesterProps {
  dataSelect: SemesterModel | null;
  onChangeSelected: (item: SemesterModel) => void;
  disabled?: boolean;
  academyYear?: number;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectSemester({
  dataSelect,
  onChangeSelected,
  disabled = false,
  academyYear,
  label,
  placeholder = "Select a semester...",
}: ComboboxSelectSemesterProps) {
  const controller = useInfiniteComboboxData<SemesterModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllSemesterService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE, academyYear }),
    getId: (item) => item.id,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => `${item.semester} - ${item.academyYear}`}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search semester..."
      emptyMessage="No semester found."
      disabled={disabled}
    />
  );
}
