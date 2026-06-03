"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import DepartmentCard from "@/components/dashboard/schedule/department/department-card";
import { AllDepartmentModel } from "@/model/master-data/department/all-department-model";
import { useCallback, useEffect, useState } from "react";
import { getAllDepartmentService } from "@/service/master-data/department.service";
import { toast } from "sonner";
import { ROUTE } from "@/constants/routes";
import { AllDepartmentFilterModel } from "@/model/master-data/department/type-department-model";
import { Constants } from "@/constants/text-string";
import PaginationPage from "@/components/shared/pagination-page";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/shared/loading";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";

export default function DepartmentListPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allDepartmentData, setAllDepartmentData] =
    useState<AllDepartmentModel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.MANAGE_SCHEDULE.DEPARTMENT,
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

  const loadDepartments = useCallback(
    async (param: AllDepartmentFilterModel) => {
      setIsLoading(true);

      try {
        const response = await getAllDepartmentService({
          search: debouncedSearchQuery,
          pageNo: currentPage,
          pageSize: 30,
          status: Constants.ACTIVE,
          ...param,
        });

        if (response) {
          setAllDepartmentData(response);
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        } else {
          console.error("Failed to fetch departments:");
        }
      } catch (error) {
        toast.error("An error occurred while loading departments");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, currentPage]
  );

  useEffect(() => {
    loadDepartments({});
  }, [debouncedSearchQuery, currentPage]);

  function onClickDepartmentCard(departmentId: number) {
    router.push(ROUTE.MANAGE_SCHEDULE.DEPARTMENT_CLASS + `/${departmentId}`);
  }
  return (
    <div className="animate-in fade-in duration-700">
      <Card className="animate-in slide-in-from-top-4 duration-500">
        <CardContent className="p-6 space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="animate-in fade-in duration-500 delay-100">
                <BreadcrumbLink
                  href={ROUTE.DASHBOARD}
                  className="transition-all duration-300 hover:text-amber-600 hover:underline hover:underline-offset-4"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="animate-in fade-in duration-500 delay-200" />
              <BreadcrumbItem className="animate-in fade-in duration-500 delay-300">
                <BreadcrumbPage>Department List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h3 className="text-xl font-bold animate-in slide-in-from-left-4 duration-600 delay-200">
            Manage Schedule
          </h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in slide-in-from-bottom-4 duration-600 delay-300">
            <div className="relative w-full md:w-1/2 group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-300 group-focus-within:text-amber-500 group-focus-within:scale-110" />
              <Input
                type="search"
                placeholder="Search department..."
                className="pl-8 w-full transition-all duration-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:shadow-lg focus:shadow-amber-100/50 hover:shadow-md"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="animate-in fade-in duration-300 delay-400">
          <Loading />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm border mt-4 animate-in slide-in-from-bottom-4 duration-600 delay-400">
          <div className="mb-6 animate-in fade-in duration-500 delay-500">
            <p className="text-muted-foreground font-bold">
              Total Department: {allDepartmentData?.totalElements || 0}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allDepartmentData?.content?.length === 0 ? (
              <div className="col-span-full animate-in fade-in duration-500 delay-600">
                <p className="text-center text-muted-foreground py-8">
                  No Department found
                </p>
              </div>
            ) : (
              allDepartmentData?.content?.map((department, index) => (
                <div
                  key={department.id}
                  className="animate-in slide-in-from-bottom-4 duration-500"
                  style={{
                    animationDelay: `${600 + index * 100}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <DepartmentCard
                    onClick={() => onClickDepartmentCard(department.id)}
                    name={department.name}
                    imageUrl={department.urlLogo}
                    imageName={department.name}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!isLoading && allDepartmentData && (
        <div className="mt-4 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-500 delay-700">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allDepartmentData.totalPages}
            onPageChange={handlePageChange}
            className="transition-all duration-300"
          />
        </div>
      )}
    </div>
  );
}
