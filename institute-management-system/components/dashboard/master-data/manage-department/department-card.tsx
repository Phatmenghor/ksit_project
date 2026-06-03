import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";

interface DepartmentCardProps {
  name: string;
  totalMajor: number;
  color: string;
  textColor: string;
}

export function DepartmentCard({
  name,
  totalMajor,
  color,
  textColor,
}: DepartmentCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className={cn("p-0", color, textColor)}>
        <div className="flex items-start justify-between p-6">
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="mt-1">Total major: {totalMajor}</p>
          </div>
          <div className="rounded-full bg-white/20 p-2">
            <img
              src="/placeholder.svg?height=40&width=40"
              alt="Department logo"
              className="h-8 w-8"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className={cn("border-t p-0", color, textColor)}>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-center gap-1 py-3 text-sm font-medium hover:bg-white/10"
        >
          More info <InfoIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
