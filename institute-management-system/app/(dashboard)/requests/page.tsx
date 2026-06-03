"use client";

import { Search, Eye, ChevronLeft, ChevronRight, Logs } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTE } from "@/constants/routes";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { REQUEST_TYPES, RequestType } from "@/constants/constant";

import { toast } from "sonner";
import PaginationPage from "@/components/shared/pagination-page";
import { RequestTableHeader } from "@/constants/table/request";
import Loading from "@/components/shared/loading";
import { AllRequestModel } from "@/model/request/request-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { RequestFilterModel } from "@/model/request/request-filter";
import { getAllRequestService } from "@/service/request/request.service";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { truncateText } from "@/utils/format/format-width-text";
import { formatGender } from "@/constants/format-enum/formate-gender";
import { usePagination } from "@/hooks/use-pagination";
import { ComboboxSelectUser } from "@/components/shared/ComboBox/combobox-user";
import { StudentModel } from "@/model/user/student/student.request.model";
import { ComboboxSelectStudent } from "@/components/shared/ComboBox/combobox-student";

export default function RequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<RequestType>({
    label: "All Requests",
    value: "PENDING",
    icon: Logs,
  });
  const [requestData, setRequestData] = useState<AllRequestModel | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // New state for storing counts
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>(
    {}
  );
  const [selectedUser, setSelectedUser] = useState<StudentModel | null>(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.REQUESTS,
      defaultPageSize: 10,
    });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  // Then add this effect for initial URL setup
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      // Use replace: true to avoid adding to browser history
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const fetchRequests = useCallback(
    async (filters: RequestFilterModel) => {
      setIsLoading(true);
      try {
        const response = await getAllRequestService({
          search: debouncedSearchQuery,
          pageNo: currentPage,
          userId: Number(selectedUser?.id) || undefined,
          pageSize: 30,
          status: selectedType?.value,
          ...filters,
        });
        setRequestData(response);
        // Handle case where current page exceeds total pages
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch (error: any) {
        toast.error("An error occurred while loading classes");
        setRequestData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, currentPage, selectedType]
  );

  // New function to fetch counts for all request types
  const fetchRequestCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const counts: Record<string, number> = {};

      // Fetch count for each request type
      for (const type of REQUEST_TYPES) {
        try {
          const response = await getAllRequestService({
            status: type.value,
            userId: Number(selectedUser?.id) || undefined,
            search: debouncedSearchQuery,
            pageNo: 1,
            pageSize: 1, // We only need the total count, not the actual data
          });
          counts[type.value] = response?.totalElements || 0;
        } catch (error) {
          counts[type.value] = 0;
        }
      }

      setRequestCounts(counts);
    } catch (error) {
    } finally {
      setIsLoadingCounts(false);
    }
  }, [selectedUser, debouncedSearchQuery]);

  // Fetch requests
  useEffect(() => {
    if (selectedType) {
      fetchRequests({ pageNo: currentPage });
    }
  }, [selectedType, debouncedSearchQuery, selectedUser, currentPage]);

  // Fetch counts on component mount and when search query changes
  useEffect(() => {
    fetchRequestCounts();
  }, [fetchRequestCounts, debouncedSearchQuery]);

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

  const handleTypeSelect = (type: RequestType) => {
    setSelectedType(type);
    updateUrlWithPage(1);
  };

  const handleUserChange = (user: StudentModel) => {
    setSelectedUser(user);
    updateUrlWithPage(1);
  };

  // Check in history
  const getStatusBadge = (status: string) => {
    const baseBadgeClasses =
      "w-24 h-8 flex items-center justify-center text-sm font-medium rounded-full border-0";

    switch (status.toUpperCase()) {
      case "DONE":
        return (
          <Badge
            className={`bg-green-100 text-green-800 hover:bg-green-100 ${baseBadgeClasses}`}
          >
            Done
          </Badge>
        );
      case "ACCEPTED":
        return (
          <div
            className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${baseBadgeClasses}`}
          >
            Accepted
          </div>
        );
      case "REJECTED":
        return (
          <Badge
            className={`bg-red-100 text-red-800 hover:bg-red-100 ${baseBadgeClasses}`}
          >
            Rejected
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            className={`bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800 ${baseBadgeClasses}`}
          >
            Pending
          </Badge>
        );
      case "RETURN":
        return (
          <Badge
            className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 ${baseBadgeClasses}`}
          >
            Returned
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className={`bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800 ${baseBadgeClasses}`}
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <div>
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Breadcrumb + Title */}
          <div className="space-y-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={ROUTE.DASHBOARD}
                    className="hover:text-amber-600 hover:underline hover:underline-offset-4"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Request List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h3 className="text-xl font-bold tracking-tight">Request List</h3>
          </div>

          {/* Filters */}
          <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or ID..."
                className="pl-8 w-full transition-all duration-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="w-full md:max-w-sm">
              <ComboboxSelectStudent
                dataSelect={selectedUser ?? null}
                onChangeSelected={handleUserChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative flex items-center my-6">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 z-10 rounded-full transition-all duration-300 hover:bg-amber-50 hover:border-amber-300 hover:shadow-lg "
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-amber-600" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 px-16 scroll-smooth"
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
                className={`whitespace-nowrap  ${
                  selectedType?.value === type.value
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "hover:bg-amber-100"
                }`}
                onClick={() => handleTypeSelect(type)}
                disabled={isLoadingCounts}
              >
                <IconComponent className="w-4 h-4" />
                <span>
                  {type.label} {isLoadingCounts ? "..." : `(${count})`}
                </span>
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 z-10 rounded-full"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div>
        {isLoading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {RequestTableHeader.map((header, index) => (
                  <TableHead
                    key={index}
                    className={`${header.className}`}
                    style={{
                      animationDelay: `${150 + index * 50}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No Record
                  </TableCell>
                </TableRow>
              ) : (
                requestData?.content.map((req, index) => {
                  return (
                    <TableRow
                      key={req.id}
                      style={{
                        animationDelay: `${300 + index * 80}ms`,
                        animationFillMode: "backwards",
                      }}
                    >
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>
                        {req.user
                          ? `${req.user?.identifyNumber || "---"}`
                          : "---"}
                      </TableCell>
                      <TableCell>
                        {req.user
                          ? `${req.user?.englishFirstName || "---"} ${
                              req.user?.englishLastName || "---"
                            }`
                          : "---"}
                      </TableCell>
                      <TableCell>
                        {req.user
                          ? `${formatGender(req.user?.gender) || "---"}`
                          : "---"}
                      </TableCell>
                      <TableCell>{truncateText(req?.title, 20)}</TableCell>
                      <TableCell>
                        {formatDate(req?.createdAt || "---")}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(req?.status || "---")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <Button
                            onClick={() => {
                              router.push(
                                `${ROUTE.REQUEST_DETAIL(String(req.id))}`
                              );
                            }}
                            variant="outline"
                            className="flex items-center gap-2 border-none bg-transparent transition-all duration-200 hover:bg-muted hover:scale-105"
                            disabled={isSubmitting}
                          >
                            <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            <span className="border-b-2 transition-all duration-200 hover:border-primary">
                              Detail
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && requestData && requestData.totalPages > 1 && (
        <div className="mt-8 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={requestData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
