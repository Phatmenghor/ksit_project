"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { CircleAlert, FileText } from "lucide-react";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import StudentDetails from "@/components/dashboard/users/student/view/tab/student-detail-tab";
import { TranscriptTabs } from "@/components/dashboard/users/student/view/tab/student-transcript-tab";
import { StudentProfileSection } from "@/components/dashboard/users/student/view/student-profile";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchStudentByIdThunk } from "@/features/students/store/thunks/student-thunks";
import {
  selectSelectedStudent,
  selectStudentOperations,
} from "@/features/students/store/selectors/student-selectors";

const tabs = [
  {
    value: "information",
    label: "Student Information",
    icon: CircleAlert,
  },
  {
    value: "transcript",
    label: "Transcript",
    icon: FileText,
  },
];

export default function StudentViewPage() {
  const dispatch = useAppDispatch();
  const studentDetail = useAppSelector(selectSelectedStudent);
  const operations = useAppSelector(selectStudentOperations);

  const [activeTab, setActiveTab] = useState("information");
  const { type, id } = useParams<{ type: string; id: string }>();

  const loadInfo = async () => {
    try {
      await dispatch(fetchStudentByIdThunk(id)).unwrap();
    } catch (error) {
      toast.error("Error getting student data");
    }
  };

  useEffect(() => {
    // If `type` is one of the valid tabs, use it
    if (["student", "payment", "transcript"].includes(type)) {
      if (type === "student") {
        setActiveTab("information");
      } else {
        setActiveTab(type);
      }
    }
  }, [type]);

  useEffect(() => {
    loadInfo();
  }, [id]);

  if (operations.isFetchingDetail) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!studentDetail) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full space-y-4"
    >
      {/* Header with TabsList injected via prop */}
      <CardHeaderSection
        title="Student View Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "View Student", href: ROUTE.STUDENTS.VIEW(id) },
        ]}
        tabs={
          <div className="mt-3 overflow-x-auto">
            <TabsList className="flex w-max min-w-full border-b gap-4 pb-1 bg-transparent justify-start">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`relative pb-2 text-sm font-medium transition-colors duration-200 px-1 hover:text-primary data-[state=active]:text-primary`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-200 ${
                      activeTab === value ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        }
      />

      {/* Tab Content outside the header */}
      <StudentProfileSection param={studentDetail} />
      <TabsContent value="information" className="space-y-4 w-full">
        <StudentDetails studentDetail={studentDetail} />
      </TabsContent>
      <TabsContent value="transcript" className="space-y-4 w-full">
        <TranscriptTabs studentId={studentDetail?.id} />
      </TabsContent>
    </Tabs>
  );
}
