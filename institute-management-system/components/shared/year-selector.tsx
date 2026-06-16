"use client";

import { useState, useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  title?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function YearSelector({
  value,
  onChange,
  minYear = 2020,
  maxYear = 2080,
  title = "Academy Year",
  placeholder = "Select year",
  className,
  disabled = false,
}: YearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value === 0 ? "" : value.toString());
  const [visibleYears, setVisibleYears] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value === 0 ? "" : value.toString());
    const centerYear = value !== 0 ? value : new Date().getFullYear();
    generateVisibleYears(centerYear);
  }, [value]);

  const generateVisibleYears = (centerYear: number) => {
    const start = Math.max(minYear, centerYear - 10);
    const end = Math.min(maxYear, centerYear + 10);
    const years: number[] = [];
    for (let y = start; y <= end; y++) years.push(y);
    setVisibleYears(years);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const last = visibleYears[visibleYears.length - 1];
      if (last < maxYear) {
        const more = Array.from({ length: 5 }, (_, i) => last + i + 1).filter((y) => y <= maxYear);
        setVisibleYears((prev) => [...prev, ...more]);
      }
    }

    if (scrollTop <= 50) {
      const first = visibleYears[0];
      if (first > minYear) {
        const more = Array.from({ length: 5 }, (_, i) => first - 5 + i).filter((y) => y >= minYear);
        setVisibleYears((prev) => [...more, ...prev]);
        if (scrollRef.current) scrollRef.current.scrollTop += 150;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*$/.test(e.target.value)) setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue.trim() === "") {
      setInputValue(value === 0 ? "" : value.toString());
      return;
    }
    let y = parseInt(inputValue, 10);
    if (isNaN(y)) {
      setInputValue(value === 0 ? "" : value.toString());
      return;
    }
    y = Math.max(minYear, Math.min(maxYear, y));
    setInputValue(y.toString());
    onChange(y);
    generateVisibleYears(y);
  };

  const selectYear = (year: number) => {
    onChange(year);
    setInputValue(year.toString());
    setIsOpen(false);
  };

  const incrementYear = () => {
    if (value < maxYear) { const n = value + 1; onChange(n); setInputValue(n.toString()); }
  };

  const decrementYear = () => {
    if (value > minYear) { const n = value - 1; onChange(n); setInputValue(n.toString()); }
  };

  const clearYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(0);
    setInputValue("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 px-3 transition-all duration-200 border-input",
            value === 0 && "text-muted-foreground",
            "hover:bg-primary/10 hover:border-primary hover:text-primary",
            isOpen && "bg-primary/10 border-primary text-primary",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <GraduationCap className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          <span className="flex-1 truncate text-sm">
            {value === 0 ? placeholder : `${title}: ${value}`}
          </span>
          {value !== 0 && !disabled && (
            <div
              className="ml-1 h-4 w-4 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
              onClick={clearYear}
              role="button"
              tabIndex={0}
              aria-label="Clear year"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") clearYear(e as any); }}
            >
              <X className="h-3 w-3" />
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg z-[200]" align="start">
        {/* Header — input + stepper */}
        <div className="flex items-center gap-1 px-2 py-2 border-b bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={decrementYear}
            disabled={value <= minYear}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>

          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") { handleInputBlur(); setIsOpen(false); }
            }}
            className="h-7 flex-1 text-center text-sm focus-visible:ring-primary/30 focus-visible:border-primary"
            placeholder="Year"
          />

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={incrementYear}
            disabled={value >= maxYear}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Year grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-52 overflow-y-auto"
        >
          <div className="grid grid-cols-3 gap-1 p-2">
            {visibleYears.map((year) => (
              <Button
                key={year}
                variant="ghost"
                size="sm"
                onClick={() => selectYear(year)}
                className={cn(
                  "h-8 text-xs font-medium transition-all",
                  year === value
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "hover:bg-primary/10 hover:text-primary"
                )}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer — current year shortcut */}
        <div className="p-2 border-t bg-muted/30 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectYear(new Date().getFullYear())}
            className="flex-1 h-7 text-xs hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
          >
            This Year
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="flex-1 h-7 text-xs hover:bg-muted"
          >
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
