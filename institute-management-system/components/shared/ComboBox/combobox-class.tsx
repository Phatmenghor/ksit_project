"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { useAppDispatch } from "@/store";
import { fetchClassComboboxService } from "@/features/master-data/store/thunks/class-thunks";

interface ComboboxSelectClassProps {
  dataSelect: ClassModel | null;
  onChangeSelected: (item: ClassModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectClass({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a class...",
}: ComboboxSelectClassProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchClassComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<ClassModel>({
    fetcher,
    getId: (item) => item?.id,
    enabled: open,
    cacheKey: "combobox:class",
  });

  return (
    <AsyncCombobox
      value={dataSelect ?? null}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item?.id}
      getLabel={(item) => (item ? `${item.code} - ${item.major?.name ?? ""}` : "")}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search class..."
      emptyMessage="No class found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
