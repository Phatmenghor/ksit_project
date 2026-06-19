"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { useAppDispatch } from "@/store";
import { fetchSemesterComboboxService } from "@/features/master-data/store/thunks/semester-thunks";

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
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchSemesterComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE, academyYear })).unwrap(),
    [dispatch, academyYear]
  );

  const controller = useInfiniteComboboxData<SemesterModel>({
    fetcher,
    getId: (item) => item.id ?? 0,
    enabled: open,
    cacheKey: academyYear ? `combobox:semester:${academyYear}` : "combobox:semester",
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id ?? 0}
      getLabel={(item) => `${item.semester} - ${item.academyYear}`}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search semester..."
      emptyMessage="No semester found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
