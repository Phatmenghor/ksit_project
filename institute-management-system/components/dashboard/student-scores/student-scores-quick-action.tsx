import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Save, X } from "lucide-react";

interface QuickActionProps {
  unsavedChanges: Set<number>;
  handleResetChanges: () => void;
  handleSaveScores: () => void;
  isSavingAll: boolean;
}

export default function StudentScoresQuickAction({
  unsavedChanges,
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
            <span className="text-sm font-medium">Unsaved Changes</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetChanges}
            className="h-7 w-7 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChanges}
            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Discard
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
              <Save className="h-4 w-4 mr-1" />
            )}
            Save All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
