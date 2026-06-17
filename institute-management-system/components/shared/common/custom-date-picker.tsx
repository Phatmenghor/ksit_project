"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, X, Clock, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const CALENDAR_DAYS = 42;
const YEAR_RANGE_OFFSET = 10;
const YEARS_PER_PAGE = 12;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const DAYS = ["S","M","T","W","T","F","S"] as const;

interface CustomDateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
  mode?: "date" | "datetime" | "academyYear";
  id?: string;
}

function formatAcademyYear(year: number) {
  return `${year}-${year + 1}`;
}

export function CustomDateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder,
  className,
  error = false,
  mode = "date",
  id,
}: CustomDateTimePickerProps) {
  const defaultPlaceholder = mode === "academyYear" ? "Select academy year" : "Select date";

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");
  const [today, setToday] = useState<Date | null>(null);

  // Academy year state
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearPageStart, setYearPageStart] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setViewDate(now);
    if (mode === "academyYear") {
      setYearPageStart(now.getFullYear() - Math.floor(YEARS_PER_PAGE / 2));
    }
  }, [mode]);

  // Sync value → state
  useEffect(() => {
    if (mode === "academyYear") {
      const y = value ? parseInt(value) : null;
      setSelectedYear(y && !isNaN(y) ? y : null);
      if (y && !isNaN(y)) {
        setYearPageStart(y - Math.floor(YEARS_PER_PAGE / 2));
      }
      return;
    }
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setViewDate(date);
        if (mode === "datetime") {
          const h = date.getHours();
          const m = date.getMinutes();
          setSelectedPeriod(h >= 12 ? "PM" : "AM");
          setSelectedHour(String(h % 12 || 12).padStart(2, "0"));
          setSelectedMinute(String(m).padStart(2, "0"));
        }
      }
    } else {
      setSelectedDate(null);
    }
  }, [value, mode]);

  // ── Date/datetime helpers ─────────────────────────────────────────────────

  const formatDisplay = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const dateStr = `${day} ${month}, ${year}`;
    if (mode === "datetime") {
      const h = date.getHours(), m = date.getMinutes();
      const period = h >= 12 ? "PM" : "AM";
      return `${dateStr}, ${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
    }
    return dateStr;
  };

  const formatForForm = (date: Date) => {
    if (mode === "datetime") return date.toISOString();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleDateSelect = (day: number) => {
    if (!viewDate) return;
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (mode === "datetime" && selectedDate) {
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    }
    setSelectedDate(newDate);
  };

  const applyDateTime = () => {
    if (!selectedDate) return;
    if (mode === "datetime") {
      const newDate = new Date(selectedDate);
      let h = parseInt(selectedHour);
      if (selectedPeriod === "PM" && h !== 12) h += 12;
      else if (selectedPeriod === "AM" && h === 12) h = 0;
      newDate.setHours(h);
      newDate.setMinutes(parseInt(selectedMinute));
      setSelectedDate(newDate);
      onChange(formatForForm(newDate));
    } else {
      onChange(formatForForm(selectedDate));
    }
    setIsOpen(false);
  };

  const navigateMonth = (dir: "prev" | "next") => {
    if (!viewDate) return;
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + (dir === "prev" ? -1 : 1));
    setViewDate(d);
  };

  const generateCalendarDays = () => {
    if (!viewDate) return [];
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());
    const cur = new Date(start);
    const todayStr = today?.toDateString();
    return Array.from({ length: CALENDAR_DAYS }, () => {
      const obj = {
        day: cur.getDate(),
        isCurrentMonth: cur.getMonth() === month,
        isSelected: selectedDate ? cur.toDateString() === selectedDate.toDateString() : false,
        isToday: cur.toDateString() === todayStr,
      };
      cur.setDate(cur.getDate() + 1);
      return obj;
    });
  };

  const generateYearOptions = () => {
    const base = today?.getFullYear() ?? new Date().getFullYear();
    return Array.from({ length: YEAR_RANGE_OFFSET * 2 + 1 }, (_, i) => String(base - YEAR_RANGE_OFFSET + i));
  };

  // ── Academy year helpers ─────────────────────────────────────────────────

  const academyYearPageEnd = (yearPageStart ?? 0) + YEARS_PER_PAGE - 1;
  const academyYears = yearPageStart !== null
    ? Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart + i)
    : [];

  const selectAcademyYear = (year: number) => {
    setSelectedYear(year);
    onChange(String(year));
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (mode === "academyYear") {
      setSelectedYear(null);
    } else {
      setSelectedDate(null);
    }
    onChange("");
  };

  const hasValue = mode === "academyYear" ? selectedYear !== null : selectedDate !== null;

  const displayValue = () => {
    if (mode === "academyYear") return selectedYear ? String(selectedYear) : (placeholder ?? defaultPlaceholder);
    return selectedDate ? formatDisplay(selectedDate) : (placeholder ?? defaultPlaceholder);
  };

  const calendarDays = generateCalendarDays();
  const yearOptions = generateYearOptions();
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 text-sm transition-all duration-200 border-input",
            !hasValue && "text-muted-foreground",
            "hover:bg-primary/10 hover:border-primary hover:text-primary",
            "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
            isOpen && "bg-primary/10 border-primary text-primary",
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {mode === "academyYear" ? (
            <GraduationCap className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          ) : mode === "datetime" ? (
            <Clock className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          ) : (
            <Calendar className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          )}
          <span className="flex-1 truncate">{displayValue()}</span>
          {hasValue && !disabled && (
            <div
              className="ml-1 h-4 w-4 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
              onClick={clearSelection}
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") clearSelection(e as any); }}
            >
              <X className="h-3 w-3" />
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 z-[200] shadow-lg" style={{ width: mode === "academyYear" ? "220px" : "224px" }} align="start" sideOffset={4}>

        {/* ── Academy Year mode ── */}
        {mode === "academyYear" && yearPageStart !== null && (
          <>
            <div className="flex items-center justify-between px-2 py-2 border-b bg-muted/30">
              <Button variant="ghost" size="sm"
                onClick={() => setYearPageStart((s) => (s ?? 0) - YEARS_PER_PAGE)}
                className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                {yearPageStart} – {academyYearPageEnd + 1}
              </span>
              <Button variant="ghost" size="sm"
                onClick={() => setYearPageStart((s) => (s ?? 0) + YEARS_PER_PAGE)}
                className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1 p-2">
              {academyYears.map((year) => {
                const isCurrent = year === (today?.getFullYear() ?? 0);
                const isSelected = year === selectedYear;
                return (
                  <Button key={year} variant="ghost" size="sm"
                    onClick={() => selectAcademyYear(year)}
                    className={cn(
                      "h-8 text-xs font-medium transition-all px-1",
                      isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : isCurrent ? "ring-1 ring-primary/40 text-primary hover:bg-primary/10"
                        : "hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {year}
                  </Button>
                );
              })}
            </div>

            <div className="p-2 border-t bg-muted/30 flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}
                className="flex-1 h-7 text-xs text-muted-foreground hover:text-foreground border-border/60">
                Close
              </Button>
              <Button variant="default" size="sm"
                onClick={() => { const y = today?.getFullYear() ?? new Date().getFullYear(); selectAcademyYear(y); }}
                className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90">
                This Year
              </Button>
            </div>
          </>
        )}

        {/* ── Date / Datetime mode ── */}
        {mode !== "academyYear" && (
          <>
            <div className="flex items-center justify-between px-2 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}
                  className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="flex gap-0.5">
                  <Select value={viewDate ? MONTHS[viewDate.getMonth()] : undefined} onValueChange={(m) => {
                    if (!viewDate) return;
                    setViewDate(new Date(viewDate.getFullYear(), MONTHS.indexOf(m as typeof MONTHS[number]), 1));
                  }}>
                    <SelectTrigger className="h-6 text-xs w-auto min-w-[52px] border-0 bg-transparent hover:bg-primary/10 hover:text-primary px-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[210]">
                      {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={viewDate?.getFullYear().toString()} onValueChange={(y) => {
                    if (!viewDate) return;
                    setViewDate(new Date(parseInt(y), viewDate.getMonth(), 1));
                  }}>
                    <SelectTrigger className="h-6 text-xs w-auto min-w-[58px] border-0 bg-transparent hover:bg-primary/10 hover:text-primary px-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[210]">
                      {yearOptions.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}
                  className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 opacity-50 hover:opacity-100 hover:bg-muted">
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="h-6 flex items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((dayObj, i) => (
                  <Button key={i} variant="ghost" size="sm"
                    onClick={() => handleDateSelect(dayObj.day)}
                    disabled={!dayObj.isCurrentMonth}
                    className={cn(
                      "h-7 w-full p-0 text-xs font-normal transition-all hover:bg-primary/10 hover:text-primary",
                      !dayObj.isCurrentMonth && "text-muted-foreground/30 hover:bg-transparent hover:text-muted-foreground/30 cursor-not-allowed",
                      dayObj.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
                      dayObj.isToday && !dayObj.isSelected && "ring-1 ring-primary/40 text-primary font-semibold"
                    )}
                  >
                    {dayObj.day}
                  </Button>
                ))}
              </div>
            </div>

            {mode === "datetime" && (
              <div className="px-2 pb-2 border-t pt-2">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger className="h-7 w-12 text-xs border-input hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[210]">
                      {hours.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-xs font-bold">:</span>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger className="h-7 w-12 text-xs border-input hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[210]">
                      {minutes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as "AM" | "PM")}>
                    <SelectTrigger className="h-7 w-14 text-xs border-input hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[210]">
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="p-2 border-t bg-muted/30 flex gap-1">
              <Button variant="outline" size="sm"
                onClick={() => {
                  const now = new Date();
                  setSelectedDate(now);
                  setViewDate(now);
                  if (mode === "datetime") {
                    const h = now.getHours(), m = now.getMinutes();
                    setSelectedPeriod(h >= 12 ? "PM" : "AM");
                    setSelectedHour(String(h % 12 || 12).padStart(2, "0"));
                    setSelectedMinute(String(m).padStart(2, "0"));
                  }
                  onChange(formatForForm(now));
                  setIsOpen(false);
                }}
                className="flex-1 h-7 text-xs hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors">
                Today
              </Button>
              <Button variant="default" size="sm" onClick={applyDateTime} disabled={!selectedDate}
                className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90">
                Apply
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
