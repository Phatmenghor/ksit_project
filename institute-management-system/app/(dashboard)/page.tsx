"use client";

import { useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import Loading from "@/components/shared/loading";
import PaginationPage from "@/components/shared/pagination-page";
import DepartmentCard from "@/components/dashboard/schedule/department/department-card";
import { ROUTE } from "@/constants/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { AllDepartmentFilterModel } from "@/model/master-data/department/type-department-model";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { usePagination } from "@/hooks/use-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMyDepartmentsService } from "@/features/master-data/store/thunks/department-thunks";
import { fetchAllStatisticThunk } from "@/store/slices/statistic-slice";

interface MetricCardProps {
  title: string;
  value: number;
  borderColor?: string;
}

const MetricCard = ({
  title,
  value,
  borderColor = "bg-orange-400",
}: MetricCardProps) => (
  <div className="relative bg-amber-50 rounded-md overflow-hidden h-full">
    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${borderColor}`} />
    <div className="absolute left-8  top-[18px] h-[35px] w-1 bg-amber-500 rounded-xl " />
    <div className="py-2 px-2 text-center">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  </div>
);

export default function ManageClassPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: allDepartmentData, isLoading: isDepartmentsLoading } = useAppSelector(
    (state) => state.departments
  );
  const { data: statisticsData, isLoading: isStatisticLoading } = useAppSelector(
    (state) => state.statistic
  );

  const isLoading = isDepartmentsLoading || isStatisticLoading;

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } =
    usePagination({
      baseRoute: ROUTE.DASHBOARD,
    });

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
      try {
        const response = await dispatch(
          fetchMyDepartmentsService({
            status: Constants.ACTIVE,
            pageNo: currentPage,
            pageSize: currentPageSize,
            ...param,
          })
        ).unwrap();

        if (response) {
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading departments");
      }
    },
    [currentPage, currentPageSize, dispatch, updateUrlWithPage]
  );

  const loadStatistics = useCallback(async () => {
    try {
      await dispatch(fetchAllStatisticThunk()).unwrap();
    } catch (error) {
      toast.error("An error occurred while loading statistics");
    }
  }, [dispatch]);

  useEffect(() => {
    loadDepartments({});
    loadStatistics();
  }, [currentPage, currentPageSize, loadDepartments, loadStatistics]);

  function onClickDepartmentCard(departmentId: number) {
    router.push(ROUTE.MY_CLASS.CLASS + `/${departmentId}`);
  }
  return (
    <div>
      {/* Manage Class Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <PageBreadcrumb items={[{ label: "Overview" }]} />

            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>

          <Separator className="bg-gray-900" />

          <p className="text-gray-900">Overview Data</p>
          {/* Overview Data Section */}
          <div className="space-y-4">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Total Student"
                value={statisticsData?.totalStudents || 0}
                borderColor="border-l-orange-400"
              />
              <MetricCard
                title="Total Teacher"
                value={statisticsData?.totalTeachers || 0}
                borderColor="border-l-blue-400"
              />
              <MetricCard
                title="Total Room"
                value={statisticsData?.totalRooms || 0}
                borderColor="border-l-green-400"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Courses"
                value={statisticsData?.totalCourses || 0}
                borderColor="border-l-purple-400"
              />
              <MetricCard
                title="Total Class"
                value={statisticsData?.totalClasses || 0}
                borderColor="border-l-red-400"
              />
              <MetricCard
                title="Total Major"
                value={statisticsData?.totalMajors || 0}
                borderColor="border-l-yellow-400"
              />
              <MetricCard
                title="Total Department"
                value={statisticsData?.totalDepartments || 0}
                borderColor="border-l-indigo-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm border mt-4">
            <div className="mb-6">
              <p className="text-muted-foreground font-bold">Department List</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allDepartmentData?.content?.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState message="No departments found" />
                </div>
              ) : (
                allDepartmentData?.content?.map((department) => (
                  <DepartmentCard
                    onClick={() => onClickDepartmentCard(department.id)}
                    key={department.id}
                    name={department.name}
                    imageUrl={department.urlLogo}
                    imageName={department.name}
                  />
                ))
              )}
            </div>
          </div>
        )}
        {!isLoading && allDepartmentData && (
          <div className="mt-4 flex justify-end">
            <PaginationPage
              currentPage={currentPage}
              totalPages={allDepartmentData.totalPages}
              onPageChange={handlePageChange}
              pageSize={currentPageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
