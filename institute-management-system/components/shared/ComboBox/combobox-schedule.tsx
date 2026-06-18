"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { getAllScheduleService } from "@/service/schedule/schedule.service";
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
  const controller = useInfiniteComboboxData<ScheduleModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllScheduleService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
    getId: (item) => item.id,
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
    />
  );
}
