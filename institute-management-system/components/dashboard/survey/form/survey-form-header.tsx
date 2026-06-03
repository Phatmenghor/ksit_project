import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SurveyMainModel } from "@/model/survey/survey-main-model";
import { ArrowLeft, User } from "lucide-react";
import React from "react";

interface SurveyHeaderData {
  handleBack: () => void;
  surveyData: SurveyMainModel | null;
}
export default function SurveyFormHeader({
  handleBack,
  surveyData,
}: SurveyHeaderData) {
  return (
    <Card className="p-4">
      <div>
        <div className="mx-auto space-y-2">
          <span className="text-sm text-gray-500">
            Dashboard &gt; Dashboard &gt; Survey Form
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Survey Form</h1>
          </div>
          <CardHeader className="pb-4 bg-yellow-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/assets/KSIT.png" />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-base">{surveyData?.title}</h2>
                <p className="text-gray-600 text-sm">
                  {surveyData?.description}
                </p>
              </div>
            </div>
          </CardHeader>
        </div>
      </div>
    </Card>
  );
}
