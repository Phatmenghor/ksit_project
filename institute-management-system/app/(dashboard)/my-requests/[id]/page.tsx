"use client";

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import {
  X,
  Check,
  ChevronLeft,
  Info,
  FileText,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchRequestByIdThunk } from "@/features/requests/store/thunks/request-thunks";
import { selectSelectedRequest, selectRequestIsFetchingDetail } from "@/features/requests/store/selectors/request-selectors";

export default function MyRequestDetail() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const requestData = useAppSelector(selectSelectedRequest);
  const isRequestLoading = useAppSelector(selectRequestIsFetchingDetail);

  const params = useParams();
  const requestId = params.id as string;

  const loadRequest = useCallback(async () => {
    try {
      await dispatch(fetchRequestByIdThunk(requestId)).unwrap();
    } catch {
      toast.error("Failed to load request details");
    }
  }, [requestId, dispatch]);

  useEffect(() => {
    loadRequest();
  }, [requestId, loadRequest]);

  function getStatusDisplayName(status: string = "") {
    switch (status.toUpperCase()) {
      case "PENDING": return "Pending";
      case "ACCEPTED": return "Accepted";
      case "REJECTED": return "Rejected";
      case "RETURN": return "Returned";
      case "DONE": return "Done";
      default: return status;
    }
  }

  if (isRequestLoading && !requestData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#024D3E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb
            items={[
              { label: "My Requests", href: ROUTE.MY_REQUESTS },
              { label: "View Detail" },
            ]}
          />
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-gray-100 shadow-lg bg-white">
        {/* Header */}
        <div className="bg-[#024D3E] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(ROUTE.MY_REQUESTS)}
              className="text-white hover:bg-white/10 rounded-full h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-bold">Request Detail</h1>
          </div>
          <FileText className="h-5 w-5 opacity-90" />
        </div>

        {/* Status Bar */}
        <div className="bg-[#024D3E] px-5 pb-5 pt-1 text-white">
          <hr className="border-white/20 mb-4" />
          <div className="bg-white/15 rounded-lg p-3 px-4 flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Status</span>
            <span className="text-xs font-normal px-3 py-1 bg-white/10 rounded-full border border-white/20">
              {getStatusDisplayName(requestData?.status)}
            </span>
          </div>
        </div>

        {/* Alert Status Banners */}
        {requestData?.status === "RETURN" && (
          <div className="m-6 mb-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-700">
              <Info className="h-4 w-4" /> Request Returned for Changes
            </div>
            <p className="text-amber-600 pl-5 leading-relaxed">
              {requestData?.staffComment || "No comment provided."}
            </p>
          </div>
        )}
        {requestData?.status === "REJECTED" && (
          <div className="m-6 mb-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-700">
              <X className="h-4 w-4" /> Request Rejected
            </div>
            <p className="text-red-600 pl-5 leading-relaxed">
              {requestData?.staffComment || "No comment provided."}
            </p>
          </div>
        )}
        {requestData?.status === "DONE" && (
          <div className="m-6 mb-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-green-700">
              <Check className="h-4 w-4" /> Request Completed
            </div>
            <p className="text-green-600 pl-5 leading-relaxed">
              Your request has been successfully processed.
            </p>
          </div>
        )}

        {/* Details Section */}
        <div className="p-6 space-y-1">
          {[
            {
              label: "Submit Date",
              value: requestData?.createdAt ? formatDate(requestData.createdAt) : "---",
            },
            {
              label: "Item Name",
              value: requestData?.title || "---",
            },
            {
              label: "Comments",
              value: requestData?.requestComment || "---",
            },
            {
              label: "Comment by staff",
              value: requestData?.staffComment || "N/A",
            },
            {
              label: "Staff Action",
              value: requestData?.updatedAt ? formatDate(requestData.updatedAt) : (requestData?.createdAt ? formatDate(requestData.createdAt) : "---"),
            },
          ].map((row, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <span className="text-xs font-semibold text-gray-500 w-32 shrink-0">
                {row.label}
              </span>
              <span className="text-xs text-gray-800 text-right font-medium max-w-[280px] break-words">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
