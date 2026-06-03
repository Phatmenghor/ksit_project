import React, { useState, useCallback, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AppSidebarIcons } from "@/constants/icons/icon";
import { MenuModel } from "@/model/menu/menu-respond";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MenuPermissionItemProps {
  menu: MenuModel;
  index: number;
  selectedPermissions: Set<number>;
  onPermissionChange: (menuId: number, checked: boolean) => void;
}

const MenuPermissionItem: React.FC<MenuPermissionItemProps> = ({
  menu,
  index,
  selectedPermissions,
  onPermissionChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isChecked = selectedPermissions.has(menu.id);
  const iconSrc = AppSidebarIcons[menu.icon as keyof typeof AppSidebarIcons];
  const hasChildren = menu.children && menu.children.length > 0;

  // Handle parent checkbox change
  const handleParentChange = (checked: boolean) => {
    // Always change the parent
    onPermissionChange(menu.id, checked);

    // If has children, check/uncheck all children based on parent state
    if (hasChildren) {
      menu.children.forEach((child: MenuModel) => {
        onPermissionChange(child.id, checked);
      });
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Main menu item */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center space-x-3 flex-1">
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleParentChange}
            className="flex-shrink-0"
          />
          <div className="flex items-center space-x-3">
            {iconSrc && (
              <img
                src={iconSrc}
                alt={menu.title}
                className="w-5 h-5 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="text-sm font-medium text-gray-900">
              {menu.title}
            </span>
          </div>
        </div>

        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={toggleExpanded}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Children/Subroutes */}
      {hasChildren && isExpanded && (
        <div className="bg-gray-50">
          {menu.children
            .sort(
              (a: MenuModel, b: MenuModel) => a.displayOrder - b.displayOrder
            )
            .map((child: MenuModel, childIndex: number) => (
              <div
                key={child.id}
                className={`flex items-center space-x-3 p-4 pl-12 ${
                  childIndex !== menu.children.length - 1
                    ? "border-b border-gray-200"
                    : ""
                } hover:bg-gray-100 transition-colors`}
              >
                <Checkbox
                  checked={selectedPermissions.has(child.id)}
                  onCheckedChange={(checked) =>
                    onPermissionChange(child.id, checked as boolean)
                  }
                  className="flex-shrink-0"
                />
                <div className="flex items-center space-x-3">
                  {AppSidebarIcons[
                    child.icon as keyof typeof AppSidebarIcons
                  ] && (
                    <img
                      src={
                        AppSidebarIcons[
                          child.icon as keyof typeof AppSidebarIcons
                        ]
                      }
                      alt={child.title}
                      className="w-4 h-4 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <span className="text-sm text-gray-700">{child.title}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MenuPermissionItem;
