import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";

interface QuickActionProps {
  unsavedChanges: Set<number>;
  setUnsavedChanges: (changes: Set<number>) => void;
  handleResetChanges: () => void;
  handleSaveScores: () => void;
  isSavingAll: boolean;
}
export default function StudentScoresQuickAction({
  unsavedChanges,
  setUnsavedChanges,
  handleResetChanges,
  handleSaveScores,
  isSavingAll,
}: QuickActionProps) {
  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-yellow-300 bg-yellow-50 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse">
              {unsavedChanges.size}
            </Badge>
            <span className="text-sm font-medium">Pending Changes</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUnsavedChanges(new Set())}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChanges}
            className="flex-1 hover:bg-red-100 text-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSaveScores}
            disabled={isSavingAll}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSavingAll ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            Save All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
