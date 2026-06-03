"use client";
import {
  BookOpen,
  Clock,
  User,
  Building,
  GraduationCap,
  FileText,
  Target,
  Lightbulb,
  Award,
  Calendar,
  Users,
  ChevronLeft,
  Timer,
  MapPin,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DetialCourseModel } from "@/model/master-data/course/type-course-model";
import { DetailCourseService } from "@/service/master-data/course.service";
import { AppIcons } from "@/constants/icons/icon";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [courseData, setCourseData] = useState<DetialCourseModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const courseId = params?.id ? Number(params.id) : null;

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      const data = await DetailCourseService(courseId);
      if (data) {
        setCourseData(data);
      }
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The course you're looking for doesn't exist.
          </p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="mx-auto px-2 sm:px-4 lg:px-2 py-2 space-y-4">
        {/* Header Section */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6 lg:p-8">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/courses"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                  >
                    Courses
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="text-gray-500 dark:text-gray-400">
                    Course Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {courseData.nameEn || courseData.nameKH}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    >
                      {courseData.code}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>
                        {courseData?.credit || "---"} ({courseData?.theory},
                        {courseData?.execute},{courseData?.apply}) Credits
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span>{courseData.totalHour} Hours</span>
                    </div>
                    {courseData.department?.name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{courseData.department.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Information Card */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="text-black p-6 lg:p-8 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <BookOpen className="h-6 w-6" />
              <span>Course Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <InfoCard
                icon={<FileText className="h-5 w-5" />}
                label="Subject Code"
                value={courseData.code}
              />
              <InfoCard
                icon={<GraduationCap className="h-5 w-5" />}
                label="Subject Name (KH)"
                value={courseData.nameKH}
              />
              <InfoCard
                icon={<Award className="h-5 w-5" />}
                label="Credits"
                value={courseData.credit}
              />
              <InfoCard
                icon={<Clock className="h-5 w-5" />}
                label="Total Hours"
                value={courseData.totalHour}
              />
              <InfoCard
                icon={<BookOpen className="h-5 w-5" />}
                label="Theory Hours"
                value={courseData.theory}
              />
              <InfoCard
                icon={<Users className="h-5 w-5" />}
                label="Applied Hours"
                value={courseData.apply}
              />
              <InfoCard
                icon={<Building className="h-5 w-5" />}
                label="Department"
                value={courseData.department?.name}
              />
              <InfoCard
                icon={<User className="h-5 w-5" />}
                label="Instructor"
                value={courseData.user?.username}
              />
              <InfoCard
                icon={<BookOpen className="h-5 w-5" />}
                label="Subject Type"
                value={courseData.subject?.name}
              />
              <InfoCard
                icon={<Calendar className="h-5 w-5" />}
                label="Execute"
                value={courseData.subject?.id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Three Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ContentCard
            icon={FileText}
            title="Description"
            content={courseData.description || "No description provided"}
            isEmpty={!courseData.description}
          />

          <ContentCard
            icon={Target}
            title="Purpose"
            content={courseData.purpose || "No purpose specified"}
            isEmpty={!courseData.purpose}
          />

          <ContentCard
            icon={Lightbulb}
            title="Expected Outcome"
            content={
              courseData.expectedOutcome || "No expected outcome specified"
            }
            isEmpty={!courseData.expectedOutcome}
          />
        </div>
      </div>
    </div>
  );
}

// Clean Info Card Component
function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
}) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {value ?? "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Clean Content Card Component
function ContentCard({
  icon: Icon,
  title,
  content,
  isEmpty,
}: {
  icon: any;
  title: string;
  content: string;
  isEmpty: boolean;
}) {
  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-6">
        <CardTitle className="flex items-center text-black space-x-3 text-lg  dark:text-white">
          <Icon className="h-5 w-5 dark:text-gray-400" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isEmpty ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">{content}</p>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Clean Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="h-40 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"></div>

          {/* Course info skeleton */}
          <div className="h-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"></div>

          {/* Three cards skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"></div>
            <div className="h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"></div>
            <div className="h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
