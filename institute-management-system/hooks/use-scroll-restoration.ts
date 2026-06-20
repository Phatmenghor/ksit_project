"use client";

import { useEffect, useRef, RefObject } from "react";
import { usePathname } from "next/navigation";

const scrollPositions = new Map<string, number>();

export function useScrollRestoration(ref: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  // Ref so the scroll listener (attached once) always writes under the
  // current pathname without needing to re-attach on every route change.
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Attach scroll listener once for the lifetime of the layout.
  // Saves synchronously on every scroll — no rAF — so the Map always
  // has the user's last position before Next.js can shrink the content
  // and clamp scrollTop to 0 (which was corrupting the cleanup save).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      scrollPositions.set(pathnameRef.current, el.scrollTop);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref]);

  // Restore the saved position each time the route changes.
  // Retries across rAF frames so it still lands when cached content
  // finishes painting and the container becomes tall enough.
  useEffect(() => {
    const target = scrollPositions.get(pathname) ?? 0;
    let raf = 0;
    let attempts = 0;

    const restore = () => {
      const el = ref.current;
      if (!el) return;
      el.scrollTop = target;
      attempts += 1;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (attempts < 50 && maxScroll < target) {
        raf = requestAnimationFrame(restore);
      }
    };

    raf = requestAnimationFrame(restore);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, pathname]);
}
