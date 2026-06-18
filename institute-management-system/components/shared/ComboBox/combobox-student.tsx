"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { StudentModel } from "@/model/user/student/student.request.model";
import { useAppDispatch } from "@/store";
import { fetchStudentComboboxService } from "@/features/users/store/thunks/student-thunks";

interface ComboboxSelectStudentProps {
  dataSelect: StudentModel | null;
  onChangeSelected: (item: StudentModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectStudent({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a student...",
}: ComboboxSelectStudentProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchStudentComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<StudentModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) =>
        `${item.username} - ${item.englishFirstName || ""} ${item.englishLastName || ""}`.trim()
      }
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search student..."
      emptyMessage="No student found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
