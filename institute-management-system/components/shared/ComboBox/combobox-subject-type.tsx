"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { SubjectModel } from "@/model/master-data/subject/all-subject-model";
import { useAppDispatch } from "@/store";
import { fetchSubjectComboboxService } from "@/features/master-data/store/thunks/subject-thunks";

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
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchSubjectComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<SubjectModel>({
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
      getLabel={(item) => item.name}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search subject..."
      emptyMessage="No subject found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

export { ComboboxSelectSubjectType as ComboboxSelectSubject };
