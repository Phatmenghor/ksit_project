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
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const { data, loading, lastPage, searchTerm, setSearchTerm, sentinelRef } = controller;

  const selectedLabel = value ? getLabel(value) : placeholder;

  const handleOpenChange = (next: boolean) => {
    if (!next) controller.reset?.();
    setOpen(next);
  };

  const handleSelect = (item: T) => {
    onChange(item);
    setOpen(false);
  };

  const isSelected = (item: T) =>
    isItemSelected ? isItemSelected(item, value) : value !== null && getId(item) === getId(value!);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <Label className="text-xs font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={handleOpenChange}>
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
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg"
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
            <CommandList className="max-h-52 overflow-y-auto">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => {
                  const id = getId(item);
                  return (
                    <CommandItem
                      key={id}
                      value={String(id)}
                      onSelect={() => handleSelect(item)}
                      ref={index === data.length - 1 ? sentinelRef : null}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected(item) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderItem ? renderItem(item) : getLabel(item)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {loading && (
                <div className="text-center py-2">
                  <Loader2 className="animate-spin text-gray-400 h-4 w-4 mx-auto" />
                </div>
              )}

              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-1 text-xs text-gray-400">
                  End of list
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
