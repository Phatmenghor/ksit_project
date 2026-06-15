"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { StudentModel } from "@/model/user/student/student.request.model";
import { getAllStudentsService } from "@/service/user/student.service";

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
  const controller = useInfiniteComboboxData<StudentModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllStudentsService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
    getId: (item) => item.id,
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
    />
  );
}
