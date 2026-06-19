"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Logs } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { REQUEST_TYPES, RequestType } from "@/constants/constant";
import { RequestModel } from "@/model/request/request-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { getUserId } from "@/utils/local-storage/user-info/userId";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { CreateRequestModal } from "@/components/dashboard/requests/create-request-modal";
import { createMyRequestColumns } from "./columns";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectMyRequestData,
  selectMyRequestIsLoading,
  selectMyRequestFilters,
} from "@/features/requests/store/selectors/my-request-selectors";
import {
  setSearchFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
} from "@/features/requests/store/slice/my-request-slice";
import { fetchMyRequestsService } from "@/features/requests/store/thunks/my-request-thunks";
import { fetchAllRequestsService } from "@/features/requests/store/thunks/request-thunks";

export default function MyRequestsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectMyRequestData);
  const isLoading = useAppSelector(selectMyRequestIsLoading);
  const filters = useAppSelector(selectMyRequestFilters);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [selectedType, setSelectedType] = useState<RequestType>({
    label: "All Requests",
    value: "PENDING",
    icon: Logs,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(filters.search, 500);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.MY_REQUESTS });

  const currentUserId = typeof window !== "undefined" ? Number(getUserId()) || undefined : undefined;

  useEffect(() => {
    dispatch(
      fetchMyRequestsService({
        search: debouncedSearch || undefined,
        status: filters.status,
        userId: currentUserId,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, debouncedSearch, filters.status, currentPage, currentPageSize, currentUserId]);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoadingCounts(true);
      try {
        const counts: Record<string, number> = {};
        for (const type of REQUEST_TYPES) {
          try {
            const r = await dispatch(
              fetchAllRequestsService({
                status: type.value,
                userId: currentUserId,
                pageNo: 1,
                pageSize: 1,
              })
            ).unwrap();
            counts[type.value] = r?.totalElements || 0;
          } catch {
            counts[type.value] = 0;
          }
        }
        setRequestCounts(counts);
      } catch {
        toast.error("Failed to load request counts.");
      } finally {
        setIsLoadingCounts(false);
      }
    };
    fetchCounts();
  }, [currentUserId, dispatch]);

  const handleTypeSelect = (type: RequestType) => {
    setSelectedType(type);
    dispatch(setStatusFilter(type.value));
    updateUrlWithPage(1);
  };

  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  const tableColumns = createMyRequestColumns({ getDisplayIndex, router });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0">
          <PageBreadcrumb items={[{ label: "My Requests" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "My Requests",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search by title...",
          onSearchChange: (e) => {
            dispatch(setSearchFilter(e.target.value));
            if (currentPage !== 1) updateUrlWithPage(1);
          },
          buttonText: "Create Request",
          onButtonClick: () => setIsCreateModalOpen(true),
          onClearAll: () => dispatch(resetFilters()),
        }}
      />

      <div className="relative flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 z-10 rounded-full h-9 w-9 hover:bg-amber-50 hover:border-amber-300"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-2 px-12 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {REQUEST_TYPES.map((type) => {
            const Icon = type.icon;
            const count = requestCounts[type.value] || 0;
            const isActive = selectedType.value === type.value;
            return (
              <Button
                key={type.label}
                variant={isActive ? "default" : "outline"}
                className={`whitespace-nowrap ${isActive ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:bg-amber-100"}`}
                onClick={() => handleTypeSelect(type)}
                disabled={isLoadingCounts}
              >
                <Icon className="w-4 h-4 mr-1" />
                {type.label} {isLoadingCounts ? "..." : `(${count})`}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 z-10 rounded-full h-9 w-9"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        data={data?.content ?? null}
        columns={tableColumns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No requests found"
        getRowKey={(req: RequestModel) => req.id}
      />

      <CreateRequestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          dispatch(
            fetchMyRequestsService({
              search: debouncedSearch || undefined,
              status: filters.status,
              userId: currentUserId,
              pageNo: currentPage,
              pageSize: currentPageSize,
            })
          );
        }}
      />
    </div>
  );
}
