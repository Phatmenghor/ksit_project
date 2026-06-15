import React from "react";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFooter({ children, className }: FormFooterProps) {
  return (
    <div className={cn(
      "flex-shrink-0 border-t bg-background px-4 py-3 flex items-center justify-end gap-2",
      className
    )}>
      {children}
    </div>
  );
}
