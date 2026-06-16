"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";

interface TableHeaderProps {
  title: string;
  totalCount?: number;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonDisabled?: boolean;
  buttonTooltip?: string;
  extraActions?: React.ReactNode;
}

export function TableHeader({
  title,
  totalCount,
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  buttonText,
  onButtonClick,
  buttonDisabled,
  buttonTooltip,
  extraActions,
}: TableHeaderProps) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="py-3 px-4 space-y-3">
        {/* Row 1: Title left | Actions + Add button right */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-sm sm:text-base font-semibold tracking-tight text-gray-800 truncate min-w-0">
            {title}
            {totalCount !== undefined && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({totalCount.toLocaleString()})
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            {extraActions}
            {buttonText && (
              <Button
                disabled={buttonDisabled}
                onClick={onButtonClick}
                className="gap-1.5 h-9 px-3 text-sm whitespace-nowrap"
                title={buttonTooltip}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">{buttonText}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Search */}
        {onSearchChange && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-8 h-9 w-full text-sm focus-visible:ring-primary/30 focus-visible:border-primary hover:border-primary/50 transition-colors"
              value={searchValue}
              onChange={onSearchChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
