"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YearSelector } from "@/components/shared/year-selector";
import { Plus, Search, CalendarIcon, X, ArrowLeft } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { FilterConfig, FilterPanelConfig } from "./filter-types";

function isFilterActive(f: FilterConfig): boolean {
  const v = f.value;
  if (v === undefined || v === null) return false;
  if (typeof v === "string" && (v === "" || v === "ALL")) return false;
  return true;
}

function renderFilter(filter: FilterConfig): React.ReactNode {
  switch (filter.type) {
    case "select":
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground/70">{filter.label}</label>
          <Select
            value={filter.value !== undefined && filter.value !== null ? String(filter.value) : ""}
            onValueChange={(v) => filter.onChange(v)}
            disabled={filter.disabled}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={filter.placeholder ?? "All"} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "input-text":
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground/70">{filter.label}</label>
          <Input
            type="text"
            placeholder={filter.placeholder ?? "Enter text..."}
            value={filter.value ?? ""}
            onChange={(e) => filter.onChange(e.target.value)}
            disabled={filter.disabled}
            className="h-9 text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors"
          />
        </div>
      );

    case "input-number":
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground/70">{filter.label}</label>
          <Input
            type="number"
            placeholder={filter.placeholder ?? "0"}
            value={filter.value?.toString() ?? ""}
            onChange={(e) => { const v = e.target.value; filter.onChange(v ? parseInt(v) : undefined); }}
            min={filter.min}
            max={filter.max}
            disabled={filter.disabled}
            className="h-9 text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors"
          />
        </div>
      );

    case "date": {
      const dateVal = filter.value ? parseISO(filter.value) : undefined;
      const isValidDate = dateVal && isValid(dateVal);
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground/70">{filter.label}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={filter.disabled}
                className={cn(
                  "h-9 w-full justify-start px-3 font-normal text-sm",
                  !isValidDate && "text-muted-foreground",
                  "hover:bg-primary/5 hover:border-primary/50 transition-colors"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60 shrink-0" />
                <span className="flex-1 text-left truncate">
                  {isValidDate ? format(dateVal!, "PP") : (filter.placeholder ?? "Select date")}
                </span>
                {isValidDate && (
                  <X
                    className="h-3.5 w-3.5 opacity-40 hover:opacity-100 hover:text-red-500 transition-colors shrink-0"
                    onClick={(e) => { e.stopPropagation(); filter.onChange(undefined); }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[200]" align="start">
              <Calendar
                mode="single"
                selected={isValidDate ? dateVal : undefined}
                onSelect={(date) => filter.onChange(date ? format(date, "yyyy-MM-dd") : undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    case "year": {
      const currentYear = new Date().getFullYear();
      const minYear = filter.minYear ?? currentYear - 10;
      const maxYear = filter.maxYear ?? currentYear + 5;
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground/70">{filter.label}</label>
          <YearSelector
            value={filter.value ?? 0}
            onChange={filter.onChange}
            minYear={minYear}
            maxYear={maxYear}
            title={filter.label}
            placeholder={filter.placeholder ?? "Select year"}
            disabled={filter.disabled}
            className="h-9"
          />
        </div>
      );
    }

    case "custom":
      return (
        <div key={filter.id}>
          {filter.render({
            value: filter.value,
            onChange: filter.onChange,
            disabled: filter.disabled,
            label: filter.label,
            placeholder: filter.placeholder,
          })}
        </div>
      );

    default:
      return null;
  }
}

interface CollapsibleFilterPanelProps {
  config: FilterPanelConfig;
  essentialFilterIds?: string[];  // kept for backwards-compat, no longer used
}

export function CollapsibleFilterPanel({
  config,
}: CollapsibleFilterPanelProps) {
  const anyFilterActive = config.filters?.some(isFilterActive) ?? false;

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="py-3 px-4 space-y-3">

        {/* Row 1: Title left | Clear + Actions + Add button right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {config.onBack && (
              <button
                type="button"
                onClick={config.onBack}
                title="Back"
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-gray-800 truncate min-w-0">
              {config.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {anyFilterActive && config.onClearAll && (
              <button
                type="button"
                onClick={config.onClearAll}
                title="Clear all filters"
                className={cn(
                  "h-9 w-9 shrink-0 flex items-center justify-center rounded-md border",
                  "border-red-200 bg-red-50 text-red-400",
                  "hover:bg-red-100 hover:border-red-400 hover:text-red-600",
                  "transition-colors"
                )}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {config.extraActions}
            {config.buttonText && (
              <Button
                disabled={config.buttonDisabled}
                variant="default"
                onClick={config.onButtonClick}
                className="gap-1.5 h-9 px-3 text-sm whitespace-nowrap"
                title={config.buttonTooltip}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">{config.buttonText}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters row: search left, filters right, wrap one-by-one when no space */}
        <div className="flex flex-wrap items-end gap-2">

          {/* Search: pinned left via mr-auto, won't shrink below min-width */}
          <div className="relative shrink-0 min-w-[300px] w-[300px] mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={config.searchPlaceholder}
              className="pl-8 h-9 w-full text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors"
              value={config.searchValue}
              onChange={config.onSearchChange}
            />
          </div>

          {/* Each filter: grows to fill row, wraps when below min-width */}
          {config.filters?.map((filter) => (
            <div key={filter.id} className="flex-1 min-w-[150px] max-w-[200px]">
              {renderFilter(filter)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
