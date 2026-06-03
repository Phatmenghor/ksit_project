import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import React from "react";

export default function StudentScoreAlert({
  unsavedChanges,
}: {
  unsavedChanges: Set<number>;
}) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div className="flex-1">
            <div className="text-sm font-medium text-orange-800">
              Save changes before submitting
            </div>
            <div className="text-xs text-orange-700">
              You have {unsavedChanges.size} unsaved changes. Please save all
              changes before submitting student score.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
