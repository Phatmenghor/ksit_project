"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { getAllDepartmentService } from "@/service/master-data/department.service";

interface ComboboxSelectDepartmentProps {
  dataSelect: DepartmentModel | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeSelected: (item: any) => void;
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
  const controller = useInfiniteComboboxData<DepartmentModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllDepartmentService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
    getId: (item) => item.id,
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
    />
  );
}
