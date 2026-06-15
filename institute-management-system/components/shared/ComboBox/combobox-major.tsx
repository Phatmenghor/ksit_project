"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { MajorModel } from "@/model/master-data/major/all-major-model";
import { getAllMajorService } from "@/service/master-data/major.service";

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
  const controller = useInfiniteComboboxData<MajorModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllMajorService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
    getId: (item) => item.id,
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
    />
  );
}
