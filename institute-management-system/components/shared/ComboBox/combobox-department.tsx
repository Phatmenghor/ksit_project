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
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { StatusEnum } from "@/constants/constant";
import { getAllDepartmentService } from "@/service/master-data/department.service";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";

interface ComboboxSelectedProps {
  dataSelect: DepartmentModel | null;
  onChangeSelected: (item: DepartmentModel | null) => void; // Allow null for clearing selection
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean; // Option to show clear button
  showCode?: boolean; // Option to show department code
  required?: boolean; // Show required indicator
}

export function ComboboxSelectDepartment({
  dataSelect,
  onChangeSelected,
  disabled = false,
  placeholder = "Select a department...",
  allowClear = false,
  showCode = true,
  required = false,
}: ComboboxSelectedProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<DepartmentModel[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cache for search results to improve performance
  const cacheRef = useRef<
    Map<string, { data: DepartmentModel[]; page: number; lastPage: boolean }>
  >(new Map());

  // Abort controller for canceling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Intersection Observer Hook
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "50px", // Load more items earlier
  });

  // Enhanced fetch data function with caching and error handling
  const fetchData = async (search = "", newPage = 1, useCache = true) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
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

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await getAllDepartmentService({
        search,
        pageSize: 15, // Increased page size for better UX
        pageNo: newPage,
        status: StatusEnum.ACTIVE,
      });

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (!result) {
        throw new Error("No data returned from service");
      }

      const newData =
        newPage === 1 ? result.content : [...data, ...result.content];

      // Update state
      setData(newData);
      setPage(result.pageNo);
      setLastPage(result.last);

      // Cache the result for page 1 searches
      if (newPage === 1) {
        cacheRef.current.set(cacheKey, {
          data: newData,
          page: result.pageNo,
          lastPage: result.last,
        });

        // Limit cache size to prevent memory issues
        if (cacheRef.current.size > 10) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey !== undefined) {
            cacheRef.current.delete(firstKey);
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching departments:", error);
        setError(error.message || "Failed to load departments");
        setData([]); // Clear data on error
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData("", 1, false); // Don't use cache for initial load
  }, []);

  // Handle search with improved debouncing
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setPage(1);
      setLastPage(false);
      fetchData(searchValue, 1, true);
    }, 400), // Reduced debounce time for better responsiveness
    []
  );

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      // Reset to show all departments when search is cleared
      setPage(1);
      setLastPage(false);
      fetchData("", 1, true);
    }
  }, [searchTerm, debouncedSearch]);

  // Load more data when scrolling
  useEffect(() => {
    if (inView && !lastPage && !loading && !initialLoading) {
      fetchData(searchTerm, page + 1);
    }
  }, [inView, lastPage, loading, initialLoading, searchTerm, page]);

  // Handle search input change
  const onChangeSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle item selection
  const handleSelect = (item: DepartmentModel) => {
    onChangeSelected(item);
    setOpen(false);
    setSearchTerm(""); // Clear search when item is selected
  };

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeSelected(null);
  };

  // Format display text
  const getDisplayText = () => {
    if (!dataSelect) return placeholder;

    if (showCode && dataSelect.code) {
      return `${dataSelect.code} - ${dataSelect.name}`;
    }
    return dataSelect.name;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
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
              <Building2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {initialLoading ? "Loading..." : getDisplayText()}
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

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            {" "}
            {/* Disable built-in filtering */}
            <CommandInput
              placeholder="Search departments..."
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
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : null}
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    {loading ? (
                      <div className="py-6 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Searching departments...
                        </p>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No departments found.
                        </p>
                        {searchTerm && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Try adjusting your search terms.
                          </p>
                        )}
                      </div>
                    )}
                  </CommandEmpty>

                  <CommandGroup>
                    {data.map((item, index) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.name} ${item.code || ""}`}
                        onSelect={() => handleSelect(item)}
                        ref={index === data.length - 1 ? ref : null}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            dataSelect?.id === item.id
                              ? "opacity-100 text-primary"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {showCode && item.code && (
                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {item.code}
                            </span>
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {/* Loading indicator for pagination */}
                  {loading && data.length > 0 && (
                    <div className="p-2 text-center border-t">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  )}

                  {/* End of results indicator */}
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

      {/* Required indicator */}
      {required && (
        <span className="absolute -top-2 -right-2 text-red-500 text-sm pointer-events-none">
          *
        </span>
      )}
    </div>
  );
}
