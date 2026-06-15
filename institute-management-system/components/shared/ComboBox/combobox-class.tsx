"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { getAllClassService } from "@/service/master-data/class.service";

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
  const controller = useInfiniteComboboxData<ClassModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllClassService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
    getId: (item) => item.id,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => `${item.code} - ${item.major.name}`}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search class..."
      emptyMessage="No class found."
      disabled={disabled}
    />
  );
}
