"use client";

import { ConfirmAcceptModal } from "@/components/dashboard/requests/confirm-accept-modal";
import { ConfirmRejectModal } from "@/components/dashboard/requests/confirm-reject-modal";
import { ConfirmReturnModal } from "@/components/dashboard/requests/confirm-return-modal";
import { RequestCompletedModal } from "@/components/dashboard/requests/request-completed-modal";
import { RequestHistory } from "@/components/dashboard/requests/request-history";
import { RequestTranscript } from "@/components/dashboard/requests/request-transcript";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";

import { REQUEST_DETAIL, RequestEnum, RequestType } from "@/constants/constant";
import { formatDegree } from "@/constants/format-enum/format-degree";
import { formatGender } from "@/constants/format-enum/formate-gender";
import { ROUTE } from "@/constants/routes";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import {
  Folder,
  X,
  RotateCcw,
  Check,
  Info,
  FileText,
  Download,
  User,
  GraduationCap,
  ChevronDown,
  Home,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStudentExport } from "@/hooks/use-student-export";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchRequestByIdThunk,
  updateRequestThunk,
  fetchRequestTranscriptThunk,
  fetchRequestHistoryThunk,
} from "@/features/requests/store/thunks/request-thunks";
import {
  selectSelectedRequest,
  selectRequestIsFetchingDetail,
  selectRequestIsUpdating,
  selectRequestTranscript,
} from "@/features/requests/store/selectors/request-selectors";
import { fetchStudentByIdThunk } from "@/features/students/store/thunks/student-thunks";
import { selectSelectedStudent, selectStudentOperations } from "@/features/students/store/selectors/student-selectors";

export default function StudentDetail() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const requestData = useAppSelector(selectSelectedRequest);
  const student = useAppSelector(selectSelectedStudent);
  const isRequestLoading = useAppSelector(selectRequestIsFetchingDetail);
  const isRequestUpdating = useAppSelector(selectRequestIsUpdating);
  const isStudentLoading = useAppSelector(selectStudentOperations).isFetchingDetail;
  const isLoading = isRequestLoading || isRequestUpdating || isStudentLoading;

  // modal states
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestEnum>(RequestEnum.PENDING);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  const params = useParams();
  const requestId = params.id as string;

  const transcriptReqData = useAppSelector(selectRequestTranscript);

  const {
    exportAcademicTranscript,
    isExporting,
    canExportAcademic,
  } = useStudentExport({
    studentDetail: student,
    transcriptData: transcriptReqData,
  });

  const hasStudiesHistory = student?.studentStudiesHistory && student.studentStudiesHistory.length > 0;
  const hasParentInfo = student?.studentParent && student.studentParent.length > 0;
  const hasSiblingInfo = student?.studentSibling && student.studentSibling.length > 0;

  const loadRequest = useCallback(async () => {
    try {
      const response = await dispatch(fetchRequestByIdThunk(requestId)).unwrap();
      if (response) {
        setRequestStatus(response.status as RequestEnum);
        if (response.user?.id) {
          const isStudent = response.user.isStudent !== false || response.user.roles?.includes("STUDENT");
          if (isStudent) {
            dispatch(fetchRequestTranscriptThunk(response.user.id));
          }
          dispatch(fetchRequestHistoryThunk({ userId: response.user.id, pageNo: 1 }));
        }
      }
    } catch {
      toast.error("Failed to load request details");
    }
  }, [requestId, dispatch]);

  const loadStudent = useCallback(async () => {
    if (!requestData?.user?.id) return;
    try {
      await dispatch(fetchStudentByIdThunk(requestData.user.id.toString())).unwrap();
    } catch {
      toast.error("Failed to load student details");
    }
  }, [requestData?.user?.id, dispatch]);

  useEffect(() => {
    loadRequest();
  }, [requestId, loadRequest]);

  useEffect(() => {
    if (requestData?.user?.id) {
      loadStudent();
    }
  }, [requestData?.user?.id, loadStudent]);

  // button or tabs - Filter REQUEST_DETAIL based on isStudent
  const availableRequestTypes = useMemo(() => {
    const isStudent = requestData?.user?.isStudent !== false || requestData?.user?.roles?.includes("STUDENT");
    if (!isStudent) {
      return REQUEST_DETAIL.filter((type) => type.label !== "Transcript");
    }
    return REQUEST_DETAIL;
  }, [requestData?.user?.isStudent, requestData?.user?.roles]);

  const [selectedType, setSelectedType] = useState<RequestType>({
    label: "Information",
    value: "INFORMATION",
    icon: Info,
  });

  const handleTypeSelect = (type: RequestType) => {
    setSelectedType(type);
  };

  const handleReturn = async (message: string) => {
    try {
      await dispatch(
        updateRequestThunk({
          id: parseInt(requestId),
          data: {
            status: RequestEnum.RETURN,
            staffComment: message,
          },
        })
      ).unwrap();

      setRequestStatus(RequestEnum.RETURN);
      toast.success("Request updated to return successfully");
      await loadRequest();
      setReturnModalOpen(false);
    } catch {
      toast.error("An error occurred while updating return request");
    }
  };

  const handleAccept = async (message?: string) => {
    try {
      await dispatch(
        updateRequestThunk({
          id: parseInt(requestId),
          data: {
            status: RequestEnum.ACCEPTED,
            staffComment: message || undefined,
          },
        })
      ).unwrap();

      setRequestStatus(RequestEnum.ACCEPTED);
      toast.success("Request updated to accept successfully");
      await loadRequest();
      setAcceptModalOpen(false);
    } catch {
      toast.error("An error occurred while updating accept request");
    }
  };

  const handleReject = async (message: string) => {
    try {
      await dispatch(
        updateRequestThunk({
          id: parseInt(requestId),
          data: {
            status: RequestEnum.REJECTED,
            staffComment: message,
          },
        })
      ).unwrap();

      setRequestStatus(RequestEnum.REJECTED);
      toast.success("Request updated to reject successfully");
      await loadRequest();
      setRejectModalOpen(false);
    } catch {
      toast.error("An error occurred while updating reject request");
    }
  };

  const handleMarkAsDone = () => {
    setCompletedModalOpen(true);
  };

  const handleRequestCompleted = async () => {
    try {
      await dispatch(
        updateRequestThunk({
          id: parseInt(requestId),
          data: {
            status: RequestEnum.DONE,
          },
        })
      ).unwrap();

      setRequestStatus(RequestEnum.DONE);
      toast.success("Request updated to done successfully");
      await loadRequest();
      setCompletedModalOpen(false);
    } catch {
      toast.error("An error occurred while updating complete request");
    }
  };

  if (isRequestLoading && !requestData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Request not found.</p>
      </div>
    );
  }

  const profileUrl = requestData?.user?.profileUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${requestData.user.profileUrl}`
    : undefined;

  return (
    <Tabs
      value={selectedType.value}
      onValueChange={(val) => {
        const found = availableRequestTypes.find((t) => t.value === val);
        if (found) setSelectedType(found);
      }}
      className="w-full space-y-4"
    >
      <CardHeaderSection
        title="Review Request Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Requests", href: ROUTE.REQUESTS },
          { label: "View Detail" },
        ]}
        tabs={
          <div className="mt-3 overflow-x-auto">
            <TabsList className="flex w-max min-w-full border-b gap-4 pb-1 bg-transparent justify-start">
              {availableRequestTypes.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType.value === type.value;
                return (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="relative pb-2 text-sm font-medium transition-colors duration-200 px-1 hover:text-primary data-[state=active]:text-primary bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-200 ${
                        isActive ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        }
      />

      <TabsContent value="INFORMATION" className="m-0 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
          {/* Left Column - Student Profile */}
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader className="text-center pb-4 pt-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="w-20 h-20 border border-gray-100 shadow-sm">
                  <AvatarImage src={profileUrl} alt={requestData.user?.username || "User"} />
                  <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                    {`${requestData.user?.englishFirstName?.[0] ?? ""}${requestData.user?.englishLastName?.[0] ?? ""}`.toUpperCase() || "N/A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {requestData.user
                      ? `${requestData.user?.englishFirstName || ""} ${requestData.user?.englishLastName || ""}`
                      : "Unknown User"}
                  </h2>
                  <div className="inline-block bg-primary/10 text-primary text-xs px-3 py-0.5 rounded-full font-bold mt-1">
                    ID: {requestData.user?.identifyNumber ?? "---"}
                  </div>
                </div>
              </div>
            </CardHeader>

            <div className="px-6"><hr className="border-gray-100" /></div>

            <CardContent className="p-5">
              <div className="space-y-3">
                {[
                  { label: "Gender", value: formatGender(requestData.user?.gender) || "---" },
                  { label: "Date of Birth", value: requestData.user?.dateOfBirth ? formatDate(requestData.user.dateOfBirth) : "---" },
                  { label: "Phone", value: requestData.user?.phoneNumber || "---" },
                  { label: "Degree", value: formatDegree(requestData.user?.degree) || "---" },
                  { label: "Department", value: requestData.user?.departmentName || "---" },
                  { label: "Major", value: requestData.user?.majorName || "---" },
                  { label: "Address", value: requestData.user?.currentAddress || "---" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-xs py-1">
                    <span className="text-gray-400 font-medium">{item.label}</span>
                    <span className="text-gray-800 font-semibold text-right max-w-[160px] break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Request details */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-gray-900">
                  {requestData.title || "No Title"}
                </h2>
                <p className="text-xs text-gray-400">
                  Submitted: {requestData.createdAt ? formatDate(requestData.createdAt) : "---"}
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* Student comment details */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Student Comments
                </h3>
                <p className="text-xs text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 leading-relaxed min-h-[60px]">
                  {requestData.requestComment || "No comments from student."}
                </p>
              </div>

              {/* Staff comment remarks */}
              {requestData.staffComment && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Staff Remarks
                  </h3>
                  <p className="text-xs text-gray-700 bg-amber-50/30 p-4 rounded-xl border border-amber-100 leading-relaxed">
                    {requestData.staffComment}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-4">
                  {requestStatus === RequestEnum.PENDING && (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 h-9 text-xs px-4 rounded-lg"
                        onClick={() => setRejectModalOpen(true)}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 h-9 text-xs px-4 rounded-lg"
                        onClick={() => setReturnModalOpen(true)}
                        disabled={isLoading}
                      >
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        Return
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-9 text-xs px-4 rounded-lg text-white"
                        onClick={() => setAcceptModalOpen(true)}
                        disabled={isLoading}
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        Accept
                      </Button>
                    </>
                  )}
                  {requestStatus === RequestEnum.ACCEPTED && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 h-9 text-xs px-4 rounded-lg text-white"
                      onClick={handleMarkAsDone}
                      disabled={isLoading}
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Mark As Done
                    </Button>
                  )}
                  {requestStatus === RequestEnum.DONE && (
                    <div className="text-sm font-normal text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      Completed
                    </div>
                  )}
                  {requestStatus === RequestEnum.REJECTED && (
                    <div className="text-sm font-normal text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                      Rejected
                    </div>
                  )}
                  {requestStatus === RequestEnum.RETURN && (
                    <div className="text-sm font-normal text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                      Returned
                    </div>
                  )}
                </div>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="TRANSCRIPT" className="m-0">
        <Card className="bg-white shadow-sm border border-gray-100 p-6 space-y-4 mt-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Student Transcript</h3>
            <Button
              disabled={!canExportAcademic || isExporting}
              onClick={() => exportAcademicTranscript()}
              className="flex items-center gap-2 rounded-full px-4 shadow-sm bg-primary hover:bg-primary/95 text-white h-9 text-xs"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Export Transcript
                </>
              )}
            </Button>
          </div>
          <RequestTranscript studentId={requestData.user?.id} />
        </Card>
      </TabsContent>

      <TabsContent value="HISTORY" className="m-0">
        <Card className="bg-white shadow-sm border border-gray-100 p-6 mt-4">
          <RequestHistory userId={requestData.user?.id} />
        </Card>
      </TabsContent>

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
        isSubmitting={isRequestUpdating}
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
        isSubmitting={isRequestUpdating}
      />
    </Tabs>
  );
}
