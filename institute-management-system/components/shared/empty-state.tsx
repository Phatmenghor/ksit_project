"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FileSearch, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  message = "No data found",
  description,
  icon: Icon = FileSearch,
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className={cn("mb-4 rounded-full bg-muted p-4", iconClassName)}>
        <Icon className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
