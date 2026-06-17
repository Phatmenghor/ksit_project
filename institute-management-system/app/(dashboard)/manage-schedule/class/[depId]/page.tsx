"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { Users } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AllMajorFilterModel } from "@/model/master-data/major/type-major-model";
import { getAllMajorService } from "@/service/master-data/major.service";
import { getDepartmentByIdService } from "@/service/master-data/department.service";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { AllMajorModel } from "@/model/master-data/major/all-major-model";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import {
  AllClassModel,
  ClassModel,
} from "@/model/master-data/class/all-class-model";
import { getAllClassService } from "@/service/master-data/class.service";
import { ClassCard } from "@/components/dashboard/schedule/class/class-card";
import Loading from "@/components/shared/loading";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

const EmptyClassesState = ({ majorName }: { majorName?: string }) => (
  <div className="text-center py-12 space-y-4">
    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
      <Users className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">No Classes Available</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {majorName
          ? `No classes are currently available for ${majorName}. Classes may be added later.`
          : "No classes are available for the selected major at this time."}
      </p>
    </div>
  </div>
);

const ClassSchedulePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allMajorData, setAllMajorData] = useState<AllMajorModel | null>(null);
  const [department, setDepartment] = useState<DepartmentModel | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [allClassData, setAllClassData] = useState<AllClassModel | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
  const params = useParams();
  const depId = params?.depId ? Number(params.depId) : null;
  const router = useRouter();

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.MANAGE_SCHEDULE.CLASS(String(depId)),
    defaultPageSize: 10,
  });

  const searchDebounce = useDebounce(searchQuery, 500);

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

  const loadMajors = useCallback(
    async (param: AllMajorFilterModel) => {
      try {
        if (!hasLoadedOnce) {
          setIsInitialLoading(true);
        }

        const response = await getAllMajorService({
          status: Constants.ACTIVE,
          departmentId: depId || undefined,
          ...param,
        });

        if (response) {
          setAllMajorData(response);
          if (!selectedMajor && response.content.length > 0) {
            setSelectedMajor(response.content[0].id);
          } else if (selectedMajor && response.content.length === 0) {
            setSelectedMajor(null);
            setAllClassData(null);
          }
        } else {
          toast.error("Failed to load majors");
        }
      } catch (error) {
        toast.error("An error occurred while loading majors");
      } finally {
        setIsInitialLoading(false);
        setHasLoadedOnce(true);
      }
    },
    [depId, hasLoadedOnce, selectedMajor]
  );

  const loadClasses = useCallback(
    async (majorId: number, search?: string, page?: number) => {
      if (!majorId) return;

      setIsLoadingClasses(true);
      try {
        const responseListClass = await getAllClassService({
          status: Constants.ACTIVE,
          search: search || undefined,
          majorId: majorId,
          pageNo: page || currentPage,
          pageSize: 30,
        });

        setAllClassData(responseListClass);

        if (
          responseListClass &&
          responseListClass.totalPages > 0 &&
          currentPage > responseListClass.totalPages
        ) {
          updateUrlWithPage(responseListClass.totalPages);
          return;
        }
      } catch (error) {
        toast.error("Failed to load classes");
      } finally {
        setIsLoadingClasses(false);
      }
    },
    [currentPage, updateUrlWithPage]
  );

  useEffect(() => {
    if (!depId) return;
    getDepartmentByIdService(depId).then((response) => {
      if (response) {
        setDepartment(response);
      }
    });
  }, [depId]);

  useEffect(() => {
    loadMajors({});
  }, [loadMajors]);

  useEffect(() => {
    if (selectedMajor) {
      loadClasses(selectedMajor, searchDebounce, currentPage);
    }
  }, [selectedMajor, searchDebounce, currentPage, loadClasses]);

  const handleMajorSelect = (majorId: string) => {
    setSelectedMajor(Number(majorId));
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  const handleViewSchedule = (classData: ClassModel) => {
    router.push(ROUTE.MANAGE_SCHEDULE.All_SCHEDULE_DETAIL(String(classData.id)));
  };

  const handleAddSchedule = (classData: ClassModel) => {
    router.push(`/manage-schedule/create-schedule/${classData.id}`);
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb
            items={[
              { label: "Department List", href: ROUTE.SCHEDULE.DEPARTMENT },
              { label: "Class List" },
            ]}
          />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: `Class List${department?.name ? ` (${department.name})` : ""}`,
          onBack: () => router.back(),
          totalCount: allClassData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search classes...",
          onSearchChange: handleSearchChange,
          filters:
            allMajorData?.content && allMajorData.content.length > 0
              ? [
                  {
                    id: "major",
                    type: "select",
                    label: "Major",
                    placeholder: "Select a major",
                    value: selectedMajor ? String(selectedMajor) : "",
                    onChange: (v) => v && handleMajorSelect(String(v)),
                    options: allMajorData.content.map((major) => ({
                      value: String(major.id),
                      label: major.name,
                    })),
                  },
                ]
              : [],
        }}
      />

      {selectedMajor && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-6">
              <p className="text-muted-foreground font-bold">
                Total Class: {allClassData?.totalElements || 0}
              </p>
            </div>

            {isLoadingClasses ? (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            ) : allClassData?.content && allClassData.content.length > 0 ? (
              <div className="space-y-4">
                {allClassData.content.map((classItem: ClassModel) => (
                  <ClassCard
                    IsAdd={true}
                    key={classItem.id}
                    classData={classItem}
                    onViewSchedule={() => handleViewSchedule(classItem)}
                    onAddSchedule={() => handleAddSchedule(classItem)}
                  />
                ))}
                <DataTablePagination
                  currentPage={currentPage}
                  totalPages={allClassData.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <EmptyClassesState
                majorName={
                  allMajorData?.content?.find((m) => m.id === selectedMajor)
                    ?.name
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassSchedulePage;
