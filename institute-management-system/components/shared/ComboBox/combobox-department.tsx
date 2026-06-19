"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { useAppDispatch } from "@/store";
import { fetchDepartmentComboboxService } from "@/features/master-data/store/thunks/department-thunks";

interface ComboboxSelectDepartmentProps {
  dataSelect: DepartmentModel | null;
  onChangeSelected: (item: DepartmentModel | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectDepartment({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a department...",
}: ComboboxSelectDepartmentProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchDepartmentComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<DepartmentModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
    cacheKey: "combobox:department",
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.name}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search department..."
      emptyMessage="No department found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
