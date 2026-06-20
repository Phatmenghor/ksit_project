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
import { Loader2, X, AlertCircle } from "lucide-react";
import { RoleEnum } from "@/constants/constant";

interface UserRoleManagementProps {
  users: AllStaffModel | null;
  userRoles: UserPermissionModel[];
  setUserRoles: Dispatch<SetStateAction<UserPermissionModel[]>>;
  selectedUsers: StaffModel[];
  onAddUser: (user: StaffModel) => void;
  onRemoveUser: (userId: number) => void;
  onClearUsers?: () => void;
  onApplyRoles: (selectedRoles: string[]) => Promise<void>;
}

const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  users,
  onAddUser,
  onRemoveUser,
  onClearUsers,
  onApplyRoles,
  selectedUsers,
  userRoles,
  setUserRoles,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const filteredUserRoles = userRoles.filter(
    (role) => role.role === RoleEnum.STAFF || role.role === RoleEnum.TEACHER
  );

  const handleRoleChange = (role: string, checked: boolean) => {
    setUserRoles((prev) =>
      prev.map((r) => (r.role === role ? { ...r, hasRole: checked } : r))
    );
  };

  const handleApplyRoles = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user first");
      return;
    }

    setIsApplying(true);
    try {
      const selectedRoles = userRoles
        .filter((role) => role.hasRole)
        .map((role) => role.role);

      await onApplyRoles(selectedRoles);
    } catch (error) {
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-medium text-gray-900">Select Users</h3>
            <span className="text-red-500">*</span>
          </div>
          {selectedUsers.length > 0 && onClearUsers && (
            <button
              type="button"
              onClick={onClearUsers}
              className="text-xs text-red-600 hover:text-red-800 hover:underline font-semibold transition-colors"
            >
              Clear All ({selectedUsers.length})
            </button>
          )}
        </div>
        <ComboboxSelectUser
          dataSelect={null}
          onChangeSelected={onAddUser}
        />
        
        {selectedUsers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-150 rounded-lg max-h-[148px] overflow-y-auto">
            {selectedUsers.map((user) => {
              const fullName = user.englishFirstName && user.englishLastName
                ? `${user.englishFirstName} ${user.englishLastName}`
                : (user.khmerFirstName && user.khmerLastName
                  ? `${user.khmerLastName} ${user.khmerFirstName}`
                  : user.username);
              const displayName = user.identifyNumber ? `${fullName} (${user.identifyNumber})` : fullName;
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-1 bg-[#024D3E]/10 text-[#024D3E] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#024D3E]/20 hover:bg-[#024D3E]/15 transition-colors"
                >
                  <span className="max-w-[200px] truncate">{displayName}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveUser(user.id)}
                    className="text-[#024D3E] hover:bg-[#024D3E]/25 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedUsers.length > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-amber-900">Batch Role Assignment</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Assigning roles now will update all {selectedUsers.length} selected users.
            </p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-1 mb-4">
          <h3 className="text-sm font-medium text-gray-900">Apply user role</h3>
          <span className="text-red-500">*</span>
        </div>

        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Loading user roles...
          </div>
        ) : (
          <div className="space-y-2 bg-gray-50 border rounded-lg p-4">
            {filteredUserRoles.map((role, index) => (
              <div key={role.role} className="flex items-center gap-2 py-1">
                <div className="w-6 text-right text-sm text-gray-500">{index + 1}.</div>
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

      <div className="pt-2 text-right">
        <Button
          className="bg-teal-900 hover:bg-teal-950 px-6"
          onClick={handleApplyRoles}
          disabled={selectedUsers.length === 0 || isApplying || isLoading}
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
