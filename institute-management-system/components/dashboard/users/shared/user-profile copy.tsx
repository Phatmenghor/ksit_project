import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { getInitials } from "@/lib/utils";

interface ProfileProps {
  user?: StudentByIdModel | null | StaffRespondModel;
  className?: string;
}

export const UserProfileSection: React.FC<ProfileProps> = ({
  user,
  className,
}) => {
  const isMobile = useIsMobile();
  const profileUrl = user?.profileUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${user?.profileUrl}`
    : undefined;

  return (
    <div>
      {isMobile ? (
        <Card className="flex flex-col items-center w-full justify-center py-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={profileUrl || "/assets/profile.png"}
              className=""
              alt={user?.username || "User"}
            />
            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <h3 className="font-medium text-lg mt-4">
            {user?.username || "Unknown"}
          </h3>
          <div className="text-sm text-muted-foreground">
            <Badge className="bg-green-100 hover:bg-green-200 text-green-900 p-2">
              ID: {user?.identifyNumber ?? "N/A"}
            </Badge>
          </div>
        </Card>
      ) : (
        <Card className={clsx("border shadow-sm", className)}>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profileUrl || "/assets/profile.png"}
                alt={user?.username || "User"}
              />
              <AvatarFallback suppressHydrationWarning>
                {getInitials(user?.username)}
              </AvatarFallback>
            </Avatar>

            <h3 className="font-medium text-lg mt-4">
              {user?.username || "Unknown"}
            </h3>
            <div className="text-sm text-muted-foreground">
              <Badge className="bg-green-100 hover:bg-green-200 text-green-900 p-2">
                ID: {user?.identifyNumber ?? "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
