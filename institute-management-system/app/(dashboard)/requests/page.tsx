"use client";

import { ChevronLeft, ChevronRight, Logs } from "lucide-react";
import { createRequestColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ROUTE } from "@/constants/routes";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { REQUEST_TYPES, RequestType } from "@/constants/constant";
import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { StudentModel } from "@/model/user/student/student.request.model";
import { ComboboxSelectStudent } from "@/components/shared/ComboBox/combobox-student";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { RequestModel } from "@/model/request/request-model";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectRequestData,
  selectRequestIsLoading,
  selectRequestFilters,
} from "@/features/requests/store/selectors/request-selectors";
import {
  setSearchFilter,
  setStatusFilter,
  setUserFilter,
  setPageNo,
  resetFilters,
} from "@/features/requests/store/slice/request-slice";
import { fetchAllRequestsService } from "@/features/requests/store/thunks/request-thunks";
import { CreateRequestModal } from "@/components/dashboard/requests/create-request-modal";

export default function RequestPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectRequestData);
  const isLoading = useAppSelector(selectRequestIsLoading);
  const filters = useAppSelector(selectRequestFilters);

  const [selectedType, setSelectedType] = useState<RequestType>({
    label: "All Requests",
    value: "PENDING",
    icon: Logs,
  });
  const [selectedUser, setSelectedUser] = useState<StudentModel | null>(null);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.REQUESTS });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllRequestsService({
        search: searchDebounce,
        pageNo: currentPage,
        userId: filters.userId,
        pageSize: currentPageSize,
        status: filters.status,
      })
    );
  }, [dispatch, searchDebounce, filters.status, filters.userId, currentPage, currentPageSize]);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoadingCounts(true);
      try {
        const counts: Record<string, number> = {};
        for (const type of REQUEST_TYPES) {
          try {
            const response = await dispatch(
              fetchAllRequestsService({
                status: type.value,
                userId: filters.userId,
                search: searchDebounce,
                pageNo: 1,
                pageSize: 1,
              })
            ).unwrap();
            counts[type.value] = response?.totalElements || 0;
          } catch {
            counts[type.value] = 0;
          }
        }
        setRequestCounts(counts);
      } finally {
        setIsLoadingCounts(false);
      }
    };
    fetchCounts();
  }, [filters.userId, searchDebounce, dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleTypeSelect = (type: RequestType) => {
    setSelectedType(type);
    dispatch(setStatusFilter(type.value));
    updateUrlWithPage(1);
  };

  const handleUserChange = (user: StudentModel | null) => {
    setSelectedUser(user);
    dispatch(setUserFilter(user?.id ? Number(user.id) : undefined));
    updateUrlWithPage(1);
  };

  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  const columns = createRequestColumns({ getDisplayIndex, router });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Request List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Request List",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search by name or ID...",
          onSearchChange: handleSearchChange,
          buttonText: "Create Request",
          onButtonClick: () => setIsCreateModalOpen(true),
          filters: [
            {
              id: "student",
              type: "custom",
              label: "Student",
              value: selectedUser,
              onChange: (v) => handleUserChange(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Student</label>
                  <ComboboxSelectStudent
                    dataSelect={value ?? null}
                    onChangeSelected={(u) => onChange(u)}
                  />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            dispatch(resetFilters());
            setSelectedUser(null);
          },
        }}
        essentialFilterIds={["student"]}
      />

      <div className="relative flex items-center my-2">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 z-10 rounded-full h-10 w-10 sm:h-9 sm:w-9 transition-all duration-300 hover:bg-amber-50 hover:border-amber-300"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 px-10 sm:px-16 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {REQUEST_TYPES.map((type) => {
            const IconComponent = type.icon;
            const count = requestCounts[type.value] || 0;
            const isActive = selectedType?.value === type.value;

            return (
              <Button
                key={type.label}
                variant={isActive ? "default" : "outline"}
                className={`whitespace-nowrap ${
                  isActive ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:bg-amber-100"
                }`}
                onClick={() => handleTypeSelect(type)}
                disabled={isLoadingCounts}
              >
                <IconComponent className="w-4 h-4" />
                <span>{type.label} {isLoadingCounts ? "..." : `(${count})`}</span>
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 z-10 rounded-full h-10 w-10 sm:h-9 sm:w-9"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        data={data?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No Record"
        getRowKey={(req: RequestModel) => req.id}
      />

      <CreateRequestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          dispatch(fetchAllRequestsService({
            search: searchDebounce,
            pageNo: currentPage,
            userId: filters.userId,
            pageSize: currentPageSize,
            status: filters.status,
          }));
        }}
      />
    </div>
  );
}
