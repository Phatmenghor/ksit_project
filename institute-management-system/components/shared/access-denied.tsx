import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTE } from "@/constants/routes";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-[60vh] text-center px-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <ShieldAlert className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">You don't have permission to view this page</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        This page isn't included in your account's menu access. If you believe this is a
        mistake, contact an administrator to request access.
      </p>
      <Button asChild className="mt-2">
        <Link href={ROUTE.DASHBOARD}>Back to Dashboard</Link>
      </Button>
    </div>
  );
}
