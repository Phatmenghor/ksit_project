"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  clearStartDate: () => void;
  clearEndDate: () => void;
}

export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  clearStartDate,
  clearEndDate,
}: DateRangePickerProps) => {
  return (
    <div className="flex gap-2 flex-col md:flex-row">
      {/* Start Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full min-w-[200px] md:w-auto md:flex-1 py-2.5 justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "PPP") : "Start Date"}

            {startDate && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  clearStartDate();
                }}
                className="ml-auto cursor-pointer"
                title="Clear start date"
              >
                <X className="h-4 w-4 hover:text-red-500" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            disabled={(date) =>
              date > new Date() || (endDate ? date > endDate : false)
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* End Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full min-w-[200px] md:w-auto md:flex-1 py-2.5 justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "PPP") : "End Date"}

            {endDate && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  clearEndDate();
                }}
                className="ml-auto cursor-pointer"
                title="Clear end date"
              >
                <X className="h-4 w-4 hover:text-red-500" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            disabled={(date) =>
              date > new Date() || (startDate ? date < startDate : false)
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
