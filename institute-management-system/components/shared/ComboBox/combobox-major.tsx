"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { MajorModel } from "@/model/master-data/major/all-major-model";
import { useAppDispatch } from "@/store";
import { fetchMajorComboboxService } from "@/features/master-data/store/thunks/major-thunks";

interface ComboboxSelectMajorProps {
  dataSelect: MajorModel | null;
  onChangeSelected: (item: MajorModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectMajor({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a major...",
}: ComboboxSelectMajorProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchMajorComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<MajorModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
    cacheKey: "combobox:major",
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => `${item.name} (${item.code})`}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search major..."
      emptyMessage="No major found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
