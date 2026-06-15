"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, ChevronDown, Search, CalendarIcon, X, SlidersHorizontal } from "lucide-react";
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
          <select
            value={filter.value?.toString() ?? ""}
            onChange={(e) => filter.onChange(e.target.value || undefined)}
            disabled={filter.disabled}
            className={cn(
              "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
              "transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary hover:border-primary/50",
              filter.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="">{filter.placeholder ?? "All"}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
            <PopoverContent className="w-auto p-0" align="start">
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
      const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground/70">{filter.label}</label>
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(parseInt(e.target.value))}
            disabled={filter.disabled}
            className={cn(
              "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
              "transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary hover:border-primary/50",
              filter.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
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
  essentialFilterIds?: string[];
}

export function CollapsibleFilterPanel({
  config,
  essentialFilterIds = [],
}: CollapsibleFilterPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const allEssential = config.filters.filter((f) => essentialFilterIds.includes(f.id));
  // Show max 2 essential filters inline; overflow goes into "More Filters"
  const inlineFilters = allEssential.slice(0, 2);
  const overflowFilters = allEssential.slice(2);
  const advancedFilters = [
    ...overflowFilters,
    ...config.filters.filter((f) => !essentialFilterIds.includes(f.id)),
  ];

  const advancedActiveCount = advancedFilters.filter(isFilterActive).length;
  const anyFilterActive = config.filters.some(isFilterActive);

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="py-3 px-4 space-y-3">

        {/* Row 1: Title left | Actions + Add button right */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-sm sm:text-base font-semibold tracking-tight text-gray-800 truncate min-w-0">
            {config.title}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
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

        {/* Row 2: CSS Grid — search fixed left, filters pinned right */}
        <div className="flex flex-col gap-2 sm:grid sm:items-end sm:gap-2"
          style={{ gridTemplateColumns: "320px 1fr" }}>

          {/* Col 1: Search — grid locks it to 220px, can never expand */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={config.searchPlaceholder}
              className="pl-8 h-9 w-full text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors"
              value={config.searchValue}
              onChange={config.onSearchChange}
            />
          </div>

          {/* Col 2: Filters + clear — fill remaining space, align right */}
          {(inlineFilters.length > 0 || (anyFilterActive && config.onClearAll)) ? (
            <div className="flex flex-wrap sm:flex-nowrap sm:justify-end items-end gap-2">
              {inlineFilters.map((filter) => (
                <div key={filter.id} className="w-full sm:w-[200px] shrink-0">
                  {renderFilter(filter)}
                </div>
              ))}
              {anyFilterActive && config.onClearAll && (
                <button
                  type="button"
                  onClick={config.onClearAll}
                  title="Clear all filters"
                  className={cn(
                    "h-9 w-9 shrink-0 self-end flex items-center justify-center rounded-md border",
                    "border-red-200 bg-red-50 text-red-400",
                    "hover:bg-red-100 hover:border-red-400 hover:text-red-600",
                    "transition-colors"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : <div />}
        </div>

        {/* Row 3: More / advanced filters (collapsible) */}
        {advancedFilters.length > 0 && (
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More Filters
              {advancedActiveCount > 0 && (
                <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium px-1.5 py-0">
                  {advancedActiveCount} active
                </Badge>
              )}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  showAdvanced && "rotate-180"
                )}
              />
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-dashed">
                <div
                  className="grid gap-3 w-full"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
                >
                  {advancedFilters.map((filter) => renderFilter(filter))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
