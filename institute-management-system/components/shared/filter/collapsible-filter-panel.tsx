"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, ChevronDown, Search, CalendarIcon, X } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { FilterConfig, FilterPanelConfig } from "./filter-types";

const CONTROL_H = "h-9";
const FILTER_MIN_W = "min-w-[148px]";

function isFilterActive(f: FilterConfig): boolean {
  const v = f.value;
  if (v === undefined || v === null) return false;
  if (typeof v === "string" && (v === "" || v === "ALL")) return false;
  return true;
}

function LabelRow({ label }: { label: string }) {
  return <span className="text-xs font-medium text-foreground/80">{label}</span>;
}

function renderFilter(filter: FilterConfig): React.ReactNode {
  switch (filter.type) {
    case "select":
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <LabelRow label={filter.label} />
          <select
            value={filter.value?.toString() ?? ""}
            onChange={(e) => filter.onChange(e.target.value || undefined)}
            disabled={filter.disabled}
            className={cn(
              CONTROL_H,
              "w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
              "transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
              "hover:border-primary/50",
              filter.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="">{filter.placeholder ?? "All"}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "input-text":
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <LabelRow label={filter.label} />
          <Input
            type="text"
            placeholder={filter.placeholder ?? "Enter text..."}
            value={filter.value ?? ""}
            onChange={(e) => filter.onChange(e.target.value)}
            disabled={filter.disabled}
            className={cn(CONTROL_H, "text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors")}
          />
        </div>
      );

    case "input-number":
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <LabelRow label={filter.label} />
          <Input
            type="number"
            placeholder={filter.placeholder ?? "0"}
            value={filter.value?.toString() ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              filter.onChange(val ? parseInt(val) : undefined);
            }}
            min={filter.min}
            max={filter.max}
            disabled={filter.disabled}
            className={cn(CONTROL_H, "text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors")}
          />
        </div>
      );

    case "date": {
      const dateVal = filter.value ? parseISO(filter.value) : undefined;
      const isValidDate = dateVal && isValid(dateVal);
      return (
        <div key={filter.id} className="flex flex-col gap-1">
          <LabelRow label={filter.label} />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={filter.disabled}
                className={cn(
                  CONTROL_H,
                  "w-full justify-start px-3 font-normal text-sm",
                  !isValidDate && "text-muted-foreground",
                  "hover:bg-primary/10 hover:border-primary/50 transition-colors"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70 shrink-0" />
                <span className="flex-1 text-left truncate">
                  {isValidDate ? format(dateVal!, "PP") : (filter.placeholder ?? "Select date")}
                </span>
                {isValidDate && (
                  <X
                    className="h-3.5 w-3.5 opacity-50 hover:opacity-100 hover:text-red-500 transition-colors shrink-0"
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
          <LabelRow label={filter.label} />
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(parseInt(e.target.value))}
            disabled={filter.disabled}
            className={cn(
              CONTROL_H,
              "w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
              "transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
              "hover:border-primary/50",
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

  const essentialFilters = config.filters.filter((f) => essentialFilterIds.includes(f.id));
  const advancedFilters = config.filters.filter((f) => !essentialFilterIds.includes(f.id));

  const advancedActiveCount = advancedFilters.filter(isFilterActive).length;
  const anyFilterActive = config.filters.some(isFilterActive);

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="py-3 px-4 space-y-3">

        {/* Title left | Add button right */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm sm:text-base font-semibold tracking-tight text-gray-800 truncate">
            {config.title}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            {config.extraActions}
            {config.buttonText && (
              <Button
                disabled={config.buttonDisabled}
                variant="default"
                onClick={config.onButtonClick}
                className={cn("gap-1.5 px-3 text-sm", CONTROL_H)}
                title={config.buttonTooltip}
              >
                <Plus className="h-4 w-4" />
                {config.buttonText}
              </Button>
            )}
          </div>
        </div>

        {/* Search (flex-1, max-w) + filters (min-w each) + clear icon */}
        <div className="flex flex-wrap items-end gap-2">

          {/* Search — grows but caps at max-width */}
          <div className="flex flex-col gap-1 flex-1 min-w-[180px] max-w-[320px]">
            <span className="text-xs font-medium text-foreground/80 invisible select-none">Search</span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={config.searchPlaceholder}
                className={cn("pl-8 w-full text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors", CONTROL_H)}
                value={config.searchValue}
                onChange={config.onSearchChange}
              />
            </div>
          </div>

          {/* Essential filters — each with min-width */}
          {essentialFilters.map((filter) => (
            <div key={filter.id} className={cn("flex-shrink-0", FILTER_MIN_W)}>
              {renderFilter(filter)}
            </div>
          ))}

          {/* Clear icon button — same height, no text */}
          {anyFilterActive && config.onClearAll && (
            <div className="flex flex-col gap-1">
              <span className="text-xs invisible select-none">x</span>
              <button
                type="button"
                onClick={config.onClearAll}
                title="Clear all filters"
                className={cn(
                  CONTROL_H,
                  "w-9 flex items-center justify-center rounded-md border border-input bg-background",
                  "hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors text-muted-foreground"
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Advanced / more filters */}
        {advancedFilters.length > 0 && (
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors"
            >
              More Filters
              {advancedActiveCount > 0 && (
                <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium px-1.5">
                  {advancedActiveCount} active
                </Badge>
              )}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showAdvanced && "rotate-180")} />
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-dashed">
                <div className="grid gap-3 w-full" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
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
