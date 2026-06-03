// AttendanceCheckPage.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  RefreshCcw,
  RefreshCw,
  Search,
  Upload,
  Loader2,
  X,
  Send,
  CheckCircle,
  AlertCircle,
  Timer,
  Plus,
} from "lucide-react";
import { useParams } from "next/navigation";
import { getDetailScheduleService } from "@/service/schedule/schedule.service";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { QRCodeSection } from "@/components/dashboard/attendance/qr-code-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  getAllAttendanceGenerateService,
  submitAttendanceSessionService,
  updateAttendanceSessionService,
} from "@/service/schedule/attendance.service";
import { AttendanceGenerateModel } from "@/model/attendance/attendance-generate";
import {
  attendanceStatusOptions,
  attendanceTypeOptions,
} from "@/constants/filter/filter-page";
import { Badge } from "@/components/ui/badge";
import AttendanceCheckHeader from "@/components/dashboard/attendance/schedule/attendance-check-header";

const AttendanceCheckPage = () => {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;

  // Core state
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleModel | null>(
    null
  );
  const [attendanceGenerate, setAttendanceGenerate] =
    useState<AttendanceGenerateModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced state for saving - Using Set for better performance
  const [unsavedChanges, setUnsavedChanges] = useState<Set<number>>(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isSubmittingToStaff, setIsSubmittingToStaff] = useState(false);

  // Store original data for comparison
  const [originalData, setOriginalData] = useState<Map<number, any>>(new Map());

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Settings state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState<Date | null>(null);

  // Refs for smooth scrolling and focus management
  const tableRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh timing constants
  const REFRESH_INTERVAL = 30; // 30 seconds
  const PROGRESS_UPDATE_INTERVAL = 100; // Update progress every 100ms

  // Get status color with smooth transitions
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "text-green-700 bg-green-100 border-green-300 shadow-sm transition-all duration-200";
      case "absent":
        return "text-red-700 bg-red-100 border-red-300 shadow-sm transition-all duration-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300 shadow-sm transition-all duration-200";
    }
  };

  // Enhanced data loading functions with better error handling
  const loadScheduleData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getDetailScheduleService(id);
      setScheduleDetail(response);
    } catch (error) {
      toast.error("Error fetching schedule data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const HandleInitAttendance = useCallback(
    async (forceRefresh = false, showLoader = true) => {
      if (!scheduleDetail?.id) return;

      if (!forceRefresh && unsavedChanges.size > 0) {
        return;
      }

      if (showLoader) {
        setIsRefreshing(true);
      }

      try {
        const response = await getAllAttendanceGenerateService({
          scheduleId: scheduleDetail.id,
        });

        setAttendanceGenerate(response);
        setLastUpdated(new Date());
        setIsInitialized(true);

        // Store original data for comparison
        const originalMap = new Map();
        response.attendances?.forEach((attendance: any) => {
          originalMap.set(attendance.id, {
            status: attendance.status,
            attendanceType: attendance.attendanceType,
            comment: attendance.comment || "",
          });
        });
        setOriginalData(originalMap);

        // Reset unsaved changes
        setUnsavedChanges(new Set());

        // Check if already submitted
        setIsSubmitted(response.isSubmitted || false);
        if (response.submissionTime) {
          setSubmissionTime(new Date(response.submissionTime));
        }
      } catch (error) {
        toast.error("Error fetching attendance data");
      } finally {
        if (showLoader) {
          // Add a small delay for smooth animation
          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
        }
      }
    },
    [scheduleDetail, unsavedChanges.size]
  );

  // Smooth progress animation for auto-refresh
  const startRefreshProgress = useCallback(() => {
    setRefreshProgress(0);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / REFRESH_INTERVAL) * 100, 100);

      setRefreshProgress(progress);

      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, PROGRESS_UPDATE_INTERVAL);
  }, []);

  // Smart auto-refresh with smooth progress animation
  useEffect(() => {
    if (autoRefresh && isInitialized && !isSubmitted) {
      startRefreshProgress();

      refreshIntervalRef.current = setInterval(() => {
        if (unsavedChanges.size === 0) {
          HandleInitAttendance(false, false); // Silent refresh
          startRefreshProgress(); // Restart progress
        }
      }, REFRESH_INTERVAL);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    } else {
      // Clean up intervals when auto-refresh is disabled
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setRefreshProgress(0);
    }
  }, [
    autoRefresh,
    isInitialized,
    unsavedChanges.size,
    HandleInitAttendance,
    startRefreshProgress,
    isSubmitted,
  ]);

  // Optimized field change handler with Set
  const handleFieldChange = useCallback(
    (attendanceId: number, field: string, value: string) => {
      if (isSubmitted) {
        toast.error("Cannot modify attendance after submission");
        return;
      }

      // Update attendance data with optimistic update
      setAttendanceGenerate((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          attendances: prev.attendances.map((attendance) =>
            attendance.id === attendanceId
              ? { ...attendance, [field]: value }
              : attendance
          ),
        };
      });

      // Smart unsaved changes tracking with original data comparison
      setUnsavedChanges((prevSet) => {
        const original = originalData.get(attendanceId);
        if (!original) {
          // If no original data, mark as unsaved
          if (prevSet.has(attendanceId)) return prevSet;
          const newSet = new Set(prevSet);
          newSet.add(attendanceId);
          return newSet;
        }

        // Get current state to compare
        const currentAttendance = attendanceGenerate?.attendances.find(
          (a) => a.id === attendanceId
        );

        if (!currentAttendance) return prevSet;

        // Create updated version
        const updated = { ...currentAttendance, [field]: value };

        // Check if any field differs from original
        const hasChanges =
          updated.status !== original.status ||
          updated.attendanceType !== original.attendanceType ||
          (updated.comment || "") !== original.comment;

        const isCurrentlyUnsaved = prevSet.has(attendanceId);

        if (hasChanges && !isCurrentlyUnsaved) {
          // Add to unsaved
          const newSet = new Set(prevSet);
          newSet.add(attendanceId);
          return newSet;
        } else if (!hasChanges && isCurrentlyUnsaved) {
          // Remove from unsaved (reverted to original)
          const newSet = new Set(prevSet);
          newSet.delete(attendanceId);
          return newSet;
        }

        return prevSet; // No change needed
      });
    },
    [attendanceGenerate, originalData, isSubmitted]
  );

  // Save all changed records with Set
  const handleSaveAllChanges = useCallback(async () => {
    if (!attendanceGenerate || unsavedChanges.size === 0) return;

    if (isSubmitted) {
      toast.error("Cannot modify attendance after submission");
      return;
    }

    setIsSavingAll(true);
    try {
      // Find all rows with unsaved changes using Set
      const changedAttendances = attendanceGenerate.attendances.filter(
        (attendance) => unsavedChanges.has(attendance.id)
      );

      // Perform bulk update
      await Promise.all(
        changedAttendances.map((attendance) =>
          updateAttendanceSessionService({
            id: attendance.id,
            status: attendance.status,
            attendanceType: attendance.attendanceType,
            comment: attendance.comment || "",
          })
        )
      );

      // Update original data with saved values
      const newOriginalData = new Map(originalData);
      changedAttendances.forEach((attendance) => {
        newOriginalData.set(attendance.id, {
          status: attendance.status,
          attendanceType: attendance.attendanceType,
          comment: attendance.comment || "",
        });
      });
      setOriginalData(newOriginalData);

      // Clear unsaved changes - create new empty Set
      setUnsavedChanges(new Set());
      setLastUpdated(new Date());

      toast.success(
        `Successfully updated ${changedAttendances.length} attendance records`,
        { duration: 2000 }
      );
    } catch (error) {
      toast.error("Failed to save attendance records");
    } finally {
      setIsSavingAll(false);
    }
  }, [attendanceGenerate, unsavedChanges, originalData, isSubmitted]);

  // Submit attendance to staff
  const handleSubmitToStaff = useCallback(async () => {
    if (!attendanceGenerate) return;

    if (unsavedChanges.size > 0) {
      toast.error("Please save all changes before submitting");
      return;
    }

    setIsSubmittingToStaff(true);
    try {
      const response = await submitAttendanceSessionService(
        attendanceGenerate?.id
      );
      setIsSubmitted(true);
      setSubmissionTime(new Date());

      // Disable auto-refresh after submission
      setAutoRefresh(false);

      toast.success("Attendance successfully submitted to staff!", {
        duration: 3000,
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error) {
      toast.error("Failed to submit attendance to staff");
    } finally {
      setIsSubmittingToStaff(false);
    }
  }, [attendanceGenerate, unsavedChanges.size, scheduleDetail?.id]);

  // Reset changes with Set
  const handleResetChanges = useCallback(() => {
    if (isSubmitted) {
      toast.error("Cannot reset attendance after submission");
      return;
    }
    // Clear unsaved changes
    setUnsavedChanges(new Set());
    // Reload original data
    HandleInitAttendance(true);
  }, [HandleInitAttendance, isSubmitted]);

  // Remove specific item from unsaved changes
  const handleRemoveFromUnsaved = useCallback((attendanceId: number) => {
    setUnsavedChanges((prevSet) => {
      if (!prevSet.has(attendanceId)) {
        return prevSet; // No change needed
      }
      const newSet = new Set(prevSet);
      newSet.delete(attendanceId);
      return newSet;
    });
  }, []);

  // Toggle auto-refresh with smooth animation
  const handleToggleAutoRefresh = useCallback(() => {
    if (isSubmitted) {
      toast.error("Auto-refresh is disabled after submission");
      return;
    }

    setAutoRefresh((prev) => {
      const newValue = !prev;
      toast.success(`Auto-refresh ${newValue ? "enabled" : "disabled"}`, {
        duration: 1500,
      });
      return newValue;
    });
  }, [isSubmitted]);

  // Initial load
  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Memoized filtered data
  const filteredAttendances = useMemo(() => {
    if (!attendanceGenerate?.attendances) return [];

    return attendanceGenerate.attendances.filter((attendance) => {
      const matchesSearch =
        !searchQuery ||
        attendance.studentName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        attendance.identifyNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || attendance.status === statusFilter;
      const matchesType =
        typeFilter === "all" || attendance.attendanceType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [attendanceGenerate?.attendances, searchQuery, statusFilter, typeFilter]);

  // Enhanced statistics
  const stats = useMemo(() => {
    if (!filteredAttendances.length)
      return { total: 0, present: 0, absent: 0, late: 0 };

    const total = filteredAttendances.length;
    const present = filteredAttendances.filter(
      (a) => a.status === "PRESENT"
    ).length;
    const absent = filteredAttendances.filter(
      (a) => a.status === "ABSENT"
    ).length;
    const late = filteredAttendances.filter(
      (a) => a.attendanceType === "LATE"
    ).length;

    return { total, present, absent, late };
  }, [filteredAttendances]);

  return (
    <div className="space-y-4">
      <AttendanceCheckHeader
        autoRefresh={autoRefresh}
        isSubmitted={isSubmitted}
        lastUpdated={lastUpdated}
        refreshProgress={refreshProgress}
        scheduleDetail={scheduleDetail}
        submissionTime={submissionTime}
        unsavedChanges={unsavedChanges}
      />

      {!isInitialized ? (
        <Card className="flex justify-center">
          <CardContent className="p-4">
            <Button
              variant="outline"
              onClick={() => HandleInitAttendance()}
              disabled={isRefreshing}
            >
              <Plus />
              {isRefreshing ? "Initializing..." : "Initialize Attendance"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* QR Code Section */}
          {attendanceGenerate && !isSubmitted && (
            <QRCodeSection sessionId={attendanceGenerate?.id} />
          )}

          {/* Student List */}
          {attendanceGenerate && (
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left Title Section */}
                <div className="flex items-center gap-4">
                  <CardTitle className="text-base font-medium">
                    Attendance - Student List
                  </CardTitle>
                </div>

                {/* Right Button Actions Section */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:justify-end">
                  {/* Auto-refresh Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleAutoRefresh}
                    disabled={isSubmitted}
                    className={`transition-all duration-200 hover:scale-105 ${
                      autoRefresh
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : ""
                    } ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={`Click to ${
                      autoRefresh ? "disable" : "enable"
                    } auto-refresh`}
                  >
                    <RefreshCcw
                      className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                        autoRefresh && !isSubmitted ? "animate-pulse" : ""
                      }`}
                    />
                    Auto {autoRefresh ? "ON" : "OFF"}
                  </Button>

                  {/* Manual Refresh Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => HandleInitAttendance(true)}
                    disabled={loading || isRefreshing}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                        loading || isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>

                  {/* Submit to Staff Button */}
                  {!isSubmitted && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmitToStaff}
                      disabled={isSubmittingToStaff || unsavedChanges.size > 0}
                      className="bg-teal-800 hover:bg-green-900 text-white transition-all duration-200 hover:scale-105"
                    >
                      {isSubmittingToStaff ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Submit to Staff
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Submission Status Banner */}
              {isSubmitted && (
                <div className="px-6 pb-4">
                  <div className="flex justify-between items-center bg-green-50 border-green-200 border p-3 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Attendance Successfully Submitted
                      </span>
                      {submissionTime && (
                        <span className="text-xs text-green-600">
                          on {submissionTime.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-600 text-white"
                    >
                      Read-Only Mode
                    </Badge>
                  </div>
                </div>
              )}

              <div className="px-6">
                <Separator className="mb-4" />

                {/* Filters and Search */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search
                        className={`h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-all duration-300`}
                      />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-10 max-w-xl transition-all duration-300 ${
                          searchQuery
                            ? "border-blue-300 ring-1 ring-blue-200 shadow-sm"
                            : ""
                        }`}
                        disabled={isSubmitted}
                      />
                      {searchQuery && (
                        <Button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] transition-all duration-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {attendanceStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px] transition-all duration-200">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {attendanceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
                    <div className="text-xs text-muted-foreground">
                      Total Students
                    </div>
                    <div className="text-lg font-semibold">{stats.total}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
                    <div className="text-xs text-green-600">Present</div>
                    <div className="text-lg font-semibold text-green-700">
                      {stats.present}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
                    <div className="text-xs text-red-600">Absent</div>
                    <div className="text-lg font-semibold text-red-700">
                      {stats.absent}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
                    <div className="text-xs text-orange-600">Late</div>
                    <div className="text-lg font-semibold text-orange-700">
                      {stats.late}
                    </div>
                  </div>
                </div>
              </div>

              <CardContent>
                <div className="overflow-x-auto relative" ref={tableRef}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Student IdentifyNumber</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>attendanceScore</TableHead>
                        <TableHead>maxAttendanceScore</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y">
                      {filteredAttendances.map((student, index) => (
                        <TableRow
                          key={student.id}
                          className={`
                        ${unsavedChanges.has(student.id) ? "bg-yellow-50" : ""} 
                        ${isSubmitted ? "opacity-80" : ""}
                        transition-all duration-200
                      `}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {student.studentName || "- - -"}
                              {unsavedChanges.has(student.id) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs animate-pulse"
                                >
                                  Unsaved
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{student.identifyNumber}</TableCell>
                          <TableCell className="py-2 px-3">
                            <Select
                              value={student.status}
                              onValueChange={(value) =>
                                handleFieldChange(student.id, "status", value)
                              }
                              disabled={isSubmitted}
                            >
                              <SelectTrigger
                                className={`h-8 w-full border ${getStatusColor(
                                  student.status
                                )} ${isSubmitted ? "cursor-not-allowed" : ""}`}
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {attendanceStatusOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <Select
                              value={student.attendanceType}
                              onValueChange={(value) =>
                                handleFieldChange(
                                  student.id,
                                  "attendanceType",
                                  value
                                )
                              }
                              disabled={isSubmitted}
                            >
                              <SelectTrigger
                                className={`h-8 w-full border ${
                                  isSubmitted ? "cursor-not-allowed" : ""
                                }`}
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {attendanceTypeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            {student.recordedTime || "--"}
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            {student.attendanceScore || "--"}
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            {student.maxAttendanceScore || "--"}
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <Input
                              placeholder="Add Comment"
                              className={`h-8 text-sm w-full transition-all duration-100 ease-in-out ${
                                unsavedChanges.has(student.id)
                                  ? "border-yellow-300 ring-1 ring-yellow-200"
                                  : ""
                              } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                              value={student.comment || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  student.id,
                                  "comment",
                                  e.target.value
                                )
                              }
                              disabled={isSubmitted}
                            />
                          </TableCell>
                          <TableCell>
                            {isSubmitted ? (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Submitted
                              </Badge>
                            ) : unsavedChanges.has(student.id) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveFromUnsaved(student.id)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Saved
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* No Results Message */}
                  {filteredAttendances.length === 0 &&
                    attendanceGenerate?.attendances?.length > 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No students found</p>
                        <p className="text-sm mt-1">
                          Try adjusting your search criteria or filters
                        </p>
                      </div>
                    )}

                  {/* Empty State when no attendance data */}
                  {(!attendanceGenerate?.attendances ||
                    attendanceGenerate.attendances.length === 0) &&
                    isInitialized && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">
                          No students enrolled
                        </p>
                        <p className="text-sm mt-1">
                          This class doesn't have any enrolled students yet
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Panel - Only show when not submitted */}
          {attendanceGenerate && unsavedChanges.size > 0 && !isSubmitted && (
            <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-yellow-300 bg-yellow-50 z-50 animate-in slide-in-from-bottom-4 duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="animate-pulse">
                      {unsavedChanges.size}
                    </Badge>
                    <span className="text-sm font-medium">Pending Changes</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUnsavedChanges(new Set())}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetChanges}
                    className="flex-1 hover:bg-red-100 text-red-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAllChanges}
                    disabled={isSavingAll}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSavingAll ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    Save All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning for unsaved changes before submit */}
          {attendanceGenerate && unsavedChanges.size > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-orange-800">
                      Save changes before submitting
                    </div>
                    <div className="text-xs text-orange-700">
                      You have {unsavedChanges.size} unsaved changes. Please
                      save all changes before submitting attendance to staff.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceCheckPage;
