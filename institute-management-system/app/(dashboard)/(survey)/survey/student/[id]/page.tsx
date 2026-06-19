"use client";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import React, { useCallback, useEffect, useState } from "react";
import { StudentSurveyModel } from "@/model/survey/student-survey-model";
import { getAllStudentSurveyService } from "@/service/survey/history-survey.service";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { surveyStudentColumns } from "./columns";

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
        columns={surveyStudentColumns}
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
