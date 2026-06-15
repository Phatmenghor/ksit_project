"use client";

import { AsyncCombobox, useInfiniteComboboxData } from "@/components/shared/async-combobox";
import { StatusEnum } from "@/constants/constant";
import { RoomModel } from "@/model/master-data/room/all-room-model";
import { getAllRoomService } from "@/service/master-data/room.service";

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
  const controller = useInfiniteComboboxData<RoomModel>({
    fetcher: ({ search, pageNo, pageSize }) =>
      getAllRoomService({ search, pageNo, pageSize, status: StatusEnum.ACTIVE }),
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
      searchPlaceholder="Search room..."
      emptyMessage="No room found."
      disabled={disabled}
    />
  );
}
