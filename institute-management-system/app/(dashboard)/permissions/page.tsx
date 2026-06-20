"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MenuModel } from "@/model/menu/menu-respond";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPermissionRequest } from "@/model/permission/permission-request-model";
import { UserPermissionModel } from "@/model/permission/permission-response-model";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import MenuPermissionItem from "@/components/dashboard/Role&Permission/sections/MenuPermissionItemProps";
import UserRoleManagement from "@/components/dashboard/Role&Permission/sections/user-roles";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/shared/loading";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectPermissionMenuData,
  selectPermissionUserRoles,
  selectPermissionIsLoadingMenu,
  selectPermissionIsLoadingRoles,
  selectPermissionIsUpdatingRoles,
  selectPermissionIsUpdatingPermissions,
} from "@/features/permissions/store/selectors/permission-selectors";
import {
  fetchUserMenuThunk,
  fetchUserRolesThunk,
  updateUserRolesThunk,
  updateUserPermissionsThunk,
} from "@/features/permissions/store/thunks/permission-thunks";
import { clearPermissionData } from "@/features/permissions/store/slice/permission-slice";
import { fetchStaffComboboxService } from "@/features/users/store/thunks/staff-thunks";
import { RoleEnum, StatusEnum } from "@/constants/constant";

export default function Permissions() {
  const dispatch = useAppDispatch();
  const menuData = useAppSelector(selectPermissionMenuData);
  const userRoles = useAppSelector(selectPermissionUserRoles);
  const isMenuLoading = useAppSelector(selectPermissionIsLoadingMenu);
  const isUserLoading = useAppSelector(selectPermissionIsLoadingRoles);
  const isUpdatingRoles = useAppSelector(selectPermissionIsUpdatingRoles);
  const isSubmitting = useAppSelector(selectPermissionIsUpdatingPermissions);

  const [selectedUsers, setSelectedUsers] = useState<StaffModel[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [editableRoles, setEditableRoles] = useState<UserPermissionModel[]>([
    { role: "STAFF", name: "Staff", hasRole: false },
    { role: "TEACHER", name: "Teacher", hasRole: true },
  ]);

  useEffect(() => {
    const initialPermissions = new Set<number>();
    const addViewableMenus = (menus: MenuModel[]) => {
      menus.forEach((menu) => {
        const isRequestsMenu =
          menu.title?.toLowerCase() === "requests" ||
          menu.title?.toLowerCase() === "my requests" ||
          menu.route === "/requests" ||
          menu.route === "/my-requests" ||
          menu.route === ROUTE.REQUESTS ||
          menu.route === ROUTE.MY_REQUESTS;

        if (menu.canView || isRequestsMenu) {
          initialPermissions.add(menu.id);
        }
        if (menu.children?.length) addViewableMenus(menu.children);
      });
    };
    addViewableMenus(menuData);
    setSelectedPermissions(initialPermissions);
  }, [menuData]);

  useEffect(() => {
    const loadDefaultUsers = async () => {
      try {
        const res = await dispatch(
          fetchStaffComboboxService({
            pageNo: 1,
            pageSize: 200,
            search: "",
            status: StatusEnum.ACTIVE,
            roles: [RoleEnum.STAFF, RoleEnum.DEVELOPER, RoleEnum.TEACHER],
          })
        ).unwrap();
        
        if (res && res.content) {
          const sortedUsers = [...res.content].sort((a, b) => {
            const aIsTeacher = a.roles.includes(RoleEnum.TEACHER);
            const bIsTeacher = b.roles.includes(RoleEnum.TEACHER);
            if (aIsTeacher && !bIsTeacher) return -1;
            if (!aIsTeacher && bIsTeacher) return 1;
            return 0;
          });
          
          const defaultTeacher = sortedUsers.find((user) =>
            user.roles.includes(RoleEnum.TEACHER)
          );
          const defaultRef = defaultTeacher || sortedUsers[0] || null;
          if (defaultRef) {
            dispatch(fetchUserMenuThunk(defaultRef.id));
          }
        }
      } catch (error) {
        toast.error("Failed to load default staff and teachers");
      }
    };
    
    loadDefaultUsers();
  }, [dispatch]);

  const handleAddUser = useCallback((user: StaffModel) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
  }, []);

  const handleRemoveUser = useCallback((userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const handleClearUsers = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const handlePermissionChange = useCallback((menuId: number, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(menuId);
      else newSet.delete(menuId);
      return newSet;
    });
  }, []);

  const handleApplyRoles = useCallback(async (selectedRoles: string[]) => {
    if (selectedUsers.length === 0) return;

    const getAllMenuIds = (menus: MenuModel[]): number[] => {
      const ids: number[] = [];
      menus.forEach((menu) => {
        ids.push(menu.id);
        if (menu.children?.length) ids.push(...getAllMenuIds(menu.children));
      });
      return ids;
    };

    const allMenuIds = getAllMenuIds(menuData);
    const menuPermissions = allMenuIds.map((menuId) => ({
      menuId,
      canView: selectedPermissions.has(menuId),
    }));

    const requestData: UserPermissionRequest = { menuPermissions };

    try {
      const rolePromises = selectedUsers.map((user) =>
        dispatch(updateUserRolesThunk({ userId: user.id, data: { roles: selectedRoles } })).unwrap()
      );
      
      const permissionPromises = selectedUsers.map((user) =>
        dispatch(updateUserPermissionsThunk({ userId: user.id, data: requestData })).unwrap()
      );

      await Promise.all([...rolePromises, ...permissionPromises]);
      toast.success("Roles and permissions updated successfully for all selected users!");
      setSelectedUsers([]);
    } catch {
      toast.error("An error occurred while updating roles and permissions");
    }
  }, [dispatch, selectedUsers, selectedPermissions, menuData]);

  const sortedMenuData = [...menuData].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <CardHeaderSection
        title=" User and Role permission"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Role permission", href: "" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3 sm:gap-4 mb-4 min-w-0 flex-1">
              <div className="flex border-l-4 border-teal-900 rounded-xl flex-shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1 justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Apply Role Permission</h2>
                </div>
                <p className="text-sm text-gray-500">Role permission</p>
              </div>
            </div>

            <Separator className="bg-slate-200 mb-4" />

            <div className="space-y-4">
              {selectedUsers.length > 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-900">Batch Permission Assignment</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Configuring permissions now will update all {selectedUsers.length} selected users.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 mb-4">
                <h3 className="text-sm font-medium text-gray-900">Functions to apply</h3>
                <span className="text-red-500">*</span>
              </div>

              <div className="min-h-[148px] flex flex-col">
                <div className="flex-1 space-y-4">
                  {isMenuLoading ? (
                    <Loading />
                  ) : sortedMenuData.length > 0 ? (
                    sortedMenuData.map((menu, index) => (
                      <MenuPermissionItem
                        key={menu.id}
                        menu={menu}
                        index={index + 1}
                        selectedPermissions={selectedPermissions}
                        onPermissionChange={handlePermissionChange}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No menu items available to configure permissions.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please check your menu data or contact support if this persists.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-4 lg:self-start">
          <CardContent className="p-6">
            <div className="flex gap-3 sm:gap-4 mb-4 min-w-0 flex-1">
              <div className="flex border-l-4 border-teal-900 rounded-xl flex-shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1 justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Apply user permission</h2>
                </div>
                <p className="text-sm text-gray-500">User Permission</p>
              </div>
            </div>

            <Separator className="bg-slate-200 mb-4" />

            {isUserLoading ? (
              <Loading />
            ) : (
              <UserRoleManagement
                users={null}
                setUserRoles={setEditableRoles}
                userRoles={editableRoles}
                onApplyRoles={handleApplyRoles}
                selectedUsers={selectedUsers}
                onAddUser={handleAddUser}
                onRemoveUser={handleRemoveUser}
                onClearUsers={handleClearUsers}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
