"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { SubjectModel } from "@/model/master-data/subject/all-subject-model";
import { getAllSubjectService } from "@/service/master-data/subject.service";

interface ComboboxSelectSubjectTypeProps {
  dataSelect: SubjectModel | null;
  onChangeSelected: (item: SubjectModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectSubjectType({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a subject...",
}: ComboboxSelectSubjectTypeProps) {
  const controller = useInfiniteComboboxData<SubjectModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllSubjectService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
    getId: (item) => item.id,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={(item) => item && onChangeSelected(item)}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.name}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search subject..."
      emptyMessage="No subject found."
      disabled={disabled}
    />
  );
}

export { ComboboxSelectSubjectType as ComboboxSelectSubject };
