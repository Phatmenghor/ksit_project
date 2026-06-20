import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";

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
  const startStr = startDate ? startDate.toISOString().split("T")[0] : "";
  const endStr = endDate ? endDate.toISOString().split("T")[0] : "";

  const handleStartChange = (val: string) => {
    if (!val) {
      clearStartDate();
    } else {
      onStartDateChange(new Date(val));
    }
  };

  const handleEndChange = (val: string) => {
    if (!val) {
      clearEndDate();
    } else {
      onEndDateChange(new Date(val));
    }
  };

  return (
    <div className="flex gap-2 flex-col md:flex-row">
      <CustomDateTimePicker
        value={startStr}
        onChange={handleStartChange}
        placeholder="Start Date"
        className="w-full min-w-[200px] md:w-auto md:flex-1"
        mode="date"
      />
      <CustomDateTimePicker
        value={endStr}
        onChange={handleEndChange}
        placeholder="End Date"
        className="w-full min-w-[200px] md:w-auto md:flex-1"
        mode="date"
      />
    </div>
  );
};
