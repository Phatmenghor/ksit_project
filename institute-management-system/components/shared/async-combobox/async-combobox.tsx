"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AsyncComboboxProps } from "./types";

export function AsyncCombobox<T>({
  value,
  onChange,
  controller,
  getId,
  getLabel,
  renderItem,
  isItemSelected,
  label,
  required = false,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  error,
  disabled = false,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AsyncComboboxProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const { data: rawData, loading, lastPage, searchTerm, setSearchTerm, sentinelRef } = controller;
  const data = rawData.filter((item) => item != null);

  const selectedLabel = value ? getLabel(value) : placeholder;

  const handleOpenChange = (next: boolean) => {
    if (!next && searchTerm) setSearchTerm("");
    setOpen(next);
  };

  const handleSelect = (item: T) => {
    onChange(item);
    setOpen(false);
  };

  const isSelected = (item: T) =>
    isItemSelected ? isItemSelected(item, value) : value != null && getId(item) === getId(value);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <Label className="text-xs font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 px-3 transition-all duration-200 border-input",
              !value && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              open && "bg-primary/10 border-primary",
              error && "border-red-500",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            disabled={disabled}
          >
            <span className="truncate text-sm">{selectedLabel}</span>
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="min-w-[var(--radix-popover-trigger-width)] w-max max-w-[420px] p-0 shadow-lg z-[200]"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-52 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
              <CommandEmpty>
                <p className="text-xs text-muted-foreground py-1">{emptyMessage}</p>
              </CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => {
                  const id = getId(item);
                  const selected = isSelected(item);
                  return (
                    <CommandItem
                      key={id}
                      value={String(id)}
                      onSelect={() => handleSelect(item)}
                      ref={index === data.length - 1 ? sentinelRef : null}
                      className="text-sm gap-2"
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          selected ? "opacity-100 text-primary" : "opacity-0"
                        )}
                      />
                      <span className={cn("truncate", selected && "font-medium text-primary")}>
                        {renderItem ? renderItem(item) : getLabel(item)}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {loading && (
                <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
                  <Loader2 className="animate-spin h-3 w-3" />
                  Loading...
                </div>
              )}

              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-1.5 text-xs text-muted-foreground/60 border-t border-border/40">
                  All results loaded
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
