import Loading from "@/components/shared/loading";
import { Card } from "@/components/ui/card";
import { TranscriptLayout } from "@/components/shared/transcript/transcript-layout";
import { TranscriptModel } from "@/model/request/request-transcript";
import { getDetailRequestTranscriptService } from "@/service/request/request.service";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface RequestParam {
  studentId?: number;
}

export function TranscriptTabs(param: RequestParam) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transcriptData, setTranscriptData] = useState<TranscriptModel | null>(null);

  const fetchTranscript = useCallback(async () => {
    if (!param.studentId || param.studentId <= 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getDetailRequestTranscriptService(param.studentId);
      setTranscriptData(response ?? null);
    } catch {
      toast.error("Error occurred while loading transcript");
    } finally {
      setIsLoading(false);
    }
  }, [param.studentId]);

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  return (
    <Card className="p-4 md:p-8">
      {isLoading ? (
        <Loading />
      ) : (
        <TranscriptLayout data={transcriptData} />
      )}
    </Card>
  );
}
