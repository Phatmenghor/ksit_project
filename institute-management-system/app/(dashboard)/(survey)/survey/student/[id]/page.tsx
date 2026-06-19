"use client";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import React, { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { surveyStudentColumns } from "./columns";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchStudentSurveyThunk } from "@/features/survey/store/thunks/survey-thunks";
import { selectStudentProgress, selectSurveyIsLoading } from "@/features/survey/store/selectors/survey-selectors";

const AllStduentView = () => {
  const params = useParams();
  const rawId = params?.id;
  const id = rawId && !isNaN(Number(rawId)) ? Number(rawId) : null;
  const dispatch = useAppDispatch();
  const studentData = useAppSelector(selectStudentProgress);
  const isLoading = useAppSelector(selectSurveyIsLoading);

  // Fetch student data from server
  const loadStudents = useCallback(async () => {
    try {
      if (!id) {
        toast.error("Invalid schedule ID");
        return;
      }
      await dispatch(fetchStudentSurveyThunk({ scheduleId: id })).unwrap();
    } catch (error) {
      toast.error("An error occurred while loading student");
    }
  }, [id, dispatch]);

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
