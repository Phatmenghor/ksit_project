"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { getAllStaffService } from "@/service/user/user.service";

interface ComboboxSelectUserProps {
  dataSelect: StaffModel | null;
  onChangeSelected: (item: StaffModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectUser({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a user...",
}: ComboboxSelectUserProps) {
  const controller = useInfiniteComboboxData<StaffModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllStaffService({
        search,
        pageNo,
        pageSize,
        status: StatusEnum.ACTIVE,
        roles: [RoleEnum.STAFF, RoleEnum.TEACHER],
      }),
    getId: (item) => item.id,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.username}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search user..."
      emptyMessage="No user found."
      disabled={disabled}
    />
  );
}
