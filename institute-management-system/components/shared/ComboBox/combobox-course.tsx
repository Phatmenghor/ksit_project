"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { getAllCourseService } from "@/service/master-data/course.service";

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
  const controller = useInfiniteComboboxData<CourseModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllCourseService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
    getId: (item) => item.id,
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
    />
  );
}
