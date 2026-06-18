"use client";

import { Card, CardContent } from "@/components/ui/card";
import DepartmentCard from "@/components/dashboard/schedule/department/department-card";
import { useEffect } from "react";
import { ROUTE } from "@/constants/routes";
import { Constants } from "@/constants/text-string";
import { useRouter } from "next/navigation";
import Loading from "@/components/shared/loading";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectDepartmentData,
  selectDepartmentIsLoading,
  selectDepartmentFilters,
} from "@/features/master-data/store/selectors/department-selectors";
import {
  setSearchFilter,
  setPageNo,
  resetState,
} from "@/features/master-data/store/slice/department-slice";
import { fetchAllDepartmentService } from "@/features/master-data/store/thunks/department-thunks";

export default function DepartmentListPage() {
  const dispatch = useAppDispatch();
  const allDepartmentData = useAppSelector(selectDepartmentData);
  const isLoading = useAppSelector(selectDepartmentIsLoading);
  const filters = useAppSelector(selectDepartmentFilters);

  const router = useRouter();

  const { currentPage, currentPageSize, handlePageChange, handlePageSizeChange } =
    usePagination({ baseRoute: ROUTE.MANAGE_SCHEDULE.DEPARTMENT });

  const debouncedSearchQuery = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllDepartmentService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: currentPageSize,
        status: Constants.ACTIVE,
      })
    );
  }, [dispatch, debouncedSearchQuery, currentPage, currentPageSize]);

  useEffect(() => {
    return () => { dispatch(resetState()); };
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

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
          searchValue: filters.search,
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
                  <p className="text-center text-muted-foreground py-8">No Department found</p>
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
              onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
              pageSize={currentPageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
