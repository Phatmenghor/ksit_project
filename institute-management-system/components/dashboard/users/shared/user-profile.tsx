import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { getInitials } from "@/lib/utils";
import { Mail, Phone, Building2, Calendar } from "lucide-react";

interface ProfileProps {
  user?: StudentByIdModel | null | StaffRespondModel;
  className?: string;
}

export const UserProfileSection: React.FC<ProfileProps> = ({ user, className }) => {
  const profileUrl = user?.profileUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${user.profileUrl}`
    : undefined;

  const fullName =
    (user as StaffRespondModel)?.englishFirstName ||
    (user as StaffRespondModel)?.englishLastName
      ? `${(user as StaffRespondModel)?.englishFirstName ?? ""} ${(user as StaffRespondModel)?.englishLastName ?? ""}`.trim()
      : null;

  const khmerName =
    (user as StaffRespondModel)?.khmerFirstName ||
    (user as StaffRespondModel)?.khmerLastName
      ? `${(user as StaffRespondModel)?.khmerFirstName ?? ""} ${(user as StaffRespondModel)?.khmerLastName ?? ""}`.trim()
      : null;

  const status = (user as StaffRespondModel)?.status;
  const department = (user as StaffRespondModel)?.department;

  return (
    <Card className={clsx("border shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-md">
              <AvatarImage src={profileUrl || "/assets/profile.png"} alt={user?.username || "User"} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {getInitials(user?.username)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h2 className="text-xl font-bold text-foreground">{fullName || user?.username || "Unknown"}</h2>
              {khmerName && <p className="text-sm text-muted-foreground">{khmerName}</p>}
              <p className="text-sm text-muted-foreground font-mono">@{user?.username}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {status && (
                <Badge className={status === "ACTIVE" ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-100" : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-100"} variant="outline">
                  {status}
                </Badge>
              )}
              {user?.identifyNumber && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                  ID: {user.identifyNumber}
                </Badge>
              )}
              {(user as StaffRespondModel)?.roles?.map((role, i) => (
                <Badge key={i} variant="secondary" className="text-xs capitalize">
                  {role.toLowerCase()}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center sm:justify-start mt-1">
              {(user as StaffRespondModel)?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {(user as StaffRespondModel).email}
                </span>
              )}
              {(user as StaffRespondModel)?.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {(user as StaffRespondModel).phoneNumber}
                </span>
              )}
              {department?.name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {department.name}
                </span>
              )}
              {(user as StaffRespondModel)?.dateOfBirth && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {(user as StaffRespondModel).dateOfBirth}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
