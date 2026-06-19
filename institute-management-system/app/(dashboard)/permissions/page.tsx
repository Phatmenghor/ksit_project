"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MenuModel } from "@/model/menu/menu-respond";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPermissionRequest } from "@/model/permission/permission-request-model";
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

export default function Permissions() {
  const dispatch = useAppDispatch();
  const menuData = useAppSelector(selectPermissionMenuData);
  const userRoles = useAppSelector(selectPermissionUserRoles);
  const isMenuLoading = useAppSelector(selectPermissionIsLoadingMenu);
  const isUserLoading = useAppSelector(selectPermissionIsLoadingRoles);
  const isUpdatingRoles = useAppSelector(selectPermissionIsUpdatingRoles);
  const isSubmitting = useAppSelector(selectPermissionIsUpdatingPermissions);

  const [selectedUser, setSelectedUser] = useState<StaffModel | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [editableRoles, setEditableRoles] = useState(userRoles);

  useEffect(() => {
    if (!selectedUser) {
      dispatch(clearPermissionData());
      setSelectedPermissions(new Set());
      return;
    }
    dispatch(fetchUserMenuThunk(selectedUser.id));
    dispatch(fetchUserRolesThunk(selectedUser.id));
  }, [dispatch, selectedUser]);

  useEffect(() => {
    const initialPermissions = new Set<number>();
    const addViewableMenus = (menus: MenuModel[]) => {
      menus.forEach((menu) => {
        if (menu.canView) initialPermissions.add(menu.id);
        if (menu.children?.length) addViewableMenus(menu.children);
      });
    };
    addViewableMenus(menuData);
    setSelectedPermissions(initialPermissions);
  }, [menuData]);

  useEffect(() => {
    setEditableRoles(userRoles);
  }, [userRoles]);

  const handlePermissionChange = useCallback((menuId: number, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(menuId);
      else newSet.delete(menuId);
      return newSet;
    });
  }, []);

  const handleApplyRoles = useCallback(async (selectedRoles: string[]) => {
    if (!selectedUser) return;
    try {
      await dispatch(updateUserRolesThunk({ userId: selectedUser.id, data: { roles: selectedRoles } })).unwrap();
      toast.success("Roles updated successfully!");
    } catch {
      toast.error("An error occurred while updating roles");
    }
  }, [dispatch, selectedUser]);

  const handleApplyPermissions = useCallback(async () => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

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
      await dispatch(updateUserPermissionsThunk({ userId: selectedUser.id, data: requestData })).unwrap();
      toast.success("Permissions updated successfully!");
    } catch {
      toast.error("An error occurred while updating permissions");
    }
  }, [dispatch, selectedUser, selectedPermissions, menuData]);

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
              <div className="pt-4 flex justify-end mt-auto">
                <Button
                  onClick={handleApplyPermissions}
                  disabled={isSubmitting || sortedMenuData.length === 0}
                  className="bg-teal-900 hover:bg-teal-950 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Permissions"
                  )}
                </Button>
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

            {isUserLoading || isUpdatingRoles ? (
              <Loading />
            ) : (
              <UserRoleManagement
                users={null}
                setUserRoles={setEditableRoles}
                userRoles={editableRoles}
                onApplyRoles={handleApplyRoles}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
