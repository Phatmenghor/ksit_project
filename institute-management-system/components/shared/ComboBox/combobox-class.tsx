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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { StatusEnum } from "@/constants/constant";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import React from "react";
import { getAllClassService } from "@/service/master-data/class.service";

interface ComboboxSelectedProps {
  dataSelect: ClassModel | null;
  onChangeSelected: (item: ClassModel) => void;
  disabled?: boolean;
  initialItem?: ClassModel | null; // Optional initial selected item
}

export function ComboboxSelectClass({
  dataSelect,
  onChangeSelected,
  disabled = false,
  initialItem,
}: ComboboxSelectedProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<ClassModel[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Intersection Observer Hook
  const { ref, inView } = useInView({ threshold: 1 });

  // Fetch data from API
  const fetchData = async (search = "", newPage = 1) => {
    if (loading || (lastPage && newPage > 1)) return;
    setLoading(true);
    try {
      const result = await getAllClassService({
        search,
        pageSize: 10,
        pageNo: newPage,
        status: StatusEnum.ACTIVE,
      });

      if (!result) {
        console.error("No data returned from getAllClassService");
        return;
      }

      let content = result.content;

      if (newPage === 1) {
        setData(content);
      } else {
        setData((prev) => [...prev, ...content]);
      }
      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data and set initial selection
  useEffect(() => {
    fetchData();

    // Set initial selection if provided and dataSelect is not set
    if (initialItem && !dataSelect) {
      onChangeSelected(initialItem);
    }
  }, [initialItem]);

  // Handle search input with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchData(searchTerm, 1);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Load more when last item is visible
  useEffect(() => {
    if (inView && !lastPage && !loading) {
      fetchData(searchTerm, page + 1);
    }
  }, [inView]);

  async function onChangeSearch(value: string) {
    setSearchTerm(value);
    onSearchClick(value);
  }

  const onSearchClick = useCallback(
    debounce(async (value: string) => {
      fetchData(value);
    }),
    [searchTerm]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full truncate h-10 flex-1 justify-between",
            !(dataSelect || initialItem) && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {dataSelect || initialItem
            ? `${(dataSelect || initialItem)?.code} - ${
                (dataSelect || initialItem)?.major.name
              }`
            : "Select a class..."}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search class..."
            value={searchTerm}
            onValueChange={onChangeSearch}
          />
          <CommandList
            className="max-h-60 overflow-y-auto"
            onWheel={(e) => {
              e.stopPropagation();
              const target = e.currentTarget;
              target.scrollTop += e.deltaY;
            }}
          >
            <CommandEmpty>No class found.</CommandEmpty>
            <CommandGroup>
              {data?.map((item, index) => (
                <CommandItem
                  key={item.id}
                  value={item.code}
                  onSelect={() => {
                    onChangeSelected(item); // Notify parent about the change
                    setOpen(false);
                  }}
                  ref={index === data.length - 1 ? ref : null} // Attach observer to last item
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      dataSelect?.id === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {`${item.code} - ${item.major.name}`}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Loading spinner */}
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
