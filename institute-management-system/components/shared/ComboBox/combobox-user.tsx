"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { useAppDispatch } from "@/store";
import { fetchStaffComboboxService } from "@/features/users/store/thunks/staff-thunks";

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
          roles: [RoleEnum.STAFF, RoleEnum.DEVELOPER, RoleEnum.TEACHER],
        })
      ).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<StaffModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
    cacheKey: "combobox:user",
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => {
        const fullName = item.englishFirstName && item.englishLastName
          ? `${item.englishFirstName} ${item.englishLastName}`
          : (item.khmerFirstName && item.khmerLastName
            ? `${item.khmerLastName} ${item.khmerFirstName}`
            : item.username);
        return item.identifyNumber ? `${fullName} (${item.identifyNumber})` : fullName;
      }}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search user..."
      emptyMessage="No user found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
