"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Loading from "@/components/shared/loading";
import PaginationPage from "@/components/shared/pagination-page";
import DepartmentCard from "@/components/dashboard/schedule/department/department-card";
import { AllDepartmentModel } from "@/model/master-data/department/all-department-model";
import { ROUTE } from "@/constants/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { AllDepartmentFilterModel } from "@/model/master-data/department/type-department-model";
import { getMyDepartmentService } from "@/service/master-data/department.service";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { getAllStatisticService } from "@/service/statistic/statistic.service";
import { StatisticModel } from "@/model/statistic/statistic-model";
import { Separator } from "@/components/ui/separator";
import { usePagination } from "@/hooks/use-pagination";

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
  const [allDepartmentData, setAllDepartmentData] =
    useState<AllDepartmentModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statisticsData, setStatisticsData] = useState<StatisticModel | null>(
    null
  );
  const router = useRouter();

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.DASHBOARD,
      defaultPageSize: 10,
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
      setIsLoading(true);
      try {
        const response = await getMyDepartmentService({
          status: Constants.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          ...param,
        });

        if (response) {
          setAllDepartmentData(response);
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
    [currentPage]
  );

  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllStatisticService();
      if (response) {
        setStatisticsData(response);
      } else {
        console.error("Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
      toast.error("An error occurred while loading statistics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments({});
    loadStatistics();
  }, [currentPage, loadStatistics]);

  function onClickDepartmentCard(departmentId: number) {
    router.push(ROUTE.MY_CLASS.CLASS + `/${departmentId}`);
  }
  return (
    <div>
      {/* Manage Class Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

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
                <p>No Department found</p>
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
