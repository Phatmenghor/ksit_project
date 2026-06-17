"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Edit, LogOut, SettingsIcon, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/routes";
import {
  clearRoles,
  getRoleCheck,
} from "@/utils/local-storage/user-info/roles";
import { clearUserId } from "@/utils/local-storage/user-info/userId";
import {
  clearUsername,
  getUsername,
} from "@/utils/local-storage/user-info/username";
import { logoutUser } from "@/utils/local-storage/user-info/token";
import { ConfirmDialog } from "../shared/custom-confirm-dialog";
import { MobileSidebar } from "./mobile-sidebar";
import { RoleEnum } from "@/constants/constant";
import Image from "next/image";
import { AppIcons, AppResource } from "@/constants/icons/icon";
import { useCurrentUser } from "@/hooks/use-current-user";

export function Header() {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleDisplay, setRoleDisplay] = useState<{ label: string; color: string } | null>(null);
  const { user } = useCurrentUser();
  const router = useRouter();

  const getProfileUrl = () => {
    const roleGroup = getRoleCheck();

    switch (roleGroup) {
      case RoleEnum.ADMIN:
        return ROUTE.PROFILE.ADMIN;
      case RoleEnum.DEVELOPER:
      case RoleEnum.TEACHER:
      case RoleEnum.STAFF:
        return ROUTE.PROFILE.TEACHER;
      case RoleEnum.STUDENT:
        return ROUTE.PROFILE.STUDENT;
      default:
        return "/unauthorized";
    }
  };

  const getDisplayName = () => {
    if (user?.englishFirstName && user?.englishLastName) {
      return `${user.englishFirstName} ${user.englishLastName}`;
    }
    return user?.username ?? "Unknown";
  };

  // Function to get initials for avatar fallback
  const getAvatarFallback = () => {
    try {
      if (user?.englishFirstName && user?.englishLastName) {
        return `${user.englishFirstName.charAt(0)}${user.englishLastName.charAt(
          0
        )}`.toUpperCase();
      }

      const username = getUsername();
      if (username && username.length > 0) {
        // For usernames like email, take first letter and letter after @ or first two letters
        if (username.includes("@")) {
          const parts = username.split("@");
          return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
        // For regular usernames, take first two letters
        return username.length > 1
          ? `${username.charAt(0)}${username.charAt(1)}`.toUpperCase()
          : username.charAt(0).toUpperCase();
      }
    } catch (error) {
    }
    return "U";
  };

  // Function to truncate long names
  const getTruncatedName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };

  const computeRoleDisplay = (): { label: string; color: string } => {
    const roleGroup = getRoleCheck();
    switch (roleGroup) {
      case RoleEnum.ADMIN: return { label: "Admin", color: "text-red-300" };
      case RoleEnum.DEVELOPER: return { label: "Developer", color: "text-purple-300" };
      case RoleEnum.TEACHER: return { label: "Teacher", color: "text-blue-300" };
      case RoleEnum.STAFF: return { label: "Staff", color: "text-emerald-300" };
      case RoleEnum.STUDENT: return { label: "Student", color: "text-yellow-300" };
      default: return { label: "User", color: "text-gray-300" };
    }
  };

  // Function to get role badge color
  // const getRoleBadgeColor = () => {
  //   const roleGroup = getRoleCheck();
  //   switch (roleGroup) {
  //     case RoleEnum.ADMIN:
  //       return "bg-red-100 text-red-800";
  //     case RoleEnum.DEVELOPER:
  //       return "bg-purple-100 text-purple-800";
  //     case RoleEnum.TEACHER:
  //       return "bg-blue-100 text-blue-800";
  //     case RoleEnum.STAFF:
  //       return "bg-green-100 text-green-800";
  //     case RoleEnum.STUDENT:
  //       return "bg-yellow-100 text-yellow-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  const profileUrl = getProfileUrl();

  useEffect(() => {
    setRoleDisplay(computeRoleDisplay());
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    clearUserId();
    clearRoles();
    clearUsername();
    logoutUser();
    router.push(ROUTE.AUTH.LOGIN);
  };

  return (
    <>
      <header className="flex items-center justify-between bg-[#024D3E] px-4 md:px-6 h-20 md:h-16">
        {/* Left: Logo or Sidebar toggle */}
        <div className="flex items-center">
          {isMobile && (
            <>
              <Button
                variant="ghost"
                asChild
                size="icon"
                onClick={toggleMobileMenu}
                className="hover:bg-white/10"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <img
                    src={AppIcons.menu}
                    alt="menu Icon"
                    className="h-5 w-6 mr-3 sm:mr-5 text-muted-foreground"
                  />
                )}
              </Button>
              <Link href="/" className="flex items-center ml-2 gap-2">
                <div className="relative h-12 w-12">
                  <Image
                    src={AppResource.Logo}
                    alt="KSIT Logo"
                    fill
                    className="rounded-full object-contain"
                    priority
                  />
                </div>
                <span className="font-bold text-white text-lg">KSIT</span>
              </Link>
            </>
          )}
        </div>

        {/* Right: User Profile Section */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer group hover:bg-white/10 rounded-lg p-2 transition-colors duration-200">
                <Avatar className="h-10 w-10 border-2 cursor-pointer border-white/20 shadow-sm">
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${user?.profileUrl}`}
                    alt="User"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white/20 text-white font-semibold text-sm backdrop-blur-sm">
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden md:flex flex-col items-start">
                  <span
                    className="text-white text-sm font-medium leading-tight max-w-[150px] truncate"
                    title={getDisplayName()}
                  >
                    {getTruncatedName(getDisplayName())}
                  </span>
                  {roleDisplay && (
                    <span className={`text-xs font-normal leading-tight ${roleDisplay.color}`}>
                      {roleDisplay.label}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2">
              {/* User info in dropdown */}
              <div className="px-3 py-3 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${user?.profileUrl}`}
                      alt="User"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">{getDisplayName()}</span>
                    {roleDisplay && (
                      <span className={`text-xs font-medium ${
                        roleDisplay.label === "Admin" ? "text-red-500" :
                        roleDisplay.label === "Developer" ? "text-purple-500" :
                        roleDisplay.label === "Teacher" ? "text-blue-500" :
                        roleDisplay.label === "Staff" ? "text-emerald-600" :
                        "text-yellow-600"
                      }`}>
                        {roleDisplay.label}
                      </span>
                    )}
                    {user?.department?.name && (
                      <span className="text-xs text-muted-foreground truncate">{user.department.name}</span>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() => router.push(profileUrl)}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() => router.push(profileUrl + "/edit")}
              >
                <div className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() => router.push(ROUTE.USERS.SETTING_CHANGE_PASSWORD)}
              >
                <div className="flex items-center">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setConfirmOpen(true)}
              >
                <div className="flex items-center text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </div>
                <ArrowRight className="h-4 w-4 text-red-600" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <MobileSidebar isOpen={true} onClose={toggleMobileMenu} />
        </div>
      )}

      {/* Confirm Logout Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Logout"
        description="Are you sure you want to logout?"
        onConfirm={handleLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
}
