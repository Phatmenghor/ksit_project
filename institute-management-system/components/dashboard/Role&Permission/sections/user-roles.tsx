"use client";
import React, { useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPermissionModel } from "@/model/permission/permission-response-model";
import { toast } from "sonner";
import {
  AllStaffModel,
  StaffModel,
} from "@/model/user/staff/staff.respond.model";
import { ComboboxSelectUser } from "@/components/shared/ComboBox/combobox-user";
import { Loader2 } from "lucide-react";

interface UserRoleManagementProps {
  users: AllStaffModel | null;
  userRoles: UserPermissionModel[];
  setUserRoles: Dispatch<SetStateAction<UserPermissionModel[]>>;
  selectedUser: StaffModel | null;
  setSelectedUser: Dispatch<SetStateAction<StaffModel | null>>;
  onApplyRoles: (selectedRoles: string[]) => Promise<void>;
}
const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  users,
  setSelectedUser,
  onApplyRoles,
  selectedUser,
  userRoles,
  setUserRoles,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleRoleChange = (role: string, checked: boolean) => {
    console.log("Role change:", role, checked); // Debug log
    setUserRoles((prev) =>
      prev.map((r) => (r.role === role ? { ...r, hasRole: checked } : r))
    );
  };

  const handleApplyRoles = async () => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

    setIsApplying(true);
    try {
      const selectedRoles = userRoles
        .filter((role) => role.hasRole)
        .map((role) => role.role);

      console.log("Applying roles:", selectedRoles); // Debug log
      await onApplyRoles(selectedRoles);
    } catch (error) {
      console.error("Error applying roles:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleUserSelect = (user: StaffModel) => {
    console.log("Selected user:", user); // Debug log
    setSelectedUser(user || null);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-1 mb-4">
          <h3 className="text-sm font-medium text-gray-900">User</h3>
          <span className="text-red-500">*</span>
        </div>
        <ComboboxSelectUser
          dataSelect={selectedUser}
          onChangeSelected={handleUserSelect}
        />
      </div>

      <div>
        <div className="flex items-center gap-1 mb-4">
          <h3 className="text-sm font-medium text-gray-900">Apply user role</h3>
          <span className="text-red-500">*</span>
        </div>

        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Loading user roles...
          </div>
        ) : !selectedUser ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Please select a user to view roles
          </div>
        ) : (
          <div className="space-y-2">
            {userRoles.map((role, index) => (
              <div key={role.role} className="flex items-center gap-2">
                <div className="w-6 text-right">{index + 1}.</div>
                <Checkbox
                  id={`${role.role.toLowerCase()}-role`}
                  checked={role.hasRole}
                  disabled={isLoading || isApplying}
                  onCheckedChange={(checked) =>
                    handleRoleChange(role.role, checked as boolean)
                  }
                />
                <label
                  htmlFor={`${role.role.toLowerCase()}-role`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                    isLoading || isApplying ? "opacity-50" : ""
                  }`}
                >
                  {role.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 text-right">
        <Button
          className="bg-teal-900 hover:bg-teal-950"
          onClick={handleApplyRoles}
          disabled={!selectedUser || isApplying || isLoading}
        >
          {isApplying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              APPLYING...
            </>
          ) : (
            "APPLY"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UserRoleManagement;
