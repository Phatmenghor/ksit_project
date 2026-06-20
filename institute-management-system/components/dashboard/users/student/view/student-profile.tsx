"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { getInitials } from "@/lib/utils";
import { FileText, FileType2, Loader2 } from "lucide-react";
import { getDetailRequestTranscriptService } from "@/service/request/request.service";
import { TranscriptModel } from "@/model/request/request-transcript";
import { useStudentExport } from "@/hooks/use-student-export";

interface ProfileProps {
  param?: StudentByIdModel | null;
  className?: string;
}

const formatStudentStatus = (status?: string | null): { label: string; variant: string } => {
  if (!status) return { label: "N/A", variant: "secondary" };
  const statusMap: Record<string, { label: string; variant: string }> = {
    ACTIVE: { label: "Active", variant: "success" },
    INACTIVE: { label: "Inactive", variant: "secondary" },
    ENROLLED: { label: "Enrolled", variant: "success" },
    GRADUATED: { label: "Graduated", variant: "primary" },
    SUSPENDED: { label: "Suspended", variant: "destructive" },
    PENDING: { label: "Pending", variant: "warning" },
    DROPPED: { label: "Dropped", variant: "secondary" },
    ON_LEAVE: { label: "On Leave", variant: "warning" },
    TRANSFER: { label: "Transfer", variant: "secondary" },
  };
  const statusInfo = statusMap[status.toUpperCase()];
  if (statusInfo) return statusInfo;
  const formattedStatus = status.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { label: formattedStatus, variant: "secondary" };
};

const getBadgeClasses = (variant: string): string => {
  const variantClasses: Record<string, string> = {
    success: "bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 shadow-sm",
    primary: "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 shadow-sm",
    warning: "bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm",
    destructive: "bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 shadow-sm",
    secondary: "bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-sm",
  };
  return variantClasses[variant] || variantClasses["secondary"];
};

export const StudentProfileSection: React.FC<ProfileProps> = ({ param, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptModel | null>(null);

  const fetchTranscriptData = useCallback(async () => {
    if (!param?.id || param.id <= 0) return;
    setIsLoading(true);
    try {
      const response = await getDetailRequestTranscriptService(param.id);
      setTranscriptData(response ?? null);
    } catch {
      setTranscriptData(null);
    } finally {
      setIsLoading(false);
    }
  }, [param?.id]);

  useEffect(() => {
    fetchTranscriptData();
  }, [fetchTranscriptData]);

  const { exportTranscriptAsWord, exportTranscriptAsPDF, isExporting, exportType, canExport } = useStudentExport({
    transcriptData,
    studentDetail: param || undefined,
  });

  const profileUrl = param?.profileUrl
    ? param.profileUrl.startsWith("http")
      ? param.profileUrl
      : `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${param.profileUrl}`
    : undefined;

  const statusInfo = formatStudentStatus(param?.studentStatus);

  return (
    <Card className="border shadow-md rounded-2xl">
      <CardContent className="flex flex-col items-center justify-center py-5 px-6">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-4 ring-blue-50 shadow-md">
            <AvatarImage src={profileUrl || "/assets/profile.png"} alt={param?.username || "User"} />
            <AvatarFallback suppressHydrationWarning>
              {getInitials(param?.username)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-3 text-center space-y-1">
          <h3 className="font-semibold text-lg text-gray-800">{param?.username || "Unknown User"}</h3>
          <p className="text-xs text-gray-500">Student Profile Overview</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center mt-2">
          <Badge className="px-3 py-1 rounded-full shadow-sm bg-blue-50 hover:bg-blue-50 text-blue-800 border border-blue-200">
            ID: {param?.identifyNumber ?? "N/A"}
          </Badge>
          <Badge className={`px-3 py-1 rounded-full shadow-sm ${getBadgeClasses(statusInfo.variant)}`}>
            {statusInfo.label}
          </Badge>
        </div>

        <div className="pt-3 flex flex-col gap-2 w-full items-center">
          <Button
            disabled={!canExport || isExporting}
            onClick={() => exportTranscriptAsWord()}
            className="flex items-center gap-2 rounded-full px-4 shadow-md w-full justify-center"
          >
            {isExporting && exportType === "word" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileType2 className="h-4 w-4" />
                Export Word
              </>
            )}
          </Button>
          <Button
            variant="outline"
            disabled={!canExport || isExporting}
            onClick={() => exportTranscriptAsPDF()}
            className="flex items-center gap-2 rounded-full px-4 shadow-md w-full justify-center"
          >
            {isExporting && exportType === "pdf" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>

        {isLoading && (
          <p className="text-xs text-muted-foreground mt-2">Loading transcript data...</p>
        )}
      </CardContent>
    </Card>
  );
};
