"use client";

import { Card, CardContent } from "@/components/ui/card";
import DepartmentCard from "@/components/dashboard/schedule/department/department-card";
import { AllDepartmentModel } from "@/model/master-data/department/all-department-model";
import { useCallback, useEffect, useState } from "react";
import { getAllDepartmentService } from "@/service/master-data/department.service";
import { toast } from "sonner";
import { ROUTE } from "@/constants/routes";
import { AllDepartmentFilterModel } from "@/model/master-data/department/type-department-model";
import { Constants } from "@/constants/text-string";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/shared/loading";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export default function DepartmentListPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allDepartmentData, setAllDepartmentData] =
    useState<AllDepartmentModel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.MANAGE_SCHEDULE.DEPARTMENT,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
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
          pageSize: currentPageSize,
          status: Constants.ACTIVE,
          ...param,
        });

        if (response) {
          setAllDepartmentData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
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
  }, [loadDepartments]);

  function onClickDepartmentCard(departmentId: number) {
    router.push(ROUTE.MANAGE_SCHEDULE.DEPARTMENT_CLASS + `/${departmentId}`);
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Department List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Schedule",
          totalCount: allDepartmentData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search department...",
          onSearchChange: handleSearchChange,
          filters: [],
        }}
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4">
            <p className="text-muted-foreground font-bold">
              Total Department: {allDepartmentData?.totalElements || 0}
            </p>
          </div>

          {isLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allDepartmentData?.content?.length === 0 ? (
                <div className="col-span-full">
                  <p className="text-center text-muted-foreground py-8">
                    No Department found
                  </p>
                </div>
              ) : (
                allDepartmentData?.content?.map((department) => (
                  <DepartmentCard
                    key={department.id}
                    onClick={() => onClickDepartmentCard(department.id)}
                    name={department.name}
                    code={department.code}
                    imageUrl={department.urlLogo}
                    imageName={department.name}
                  />
                ))
              )}
            </div>
          )}

          {!isLoading && allDepartmentData && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={allDepartmentData.totalPages}
              onPageChange={handlePageChange}
              pageSize={currentPageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
