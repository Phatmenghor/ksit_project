"use client";

import { Clock, Eye, MapPin, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/utils/date/date";
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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AllStudentModel,
  RequestAllStudent,
} from "@/model/user/student/student.respond.model";
import { getAllStudentsService } from "@/service/user/student.service";
import { toast } from "sonner";
import { Separator } from "@radix-ui/react-separator";
import { getScheduleByIdService } from "@/service/schedule/schedule.service";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { Button } from "@/components/ui/button";
import { AppIcons } from "@/constants/icons/icon";
import { usePagination } from "@/hooks/use-pagination";
import { Constants } from "@/constants/text-string";
import { DataTable, TableColumn } from "@/components/shared/data-table";

type StudentItem = AllStudentModel["content"][number];

export default function StudentListPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<AllStudentModel | null>(null);
  const [schedule, setSchedule] = useState<ScheduleModel | null>(null);

  const params = useParams();

  const scheduleId = params?.id ? Number(params.id) : null;

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.STUDENT_LIST(String(scheduleId)),
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

  const fetchSchedule = useCallback(
    async (filters: RequestAllStudent) => {
      setIsLoading(true);
      try {
        const baseFilters = {
          scheduleId: scheduleId || 0,
          sortType: "ASC",
          pageNo: currentPage,
          pageSize: 30,
          status: Constants.ACTIVE,
          ...filters,
        };

        const response = await getAllStudentsService(baseFilters);

        setStudents(response);
        // Handle case where current page exceeds total pages
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch (error) {
        toast.error("An error occurred while loading classes");
        setStudents(null);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage]
  );

  const fetchClassDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getScheduleByIdService(scheduleId || 0);

      setSchedule(response);
    } catch (error) {
      toast.error("An error occurred while loading classes");
      setSchedule(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule({});
    fetchClassDetail(); // Call with empty filters or your default filters
  }, [currentPage, fetchClassDetail]);
  const router = useRouter();

  const tableColumns: TableColumn<StudentItem>[] = [
    {
      key: "index",
      label: "#",
      width: "50px",
      render: (_item, index) => getDisplayIndex(index),
    },
    {
      key: "username",
      label: "Student ID",
      render: (student) => student.username || "---",
    },
    {
      key: "fullnameKH",
      label: "Fullname (KH)",
      render: (student) =>
        `${student.khmerFirstName || ""} ${student.khmerLastName || ""}`.trim() ||
        "---",
    },
    {
      key: "fullnameEN",
      label: "Fullname (EN)",
      render: (student) =>
        `${student.englishFirstName || ""} ${student.englishLastName || ""}`.trim() ||
        "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (student) => student.gender || "---",
    },
    {
      key: "dateOfBirth",
      label: "Date Of Birth",
      render: (student) =>
        student.dateOfBirth ? formatDate(student.dateOfBirth) : "---",
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (student) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    router.push(ROUTE.STUDENTS.VIEW(String(student.id)))
                  }
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Student Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Card className="mb-6">
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
                <BreadcrumbPage>Student List Schedule</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

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
              {schedule?.course?.subject.name || "---"}
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
                          {schedule?.course.code}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {schedule?.day || "- - -"}
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {schedule?.course.nameKH ||
                          schedule?.course.nameKH ||
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
                        <span>{schedule?.room.name || "- - -"}</span>
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
        loading={isLoading}
        currentPage={currentPage}
        totalPages={students?.totalPages ?? 0}
        totalElements={students?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No student found"
        getRowKey={(student) => student.id}
      />
    </div>
  );
}
