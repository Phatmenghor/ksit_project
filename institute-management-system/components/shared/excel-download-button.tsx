"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppIcons } from "@/constants/icons/icon";
import { cn } from "@/lib/utils";

interface ExcelDownloadButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function ExcelDownloadButton({
  onClick,
  isLoading = false,
  disabled = false,
  className,
  label = "Excel",
}: ExcelDownloadButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      disabled={disabled || isLoading}
      className={cn(
        "h-9 px-3 gap-1.5 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-green-600 shrink-0" />
          <span className="text-xs font-medium text-green-700">Exporting...</span>
        </>
      ) : (
        <>
          <img
            src={AppIcons.Excel}
            alt="Excel"
            className="h-4 w-4 shrink-0"
          />
          <span className="text-xs font-medium">{label}</span>
          <span className="text-gray-300 mx-0.5 select-none">|</span>
          <Download className="h-3.5 w-3.5 text-gray-500 shrink-0" />
        </>
      )}
    </Button>
  );
}
