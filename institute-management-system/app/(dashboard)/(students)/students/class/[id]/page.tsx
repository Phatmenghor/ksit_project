"use client";

import { Clock, MapPin, Users } from "lucide-react";
import { createStudentClassColumns } from "./columns";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ROUTE } from "@/constants/routes";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { AppIcons } from "@/constants/icons/icon";
import { usePagination } from "@/hooks/use-pagination";
import { Constants } from "@/constants/text-string";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAllStudentsService } from "@/features/students/store/thunks/student-thunks";
import {
  selectStudentData,
  selectStudentIsLoading,
} from "@/features/students/store/selectors/student-selectors";
import { fetchScheduleByIdService } from "@/features/schedules/store/thunks/schedule-thunks";
import { selectSelectedSchedule } from "@/features/schedules/store/selectors/schedule-selectors";

export default function StudentListPage() {
  const dispatch = useAppDispatch();
  const students = useAppSelector(selectStudentData);
  const schedule = useAppSelector(selectSelectedSchedule);
  const isStudentLoading = useAppSelector(selectStudentIsLoading);

  const params = useParams();
  const scheduleId = params?.id ? Number(params.id) : null;
  const searchParams = useSearchParams();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.STUDENT_LIST(String(scheduleId)),
    });

  // Then add this effect for initial URL setup
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      // Use replace: true to avoid adding to browser history
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const fetchSchedule = useCallback(
    async (filters: any) => {
      try {
        const baseFilters = {
          scheduleId: scheduleId || 0,
          sortType: "ASC",
          pageNo: currentPage,
          pageSize: currentPageSize,
          status: Constants.ACTIVE,
          ...filters,
        };

        const response = await dispatch(fetchAllStudentsService(baseFilters)).unwrap();

        // Handle case where current page exceeds total pages
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch (error) {
        toast.error("An error occurred while loading classes");
      }
    },
    [currentPage, currentPageSize, scheduleId, dispatch, updateUrlWithPage]
  );

  const fetchClassDetail = useCallback(async () => {
    try {
      await dispatch(fetchScheduleByIdService(scheduleId || 0)).unwrap();
    } catch (error) {
      toast.error("An error occurred while loading classes");
    }
  }, [scheduleId, dispatch]);

  useEffect(() => {
    fetchSchedule({});
    fetchClassDetail(); // Call with empty filters or your default filters
  }, [currentPage, fetchClassDetail]);
  const router = useRouter();

  const tableColumns = createStudentClassColumns({ getDisplayIndex, router });

  return (
    <div>
      {/* Breadcrumb */}
      <Card className="mb-6">
        <CardContent className="p-6 space-y-2">
          <PageBreadcrumb items={[{ label: "Student List Schedule" }]} />

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full flex-shrink-0 hover:cursor-pointer"
            >
              <img
                src={AppIcons.Back}
                alt="back Icon"
                className="h-4 w-4 mr-5 text-muted-foreground"
              />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              {schedule?.course?.subject?.name || "---"}
            </h1>
          </div>

          {/* Class Info Card */}
          <Card className="mb-6 bg-orange-50 border-orange-200">
            <CardContent className="p-0">
              <div>
                <div className="p-4 flex-1">
                  <div className="flex gap-4">
                    <div className="flex border-l-[2px] my-1 border-amber-500 rounded-xl " />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-1 justify-between">
                        <div className="text-sm font-medium text-amber-500">
                          {schedule?.course?.code}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {schedule?.day || "- - -"}
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {schedule?.course?.nameKH ||
                          schedule?.course?.nameEn ||
                          "- - -"}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex flex-wrap mt-3 ">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {schedule?.startTime} - {schedule?.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {(schedule?.teacher &&
                            (schedule?.teacher.englishFirstName ||
                            schedule?.teacher.englishLastName
                              ? `${schedule?.teacher.englishFirstName || ""} ${
                                  schedule?.teacher.englishLastName || ""
                                }`.trim()
                              : schedule?.teacher.khmerFirstName ||
                                schedule?.teacher.khmerLastName
                              ? `${schedule?.teacher.khmerFirstName || ""} ${
                                  schedule?.teacher.khmerLastName || ""
                                }`.trim()
                              : "- - -")) ||
                            "- - -"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{schedule?.room?.name || "- - -"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <DataTable
        data={students?.content ?? null}
        columns={tableColumns}
        loading={isStudentLoading}
        currentPage={currentPage}
        totalPages={students?.totalPages ?? 0}
        totalElements={students?.totalElements}
        onPageChange={handlePageChange}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No student found"
        getRowKey={(student) => student.id}
      />
    </div>
  );
}
