import React from "react";
import { cn } from "@/lib/utils"; // Make sure you have this utility or replace it with simple class merging

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-300 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
};
