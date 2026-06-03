"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type CollapsibleCardProps = {
  title: string;
  children: React.ReactNode;
};

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-xl bg-white shadow-sm">
      <div
        className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-lg"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>

      {open && <div className="p-6 border-t">{children}</div>}
    </div>
  );
};

export default CollapsibleCard;
