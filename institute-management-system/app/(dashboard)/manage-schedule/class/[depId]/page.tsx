"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AllMajorFilterModel } from "@/model/master-data/major/type-major-model";
import { getAllMajorService } from "@/service/master-data/major.service";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { AllMajorModel } from "@/model/master-data/major/all-major-model";
import {
  AllClassModel,
  ClassModel,
} from "@/model/master-data/class/all-class-model";
import { getAllClassService } from "@/service/master-data/class.service";
import { ClassCard } from "@/components/dashboard/schedule/class/class-card";
import Loading from "@/components/shared/loading";
import { AppIcons } from "@/constants/icons/icon";
import { useDebounce } from "@/utils/debounce/debounce";
import PaginationPage from "@/components/shared/pagination-page";
import { usePagination } from "@/hooks/use-pagination";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allMajorData, setAllMajorData] = useState<AllMajorModel | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [allClassData, setAllClassData] = useState<AllClassModel | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
  const params = useParams();
  const depId = params?.depId ? Number(params.depId) : null;
  const router = useRouter();

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
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

  // Effect for initial URL setup
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
          // Only set selected major if we don't have one or if the current one is not in the new results
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

  // Load classes when search query or selected major changes
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

        // Handle case where current page exceeds total pages
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

  // Load majors initially
  useEffect(() => {
    loadMajors({});
  }, [loadMajors]);

  // Load classes when selectedMajor, searchDebounce, or currentPage changes
  useEffect(() => {
    if (selectedMajor) {
      loadClasses(selectedMajor, searchDebounce, currentPage);
    }
  }, [selectedMajor, searchDebounce, currentPage, loadClasses]);

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

  const handleMajorSelect = async (majorId: number) => {
    setSelectedMajor(majorId);
    // Reset to page 1 when changing major
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
    // Classes will be loaded by the useEffect that watches selectedMajor
  };

  const handleViewSchedule = (classData: ClassModel) => {
    router.push(`/manage-schedule/all-schedule/${classData.id}`);
  };

  const handleAddSchedule = (classData: ClassModel) => {
    router.push(`/manage-schedule/create-schedule/${classData.id}`);
  };

  // Show single loading screen during initial load
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  // Check if we should show empty majors state
  const shouldShowEmptyMajors =
    hasLoadedOnce &&
    allMajorData &&
    (!allMajorData.content || allMajorData.content.length === 0);

  return (
    <div>
      <Card>
        <CardContent className="p-6 space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.SCHEDULE.DEPARTMENT}>
                  Department List
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Class List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              asChild
              onClick={() => router.back()}
              className="rounded-full flex-shrink-0 hover:cursor-pointer"
            >
              <img
                src={AppIcons.Back}
                alt="back Icon"
                className="h-4 w-4 mr-5 text-muted-foreground"
              />
            </Button>

            <h3 className="text-xl font-bold">
              {allMajorData?.content?.[0]?.department?.name || "No Department"}
            </h3>
          </div>

          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search classes..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Majors Selection */}
      {allMajorData?.content && allMajorData.content.length > 0 ? (
        <div className="relative flex items-center my-6">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 z-10 rounded-full"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-2 px-16 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {allMajorData.content.map((major) => (
              <Button
                key={major.id}
                variant={selectedMajor === major.id ? "default" : "outline"}
                className="whitespace-nowrap"
                onClick={() => handleMajorSelect(major.id)}
              >
                {major.name}
              </Button>
            ))}
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
      ) : null}

      {/* Display Classes */}
      {selectedMajor && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="space-y-4">
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
                  {allClassData && (
                    <div className="mt-4 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-500 delay-700">
                      <PaginationPage
                        currentPage={currentPage}
                        totalPages={allClassData.totalPages}
                        onPageChange={handlePageChange}
                        className="transition-all duration-300"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <EmptyClassesState
                  majorName={
                    allMajorData?.content?.find((m) => m.id === selectedMajor)
                      ?.name
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassSchedulePage;
