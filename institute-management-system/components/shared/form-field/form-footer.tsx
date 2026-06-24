import React from "react";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  children: React.ReactNode;
  className?: string;
  isSubmitting?: boolean;
  isDirty?: boolean;
  isCreate?: boolean;
  createMessage?: string;
  updateMessage?: string;
}

export function FormFooter({ children, className, isSubmitting, isCreate, createMessage, updateMessage }: FormFooterProps) {
  const message = isSubmitting
    ? isCreate ? createMessage : updateMessage
    : null;

  return (
    <div className={cn("flex-shrink-0 border-t border-border/60 bg-muted/20 px-4 py-3 flex items-center justify-between gap-2", className)}>
      {message ? (
        <p className="text-xs text-muted-foreground italic">{message}</p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}
