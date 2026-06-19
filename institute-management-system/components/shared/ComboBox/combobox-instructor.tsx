"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { useAppDispatch } from "@/store";
import { fetchStaffComboboxService } from "@/features/users/store/thunks/staff-thunks";

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
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(
        fetchStaffComboboxService({
          search,
          pageNo,
          pageSize,
          status: StatusEnum.ACTIVE,
          roles: [RoleEnum.TEACHER, RoleEnum.STAFF],
        })
      ).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<StaffModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
    cacheKey: "combobox:instructor",
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
      open={open}
      onOpenChange={setOpen}
    />
  );
}
