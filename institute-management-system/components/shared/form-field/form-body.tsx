import React from "react";
import { cn } from "@/lib/utils";

interface FormBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function FormBody({ children, className }: FormBodyProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className={cn("p-4 space-y-4", className)}>{children}</div>
    </div>
  );
}
