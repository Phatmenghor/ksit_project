"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { useAppDispatch } from "@/store";
import { fetchAllSchedulesService } from "@/features/schedules/store/thunks/schedule-thunks";
import { formatTime12h } from "@/utils/map-helper/schedule";

interface ComboboxSelectScheduleProps {
  dataSelect: ScheduleModel | null;
  onChangeSelected: (item: ScheduleModel | null) => void;
  disabled?: boolean;
  allowClear?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectSchedule({
  dataSelect,
  onChangeSelected,
  disabled = false,
  allowClear = false,
  label,
  placeholder = "Select a schedule...",
}: ComboboxSelectScheduleProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchAllSchedulesService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<ScheduleModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => onChangeSelected(allowClear ? item : (item ?? dataSelect))}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) =>
        `${item.course?.code || "N/A"} | ${item.day} ${formatTime12h(item.startTime)} – ${formatTime12h(item.endTime)}`
      }
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search schedule..."
      emptyMessage="No schedule found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
