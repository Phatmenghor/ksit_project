"use client";

import { useState, useCallback } from "react";
import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { RoomModel } from "@/model/master-data/room/all-room-model";
import { useAppDispatch } from "@/store";
import { fetchRoomComboboxService } from "@/features/master-data/store/thunks/room-thunks";

interface ComboboxSelectRoomProps {
  dataSelect: RoomModel | null;
  onChangeSelected: (item: RoomModel) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function ComboboxSelectRoom({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label,
  placeholder = "Select a room...",
}: ComboboxSelectRoomProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const fetcher = useCallback(
    ({ search, pageNo, pageSize }: { search: string; pageNo: number; pageSize: number }) =>
      dispatch(fetchRoomComboboxService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE })).unwrap(),
    [dispatch]
  );

  const controller = useInfiniteComboboxData<RoomModel>({
    fetcher,
    getId: (item) => item.id,
    enabled: open,
    cacheKey: "combobox:room",
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
      searchPlaceholder="Search room..."
      emptyMessage="No room found."
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
