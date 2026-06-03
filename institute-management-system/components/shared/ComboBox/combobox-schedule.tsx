"use client";

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
import { cn } from "@/lib/utils";
import { debounce } from "@/utils/debounce/debounce";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Building2,
  X,
  AlertCircle,
  Clock10,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { StatusEnum } from "@/constants/constant";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { getAllScheduleService } from "@/service/schedule/schedule.service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ComboboxSelectedProps {
  dataSelect: ScheduleModel | null;
  onChangeSelected: (item: ScheduleModel | null) => void;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  required?: boolean;
}

export function ComboboxSelectSchedule({
  dataSelect,
  onChangeSelected,
  disabled = false,
  placeholder = "Select a schedule...",
  allowClear = false,
  required = false,
}: ComboboxSelectedProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<ScheduleModel[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const cacheRef = useRef<
    Map<string, { data: ScheduleModel[]; page: number; lastPage: boolean }>
  >(new Map());

  const abortControllerRef = useRef<AbortController | null>(null);

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "50px",
  });

  const fetchData = async (search = "", newPage = 1, useCache = true) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = `${search}-${newPage}`;
    if (useCache && cacheRef.current.has(cacheKey) && newPage === 1) {
      const cached = cacheRef.current.get(cacheKey)!;
      setData(cached.data);
      setPage(cached.page);
      setLastPage(cached.lastPage);
      setInitialLoading(false);
      return;
    }

    if (loading || (lastPage && newPage > 1)) return;

    setLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const result = await getAllScheduleService({
        search,
        pageSize: 15,
        pageNo: newPage,
        status: StatusEnum.ACTIVE,
      });

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (!result) {
        throw new Error("No data returned from service");
      }

      const newData =
        newPage === 1 ? result.content : [...data, ...result.content];

      setData(newData);
      setPage(result.pageNo);
      setLastPage(result.last);

      if (newPage === 1) {
        cacheRef.current.set(cacheKey, {
          data: newData,
          page: result.pageNo,
          lastPage: result.last,
        });

        if (cacheRef.current.size > 10) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey !== undefined) {
            cacheRef.current.delete(firstKey);
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setError(error.message || "Failed to load schedules");
        setData([]);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    fetchData("", 1, false);
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setPage(1);
      setLastPage(false);
      fetchData(searchValue, 1, true);
    }, 400),
    []
  );

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      setPage(1);
      setLastPage(false);
      fetchData("", 1, true);
    }
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    if (inView && !lastPage && !loading && !initialLoading) {
      fetchData(searchTerm, page + 1);
    }
  }, [inView, lastPage, loading, initialLoading, searchTerm, page]);

  const onChangeSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSelect = (item: ScheduleModel) => {
    onChangeSelected(item);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeSelected(null);
  };

  const handleItemHover = (itemId: string | null, event?: React.MouseEvent) => {
    setHoveredItem(itemId);
    if (event && itemId) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 10,
        y: rect.top,
      });
    }
  };

  const getShortText = (schedule: ScheduleModel | null): string => {
    if (!schedule) return placeholder;
    return `${schedule.course?.code || "N/A"} | ${schedule.day} ${
      schedule.startTime
    }`;
  };

  const getFullText = (
    schedule: ScheduleModel
  ): {
    primary: string;
    secondary: string;
    tertiary?: string;
  } => {
    const primary = `${schedule.course?.code || "N/A"} - ${
      schedule.course?.nameEn || "Unknown Course"
    }`;
    const secondary = `${schedule.day} ${schedule.startTime} - ${
      schedule.endTime
    } | ${schedule.room?.name || "Room N/A"}`;
    const tertiary = schedule.course?.nameKH || undefined;
    return { primary, secondary, tertiary };
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="relative">
      <TooltipProvider delayDuration={300}>
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-required={required}
                  className={cn(
                    "w-full h-10 justify-between font-normal",
                    !dataSelect && "text-muted-foreground",
                    disabled && "opacity-50 cursor-not-allowed",
                    error && "border-red-500 focus:border-red-500"
                  )}
                  disabled={disabled || initialLoading}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <Clock10 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {initialLoading ? "Loading..." : getShortText(dataSelect)}
                    </span>
                  </div>

                  <div className="flex items-center ml-2 shrink-0">
                    {allowClear && dataSelect && !disabled && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                        aria-label="Clear selection"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {initialLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>

            {dataSelect && (
              <TooltipContent
                side="top"
                align="center"
                className="max-w-xs"
                sideOffset={5}
              >
                <p className="font-medium">{getFullText(dataSelect).primary}</p>
                <p className="text-xs text-muted-foreground">
                  {getFullText(dataSelect).secondary}
                </p>
              </TooltipContent>
            )}
          </Tooltip>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            sideOffset={4}
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search schedules..."
                value={searchTerm}
                onValueChange={onChangeSearch}
                className="h-9"
              />
              <CommandList className="max-h-64 overflow-y-auto">
                {error ? (
                  <div className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600 mb-2">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchData(searchTerm, 1, false)}
                      disabled={loading}
                    >
                      {loading && (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      )}
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      <div className="py-6 text-center">
                        <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No schedule found.
                        </p>
                        {searchTerm && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Try adjusting your search terms.
                          </p>
                        )}
                      </div>
                    </CommandEmpty>

                    <CommandGroup>
                      {data.map((item, index) => {
                        const { primary, secondary, tertiary } =
                          getFullText(item);
                        const itemKey = `${item.id}-${index}`;
                        return (
                          <div
                            key={itemKey}
                            className="relative"
                            onMouseEnter={(e) => handleItemHover(itemKey, e)}
                            onMouseLeave={() => handleItemHover(null)}
                          >
                            <CommandItem
                              value={primary}
                              onSelect={() => handleSelect(item)}
                              ref={index === data.length - 1 ? ref : null}
                              className="flex items-start gap-2 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4 mt-1 shrink-0",
                                  dataSelect?.id === item.id
                                    ? "opacity-100 text-primary"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate font-medium">
                                  {primary}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                  {secondary}
                                </span>
                              </div>
                            </CommandItem>
                          </div>
                        );
                      })}
                    </CommandGroup>

                    {loading && data.length > 0 && (
                      <div className="p-2 text-center border-t">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    )}

                    {!loading && lastPage && data.length > 10 && (
                      <div className="p-2 text-center border-t">
                        <p className="text-xs text-muted-foreground">
                          End of results
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </TooltipProvider>

      {/* Custom tooltip for list items - rendered outside popover */}
      {hoveredItem && open && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-sm shadow-md max-w-sm animate-in fade-in-0 zoom-in-95">
            {(() => {
              const item = data.find((d, i) => `${d.id}-${i}` === hoveredItem);
              if (!item) return null;
              const { primary, secondary, tertiary } = getFullText(item);
              return (
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{primary}</p>
                  <p className="text-xs text-muted-foreground">{secondary}</p>
                  {tertiary && (
                    <p className="text-xs text-muted-foreground italic">
                      {tertiary}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {required && (
        <span className="absolute -top-2 -right-2 text-red-500 text-sm pointer-events-none">
          *
        </span>
      )}
    </div>
  );
}
