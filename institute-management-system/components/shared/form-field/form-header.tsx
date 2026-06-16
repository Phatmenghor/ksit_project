"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface FormHeaderProps {
  title: string;
  description?: string;
  isCreate?: boolean;
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export function FormHeader({ title, description, icon, iconBg, className }: FormHeaderProps) {
  return (
    <div className={cn("px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3", className)}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
      {icon && (
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border border-border/50",
          iconBg ?? "bg-muted"
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
