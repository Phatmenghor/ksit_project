"use client";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import React, { useCallback, useEffect, useState } from "react";
import { StudentSurveyModel } from "@/model/survey/student-survey-model";
import { getAllStudentSurveyService } from "@/service/survey/history-survey.service";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { DataTable, TableColumn } from "@/components/shared/data-table";

type Student = NonNullable<StudentSurveyModel["students"]>[number];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return {
        text: "Completed",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      };
    case "NOT_STARTED":
      return {
        text: "Not Started",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      };
    case "NONE":
    default:
      return {
        text: "Pending",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
      };
  }
};

const columns: TableColumn<Student>[] = [
  { key: "no", label: "#", render: (_, i) => i + 1 },
  { key: "username", label: "Username", render: (item) => item.username || "---" },
  {
    key: "khmerName",
    label: "Fullname (KH)",
    render: (item) =>
      `${item.khmerFirstName || ""} ${item.khmerLastName || ""}`.trim() || "---",
  },
  {
    key: "englishName",
    label: "Fullname (EN)",
    render: (item) =>
      `${item.englishFirstName || ""} ${item.englishLastName || ""}`.trim() || "---",
  },
  { key: "gender", label: "Gender", render: (item) => item.gender || "---" },
  { key: "dateOfBirth", label: "Date Of Birth", render: (item) => item.dateOfBirth || "---" },
  {
    key: "classCode",
    label: "Class code",
    render: (item) => item.studentClass?.code || "---",
  },
  {
    key: "surveyStatus",
    label: "Status",
    render: (item) => {
      const config = getStatusConfig(item.surveyStatus);
      return (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
        >
          {config.text}
        </span>
      );
    },
  },
];

const AllStduentView = () => {
  const params = useParams();
  const rawId = params?.id;
  const id = rawId && !isNaN(Number(rawId)) ? Number(rawId) : null;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentData, setStudentData] = useState<StudentSurveyModel | null>(
    null
  );

  // Fetch student data from server
  const loadStudents = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!id) {
        toast.error("Invalid schedule ID");
        return;
      }
      const response = await getAllStudentSurveyService({
        scheduleId: id,
      });

      if (response) {
        setStudentData(response);
      } else {
      }
    } catch (error) {
      toast.error("An error occurred while loading student");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents, id]);

  return (
    <div className="space-y-4">
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "All Student", href: ROUTE.SURVEY.STUDENT },
        ]}
        buttonHref={ROUTE.SURVEY.STUDENT}
        title="All Student"
        back
      />

      <DataTable
        data={studentData?.students ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={1}
        totalPages={0}
        onPageChange={() => {}}
        showPagination={false}
        emptyMessage="No student found"
        getRowKey={(item) => item.id}
      />
    </div>
  );
};

export default AllStduentView;
