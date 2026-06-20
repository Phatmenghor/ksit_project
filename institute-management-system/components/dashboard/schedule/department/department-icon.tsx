import { useEffect } from "react";
import { baseAPI } from "@/constants/api";

// Module-level image cache — keeps Image objects alive so browsers retain the
// decoded bitmap in memory. When an <img> mounts with the same URL the browser
// hits the memory cache (not disk cache) and paints on the very first frame.
const preloaded = new Map<string, HTMLImageElement>();

function preload(src: string) {
  if (typeof window === "undefined" || preloaded.has(src)) return;
  const img = new window.Image();
  img.src = src;
  preloaded.set(src, img);
}

export function DepartmentIcon({
  imageUrl,
  imageName,
}: {
  imageUrl: string;
  imageName: string;
}) {
  const src = imageUrl ? `${baseAPI.BASE_IMAGE}${imageUrl}` : baseAPI.NO_IMAGE;

  useEffect(() => {
    preload(src);
  }, [src]);

  return (
    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-muted flex-shrink-0">
      <img
        src={src}
        alt={imageName}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = baseAPI.NO_IMAGE;
        }}
      />
    </div>
  );
}
