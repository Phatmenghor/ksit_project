"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { useAppDispatch } from "@/store";
import { fetchCourseComboboxService } from "@/features/school/store/thunks/course-thunks";

interface ComboboxSelectCourseProps {
  dataSelect: CourseModel | null;
  onChangeSelected: (item: CourseModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function ComboboxSelectCourse({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a course...",
  className,
}: ComboboxSelectCourseProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchCourseComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<CourseModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
    cacheKey: "combobox:course",
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => `${item.code} - ${item.nameEn || item.nameKH || ""}`}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search course..."
      emptyMessage="No course found."
      disabled={disabled}
      className={className}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
