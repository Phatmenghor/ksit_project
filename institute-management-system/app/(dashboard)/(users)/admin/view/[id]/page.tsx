"use client";
import AdminPersonal from "@/components/dashboard/users/admin/admin-personal-info";
import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { getStaffByIdService } from "@/service/user/user.service";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

export default function AdminDetailPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [admin, setAdmin] = React.useState<StaffRespondModel | null>(null);
  const params = useParams();
  const adminId = params.id as string;

  const loadAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await getStaffByIdService(adminId);
      if (response) {
        setAdmin(response);
      } else {
        toast.error("Error getting admin data");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [adminId]);

  return (
    <div>
      <CardHeaderSection
        title="Admin View Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "View Admin", href: ROUTE.USERS.ADMIN.ADMIN_VIEW(adminId) },
        ]}
      />
      <div className="mt-4 space-y-4">
        <UserProfileSection user={admin} />
        <AdminPersonal admin={admin} />
      </div>
    </div>
  );
}
