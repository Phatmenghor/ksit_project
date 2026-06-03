"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { CircleAlert, FileText } from "lucide-react";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import StudentDetails from "@/components/dashboard/users/student/view/tab/student-detail-tab";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { getStudentByTokenService } from "@/service/user/user.service";
import { TranscriptTabs } from "@/components/dashboard/users/student/view/tab/student-transcript-tab";
import { StudentProfileSection } from "@/components/dashboard/users/student/view/student-profile";

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
  const [activeTab, setActiveTab] = useState("information");
  const [isLoading, setIsLoading] = useState(false);
  const [studentDetail, setStudentDetail] = useState<StudentByIdModel | null>(
    null
  );
  const { type, id } = useParams<{ type: string; id: string }>();

  const loadInfo = async () => {
    setIsLoading(true);
    try {
      const response = await getStudentByTokenService();
      if (response) {
        setStudentDetail(response);
      } else {
        toast.error("Error getting student data");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full space-y-4"
    >
      <CardHeaderSection
        title="My Profile"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "View Student", href: "" },
        ]}
        tabs={
          <div className="container mx-auto mt-3">
            <TabsList className="flex w-full border-b gap-6 pb-1 bg-transparent justify-start">
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
                    className={`absolute rounded-lg -bottom-1 left-0 w-full h-1 transition-all duration-200 ${
                      activeTab === value ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        }
      />

      {/* Tab Content */}
      <TabsContent value="information" className="space-y-4 w-full">
        <StudentProfileSection param={studentDetail} /> {/* ✅ moved here */}
        <StudentDetails studentDetail={studentDetail} />
      </TabsContent>

      <TabsContent value="transcript" className="space-y-4 w-full">
        <TranscriptTabs studentId={studentDetail?.id} />
      </TabsContent>
    </Tabs>
  );
}
