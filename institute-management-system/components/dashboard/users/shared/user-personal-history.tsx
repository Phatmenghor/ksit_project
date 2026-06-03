import { Fragment } from "react";

interface InfoGridProps {
  data: { label: string; value: string | number | undefined | null }[];
  columns?: number; // Optional: default to 2 columns
}

export default function InfoGrid({ data, columns = 2 }: InfoGridProps) {
  const gridColsClass =
    columns === 1
      ? "grid-cols-2"
      : columns === 2
      ? "grid-cols-4"
      : "grid-cols-2"; // fallback

  return (
    <div className={`grid ${gridColsClass} gap-x-4 gap-y-3 text-sm`}>
      {data.map((item, index) => (
        <Fragment key={index}>
          <div className="text-muted-foreground">{item.label}</div>
          <div>{item.value || ""}</div>
        </Fragment>
      ))}
    </div>
  );
}
