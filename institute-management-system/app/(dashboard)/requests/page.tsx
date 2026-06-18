"use client";

import { Eye, ChevronLeft, ChevronRight, Logs } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTE } from "@/constants/routes";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { REQUEST_TYPES, RequestType } from "@/constants/constant";
import { AllRequestModel } from "@/model/request/request-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { getAllRequestService } from "@/service/request/request.service";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { truncateText } from "@/utils/format/format-width-text";
import { formatGender } from "@/constants/format-enum/formate-gender";
import { usePagination } from "@/hooks/use-pagination";
import { StudentModel } from "@/model/user/student/student.request.model";
import { ComboboxSelectStudent } from "@/components/shared/ComboBox/combobox-student";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
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
  resetState,
} from "@/features/requests/store/slice/request-slice";
import { fetchAllRequestsService } from "@/features/requests/store/thunks/request-thunks";

type RequestItem = RequestModel;

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
    return () => { dispatch(resetState()); };
  }, [dispatch]);

  const fetchRequestCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const counts: Record<string, number> = {};
      for (const type of REQUEST_TYPES) {
        try {
          const response = await getAllRequestService({
            status: type.value,
            userId: filters.userId,
            search: searchDebounce,
            pageNo: 1,
            pageSize: 1,
          });
          counts[type.value] = response?.totalElements || 0;
        } catch {
          counts[type.value] = 0;
        }
      }
      setRequestCounts(counts);
    } finally {
      setIsLoadingCounts(false);
    }
  }, [filters.userId, searchDebounce]);

  useEffect(() => {
    fetchRequestCounts();
  }, [fetchRequestCounts]);

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const getStatusBadge = (status: string) => {
    const baseBadgeClasses = "w-24 h-8 flex items-center justify-center text-sm font-medium rounded-full border-0";
    switch (status.toUpperCase()) {
      case "DONE":
        return <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 ${baseBadgeClasses}`}>Done</Badge>;
      case "ACCEPTED":
        return <div className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${baseBadgeClasses}`}>Accepted</div>;
      case "REJECTED":
        return <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${baseBadgeClasses}`}>Rejected</Badge>;
      case "PENDING":
        return <Badge className={`bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800 ${baseBadgeClasses}`}>Pending</Badge>;
      case "RETURN":
        return <Badge className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 ${baseBadgeClasses}`}>Returned</Badge>;
      default:
        return <Badge variant="secondary" className={`bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800 ${baseBadgeClasses}`}>{status}</Badge>;
    }
  };

  const columns: TableColumn<RequestItem>[] = [
    { key: "no", label: "#", width: "50px", render: (_, index) => getDisplayIndex(index) },
    {
      key: "identifyNumber",
      label: "ID",
      render: (req) => req.user ? `${req.user?.identifyNumber || "---"}` : "---",
    },
    {
      key: "name",
      label: "Name",
      render: (req) => req.user ? `${req.user?.englishFirstName || "---"} ${req.user?.englishLastName || "---"}` : "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (req) => req.user ? `${formatGender(req.user?.gender) || "---"}` : "---",
    },
    { key: "title", label: "Title", render: (req) => truncateText(req?.title, 20) },
    { key: "createdAt", label: "Date", render: (req) => formatDate(req?.createdAt || "---") },
    { key: "status", label: "Status", render: (req) => getStatusBadge(req?.status || "---") },
    {
      key: "action",
      label: "Action",
      width: "100px",
      render: (req) => (
        <Button
          onClick={() => router.push(`${ROUTE.REQUEST_DETAIL(String(req.id))}`)}
          variant="outline"
          className="flex items-center gap-2 border-none bg-transparent transition-all duration-200 hover:bg-muted hover:scale-105"
        >
          <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="border-b-2 transition-all duration-200 hover:border-primary">Detail</span>
        </Button>
      ),
    },
  ];

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
          className="absolute left-0 z-10 rounded-full h-10 w-10 sm:h-9 sm:w-9 transition-all duration-300 hover:bg-amber-50 hover:border-amber-300 hover:shadow-lg"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-amber-600" />
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
                  selectedType?.value === type.value
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "hover:bg-amber-100"
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
        getRowKey={(req) => req.id}
      />
    </div>
  );
}
