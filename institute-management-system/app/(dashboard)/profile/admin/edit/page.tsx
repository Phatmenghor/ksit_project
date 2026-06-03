"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getStaffByTokenService,
  updateStaffService,
} from "@/service/user/user.service";
import { AdminFormData } from "@/model/user/staff/staff.schema";
import { cleanField, cleanRequiredField } from "@/utils/map-helper/student";
import AdminForm from "@/components/dashboard/users/admin/admin-profile-form";
import Loading from "@/components/shared/loading";
import { ROUTE } from "@/constants/routes";

export default function EditAdminProfilePage() {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<AdminFormData | null>(
    null
  );
  const [staffId, setStaffId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStaffByTokenService();

        setStaffId(response.id);

        const payload: AdminFormData = {
          id: response?.id ?? 0,
          username: response?.username ?? "",
          email: response?.email ?? "",
          first_name: response?.englishFirstName ?? "",
          last_name: response?.englishLastName ?? "",
          status: response?.status ?? "",
          profileUrl: response.profileUrl ?? "",
          roles: response?.roles ?? [],
          selectedStaff: response,
        };

        setInitialValues(payload);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: AdminFormData) => {
    if (staffId == null) {
      toast.error("ID is missing");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        username: cleanRequiredField(data.username),
        email: cleanField(data.email),
        khmerFirstName: cleanField(data.first_name),
        khmerLastName: cleanField(data.last_name),
        englishFirstName: cleanField(data.first_name),
        englishLastName: cleanField(data.last_name),
        profileUrl: data.profileUrl,
      };

      await updateStaffService(staffId, payload);

      const usernameChanged = initialValues?.username !== data.username;

      toast.success("Profile updated successfully", {
        description: usernameChanged
          ? "Your username has been changed — log in with the new one."
          : undefined,
        duration: 4000,
      });

      // Redirect to login only if username changed
      if (usernameChanged) {
        setTimeout(() => {
          router.replace(ROUTE.AUTH.LOGIN);
        }, 4000);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!initialValues) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto">
      <AdminForm
        initialData={initialValues}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        isSubmitting={loading}
      />
    </div>
  );
}
