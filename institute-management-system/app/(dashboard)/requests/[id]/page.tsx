"use client";

import { ConfirmAcceptModal } from "@/components/dashboard/requests/confirm-accept-modal";
import { ConfirmRejectModal } from "@/components/dashboard/requests/confirm-reject-modal";
import { ConfirmReturnModal } from "@/components/dashboard/requests/confirm-return-modal";
import { RequestCompletedModal } from "@/components/dashboard/requests/request-completed-modal";
import { RequestHistory } from "@/components/dashboard/requests/request-history";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { RequestTranscript } from "@/components/dashboard/requests/request-transcript";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { REQUEST_DETAIL, RequestEnum, RequestType } from "@/constants/constant";
import { formatDegree } from "@/constants/format-enum/format-degree";
import { formatGender } from "@/constants/format-enum/formate-gender";
import { ROUTE } from "@/constants/routes";
import { RequestModel } from "@/model/request/request-model";
import {
  getDetailRequestService,
  updateRequestService,
} from "@/service/request/request.service";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import {
  Folder,
  X,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  FileText,
  Download,
  Tally1,
  User,
  GraduationCap,
  ChevronDown,
  Home,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { use } from "react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStudentExport } from "@/hooks/use-student-export";
import { getStudentByIdService } from "@/service/user/student.service";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

export default function StudentDetail() {
  // modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestEnum>(
    RequestEnum.PENDING
  );
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // API
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [requestData, setRequestData] = React.useState<RequestModel | null>(
    null
  );
  const [student, setStudent] = React.useState<StudentByIdModel | null>(null);
  const params = useParams();
  const requestId = params.id as string;

  const {
    exportFullTranscript,
    exportPersonalInfoOnly,
    exportAcademicHistoryOnly,
    exportCustomSections,
    isExporting,
    canExport,
  } = useStudentExport({ studentData: student });

  const hasStudiesHistory =
    student?.studentStudiesHistory && student.studentStudiesHistory.length > 0;
  const hasParentInfo =
    student?.studentParent && student.studentParent.length > 0;
  const hasSiblingInfo =
    student?.studentSibling && student.studentSibling.length > 0;

  const loadRequest = async () => {
    setIsLoading(true);
    try {
      const response = await getDetailRequestService(requestId);
      if (response) {
        setRequestData(response);
        // Set the request status from the API response
        setRequestStatus(response.status as RequestEnum);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudent = async () => {
    if (!requestData?.user.id) return;

    setIsLoading(true);
    try {
      const response = await getStudentByIdService(
        requestData?.user?.id?.toString()
      );
      if (response) {
        setStudent(response);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
    loadStudent();
  }, [requestId, requestData?.user.id]);

  // label and value in request detail
  const leftColumnData = [
    {
      label: "Student IdentifyNumber",
      value: requestData?.user?.identifyNumber || "---",
    },
    {
      label: "Gender",
      value: formatGender(requestData?.user?.gender) || "---",
    },
    {
      label: "Department",
      value: requestData?.user?.departmentName || "---",
    },
    {
      label: "Degree",
      value: formatDegree(requestData?.user?.degree) || "---",
    },
    { label: "Phone", value: requestData?.user?.phoneNumber || "---" },
  ];

  const rightColumnData = [
    {
      label: "Student Name",
      value:
        `${requestData?.user?.englishFirstName ?? ""} ${
          requestData?.user?.englishLastName ?? ""
        }`.trim() || "---",
    },
    {
      label: "Date of Birth",
      value: requestData?.user.dateOfBirth
        ? formatDate(requestData.user.dateOfBirth)
        : "---",
    },
    {
      label: "Major",
      value: requestData?.user?.majorName || "---",
    },
    {
      label: "Current Address",
      value: requestData?.user?.currentAddress || "---",
    },
  ];

  // button or tabs - Filter REQUEST_DETAIL based on isStudent
  const availableRequestTypes = React.useMemo(() => {
    if (requestData?.user?.isStudent === false) {
      return REQUEST_DETAIL.filter((type) => type.label !== "Transcript");
    }
    return REQUEST_DETAIL;
  }, [requestData?.user?.isStudent]);

  const [selectedType, setSelectedType] = useState<RequestType>({
    label: "Information",
    value: "INFORMATION",
    icon: Info,
  });

  // handle action tabs
  const handleTypeSelect = (type: RequestType) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

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

  const handleReturn = async (message: string) => {
    try {
      setIsLoading(true);

      // Call the API to update the request status
      await updateRequestService(parseInt(requestId), {
        status: RequestEnum.RETURN,
        staffComment: message,
      });

      // Update local state only after successful API call
      setRequestStatus(RequestEnum.RETURN);
      toast.success("Request updated to return successfully");

      // Optionally reload the request data to ensure consistency
      await loadRequest();

    } catch (error) {
      toast.error("An error occurred while update return request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setIsLoading(true);

      await updateRequestService(parseInt(requestId), {
        status: RequestEnum.ACCEPTED,
      });

      setRequestStatus(RequestEnum.ACCEPTED);
      toast.success("Request updated to accept successfully");

      await loadRequest();
    } catch (error) {
      toast.error("An error occurred while update accept request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (message: string) => {
    try {
      setIsLoading(true);

      await updateRequestService(parseInt(requestId), {
        status: RequestEnum.REJECTED,
        staffComment: message,
      });

      setRequestStatus(RequestEnum.REJECTED);
      toast.success("Request updated to reject successfully");

      await loadRequest();
    } catch (error) {
      toast.error("An error occurred while update reject request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDone = () => {
    setCompletedModalOpen(true);
  };

  const handleRequestCompleted = async () => {
    try {
      setIsLoading(true);

      await updateRequestService(parseInt(requestId), {
        status: RequestEnum.DONE,
      });

      setRequestStatus(RequestEnum.DONE);
      toast.success("Request updated to done successfully");

      await loadRequest();
    } catch (error) {
      toast.error("An error occurred while update complete request");
    } finally {
      setIsLoading(false);
    }
  };

  // Export dropdown
  const ExportButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={!canExport || isExporting}
          className="flex items-center gap-2 rounded-full px-4 shadow-md"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Transcript
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-xl shadow-lg p-1 bg-white"
      >
        <div className="px-3 py-2 text-sm font-semibold text-gray-700">
          Complete Transcript
        </div>
        <DropdownMenuItem onClick={exportFullTranscript}>
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Full Student Transcript
          <span className="ml-auto text-xs text-gray-500">All data</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-sm font-semibold text-gray-700">
          Partial Exports
        </div>

        <DropdownMenuItem onClick={exportPersonalInfoOnly}>
          <User className="h-4 w-4 mr-2 text-gray-600" />
          Personal & Class Info
          <span className="ml-auto text-xs text-gray-500">Basic</span>
        </DropdownMenuItem>

        {hasStudiesHistory && (
          <DropdownMenuItem onClick={exportAcademicHistoryOnly}>
            <GraduationCap className="h-4 w-4 mr-2 text-indigo-600" />
            Academic History
            <span className="ml-auto text-xs text-gray-500">Education</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-sm font-semibold text-gray-700">
          Family Information
        </div>

        {hasParentInfo && (
          <DropdownMenuItem
            onClick={() =>
              exportCustomSections(["personal", "class", "parent"])
            }
          >
            <Home className="h-4 w-4 mr-2 text-rose-600" />
            With Parents Info
            <span className="ml-auto text-xs text-gray-500">Father/Mother</span>
          </DropdownMenuItem>
        )}

        {hasSiblingInfo && (
          <DropdownMenuItem
            onClick={() =>
              exportCustomSections(["personal", "class", "sibling"])
            }
          >
            <Users className="h-4 w-4 mr-2 text-green-600" />
            With Siblings Info
            <span className="ml-auto text-xs text-gray-500">
              Brothers/Sisters
            </span>
          </DropdownMenuItem>
        )}

        {hasParentInfo && hasSiblingInfo && (
          <DropdownMenuItem
            onClick={() =>
              exportCustomSections(["personal", "class", "parent", "sibling"])
            }
          >
            <Users className="h-4 w-4 mr-2 text-purple-600" />
            Complete Family Data
            <span className="ml-auto text-xs text-gray-500">All family</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // image
  const profileUrl = requestData?.user?.profileUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${requestData.user.profileUrl}`
    : undefined;

  // Function to render content based on selected day
  const renderDayContent = () => {
    // Check if Information
    if (selectedType.label === "Information") {
      return (
        <Card className="bg-white shadow-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={profileUrl}
                  alt={requestData?.user?.username || "User"}
                />
                {/* <AvatarImage
                  src={"/assets/profile.png"}
                  alt={requestData?.user?.username || "User"}
                /> */}
                <AvatarFallback className="text-lg font-semibold">
                  {`${requestData?.user?.englishFirstName?.[0] ?? ""}${
                    requestData?.user?.englishLastName?.[0] ?? ""
                  }`.toUpperCase() || "N/A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {requestData?.user
                    ? `${requestData?.user?.englishFirstName || "---"} ${
                        requestData?.user?.englishLastName || "---"
                      }`
                    : "Unknown"}
                </h1>
                <p className="bg-green-100 hover:bg-green-200 text-green-900 p-2 px-4 rounded-full mt-2">
                  ID: {requestData?.user?.identifyNumber ?? "---"}
                </p>
              </div>
            </div>
          </CardHeader>

          <div className="px-4 md:px-6">
            <hr />
          </div>

          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Left Main Column */}
              <div className="space-y-4 md:space-y-5">
                {leftColumnData.map((item, index) => (
                  <div
                    key={`left-${index}`}
                    className="flex justify-between items-center"
                  >
                    <p className="text-sm text-gray-500 pr-4">{item.label}</p>
                    <p className="text-sm text-gray-900 text-right">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Main Column */}
              <div className="space-y-4 md:space-y-5">
                {rightColumnData.map((item, index) => (
                  <div
                    key={`right-${index}`}
                    className="flex justify-between items-center"
                  >
                    <p className="text-sm text-gray-500 pr-4">{item.label}</p>
                    <p className="text-sm text-gray-900 text-right">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // check if Transcript
    else if (selectedType.label === "Transcript") {
      return (
        <div>
          <Card className="border rounded-lg shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <h3 className="font-medium">Student Transcript</h3>
              <div className="flex items-center gap-2">
                <div className="pt-2">
                  <ExportButton />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="mt-4">
            <RequestTranscript studentId={requestData?.user?.id} />
          </Card>
        </div>
      );
    }

    // Check if History
    else if (selectedType.label === "History") {
      return (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <RequestHistory userId={requestData?.user.id} />
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div>
      <CardHeaderSection
        title="Request View Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Request List", href: ROUTE.REQUESTS },
          { label: "View Detail", href: ROUTE.REQUEST_DETAIL(requestId) },
        ]}
      />

      <div className="relative flex items-center my-6 ">
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
          {availableRequestTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Button
                key={type.label}
                variant={
                  selectedType?.value === type.value ? "default" : "outline"
                }
                className="whitespace-nowrap flex items-center gap-2"
                onClick={() => handleTypeSelect(type)}
              >
                <IconComponent className="w-4 h-4" />
                {type.label}
              </Button>
            );
          })}
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

      <div className="overflow-x-auto mt-4">
        {/* Conditional content based on selected tabs */}
        {renderDayContent()}

        {/* Request Document Section - only show when Informaion is selected */}
        {selectedType && selectedType.label === "Information" && (
          <Card className="bg-white shadow-sm mt-4">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Request Document
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Request Date: {formatDate(requestData?.createdAt || "---")}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {requestStatus === RequestEnum.PENDING && (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => setRejectModalOpen(true)}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        onClick={() => setReturnModalOpen(true)}
                        disabled={isLoading}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Return
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setAcceptModalOpen(true)}
                        disabled={isLoading}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </>
                  )}
                  {requestStatus === RequestEnum.ACCEPTED && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleMarkAsDone}
                      disabled={isLoading}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark As Done
                    </Button>
                  )}
                  {requestStatus === RequestEnum.DONE && (
                    <div className="text-sm text-green-800">
                      Request completed
                    </div>
                  )}
                  {requestStatus === RequestEnum.REJECTED && (
                    <div className="text-sm text-red-600">Request rejected</div>
                  )}
                  {requestStatus === RequestEnum.RETURN && (
                    <div className="text-sm text-orange-600">
                      Request returned
                    </div>
                  )}
                </div>
              </div>

              {/* Separator */}
              <div className="py-2">
                <hr className="border-gray-300" />
              </div>

              {/* Documents Section */}
              <div className="w-full md:w-1/2 mt-4">
                <Button className="flex items-center space-x-3 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition">
                  <Folder className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-900 whitespace-nowrap">
                    សញ្ញាបត្របណ្តោះអាសន្ន
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <ConfirmReturnModal
          open={returnModalOpen}
          onOpenChange={setReturnModalOpen}
          onConfirm={handleReturn}
        />
        <ConfirmAcceptModal
          open={acceptModalOpen}
          onOpenChange={setAcceptModalOpen}
          onConfirm={handleAccept}
        />
        <ConfirmRejectModal
          open={rejectModalOpen}
          onOpenChange={setRejectModalOpen}
          onConfirm={handleReject}
        />
        <RequestCompletedModal
          open={completedModalOpen}
          onOpenChange={setCompletedModalOpen}
          onConfirm={handleRequestCompleted}
        />
      </div>
    </div>
  );
}
