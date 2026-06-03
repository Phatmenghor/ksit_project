"use client";

import { Clock, MapPin, Users } from "lucide-react";
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
import Loading from "@/components/shared/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentListTableHeader } from "@/constants/table/user";
import PaginationPage from "@/components/shared/pagination-page";
import { Constants } from "@/constants/text-string";
import { getScheduleByIdService } from "@/service/schedule/schedule.service";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { Button } from "@/components/ui/button";
import { AppIcons } from "@/constants/icons/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";

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

  const handleBackNavigation = () => {
    router.back();
  };

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

      {/* Form */}
      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {StudentListTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No student found
                  </TableCell>
                </TableRow>
              ) : (
                students?.content.map((student, index) => {
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>{student.username || "---"}</TableCell>
                      <TableCell>
                        {`${student.khmerFirstName || ""} ${
                          student.khmerLastName || ""
                        }`.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        {`${student.englishFirstName || ""} ${
                          student.englishLastName || ""
                        }`.trim() || "---"}
                      </TableCell>
                      <TableCell>{student.gender || "---"}</TableCell>
                      <TableCell>{student.dateOfBirth || "---"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {!isLoading && students && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={students.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
