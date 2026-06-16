"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { fetchAllCategoriesService } from "@/features/master-data/store/thunks/categories-thunks";
import { useAppDispatch } from "@/store";
import { useCallback } from "react";

interface ComboboxSelectCategoryProps {
  dataSelect: CategoriesResponseModel | null;
  onChangeSelected: (item: CategoriesResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectCategories({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Category",
  required = false,
  placeholder = "Select a category...",
  error,
}: ComboboxSelectCategoryProps) {
  const dispatch = useAppDispatch();

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchAllCategoriesService({ search, pageNo, pageSize })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<CategoriesResponseModel>({
    fetcher,
    getId: (item) => item.id,
  });

  return (
    <AsyncCombobox
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.name}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search category..."
      emptyMessage="No category found."
      disabled={disabled}
      error={error}
    />
  );
}
