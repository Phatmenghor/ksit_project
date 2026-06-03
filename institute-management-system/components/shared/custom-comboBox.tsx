"use client";

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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";
import { debounce } from "@/utils/debounce/debounce";
import { useCallback, useEffect, useState } from "react";

type PaginatedFetcher<T> = (
  search: string,
  pageNo: number
) => Promise<{
  content: T[];
  pageNo: number;
  last: boolean;
}>;

interface ComboboxSelectProps<T> {
  labelKey: keyof T;
  valueKey: keyof T;
  disabled: boolean;
  selectedItem: T | null;
  onSelect: (item: T) => void;
  fetcher: PaginatedFetcher<T>;
  placeholder?: string;
  formatLabel?: (item: T) => string;
}

export function ComboboxSelect<T>({
  labelKey,
  valueKey,
  selectedItem,
  disabled,
  onSelect,
  fetcher,
  formatLabel,
  placeholder = "Select...",
}: ComboboxSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const { ref, inView } = useInView({ threshold: 1 });

  const fetchData = async (search = "", newPage = 1) => {
    if (loading || lastPage) return;
    setLoading(true);
    try {
      const result = await fetcher(search, newPage);
      setItems((prev) =>
        newPage === 1 ? result.content : [...prev, ...result.content]
      );
      setPage(result.pageNo);
      setLastPage(result.last);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchData(searchTerm, 1), 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    if (inView && !lastPage && !loading) {
      fetchData(searchTerm, page + 1);
    }
  }, [inView]);

  useEffect(() => {
    if (selectedItem) {
      setSelectedValue(String(selectedItem[labelKey]));
    }
  }, [selectedItem]);

  const onSearch = useCallback(
    debounce((value: string) => fetchData(value, 1)),
    []
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled} asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-10 flex-1 justify-between"
        >
          {selectedItem
            ? formatLabel
              ? formatLabel(selectedItem)
              : String(selectedItem[labelKey])
            : placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full flex p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
              onSearch(value);
            }}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {items.map((item, index) => {
                const label = formatLabel
                  ? formatLabel(item)
                  : String(item[labelKey]);
                const value = String(item[valueKey]);
                return (
                  <CommandItem
                    key={value}
                    value={label}
                    onSelect={() => {
                      setSelectedValue(label);
                      onSelect(item);
                      setOpen(false);
                    }}
                    ref={index === items.length - 1 ? ref : null}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === label ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {loading && (
              <div className="text-center py-2">
                <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
