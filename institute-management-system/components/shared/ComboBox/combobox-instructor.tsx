"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { getAllStaffService } from "@/service/user/user.service";

function getInstructorLabel(item: StaffModel): string {
  if (item.englishFirstName && item.englishLastName) {
    return `${item.englishFirstName} ${item.englishLastName}`;
  }
  if (item.khmerFirstName && item.khmerLastName) {
    return `${item.khmerFirstName} ${item.khmerLastName}`;
  }
  return item.username;
}

interface ComboboxSelectInstructorProps {
  dataSelect: StaffModel | null;
  onChangeSelected: (item: StaffModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectInstructor({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select an instructor...",
}: ComboboxSelectInstructorProps) {
  const controller = useInfiniteComboboxData<StaffModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllStaffService({
        search,
        pageNo,
        pageSize,
        status: StatusEnum.ACTIVE,
        roles: [RoleEnum.TEACHER, RoleEnum.STAFF],
      }),
    getId: (item) => item.id,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={getInstructorLabel}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search instructor..."
      emptyMessage="No instructor found."
      disabled={disabled}
    />
  );
}
