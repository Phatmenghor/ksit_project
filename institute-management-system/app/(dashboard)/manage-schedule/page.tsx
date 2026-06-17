"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/routes";

export default function ManageSchedulePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTE.MANAGE_SCHEDULE.DEPARTMENT);
  }, [router]);

  return null;
}
