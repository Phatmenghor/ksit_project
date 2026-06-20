import Loading from "@/components/shared/loading";
import { TranscriptLayout } from "@/components/shared/transcript/transcript-layout";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectRequestTranscript,
  selectRequestIsFetchingTranscript,
} from "@/features/requests/store/selectors/request-selectors";
import { fetchRequestTranscriptThunk } from "@/features/requests/store/thunks/request-thunks";

interface RequestParam {
  studentId?: number;
}

export function RequestTranscript(param: RequestParam) {
  const dispatch = useAppDispatch();
  const transcriptData = useAppSelector(selectRequestTranscript);
  const isFetching = useAppSelector(selectRequestIsFetchingTranscript);

  useEffect(() => {
    if (param.studentId && param.studentId > 0 && !transcriptData && !isFetching) {
      dispatch(fetchRequestTranscriptThunk(param.studentId));
    }
  }, [param.studentId, transcriptData, isFetching, dispatch]);

  const isLoading = isFetching && !transcriptData;

  return (
    <div className="p-4 md:p-8">
      {isLoading ? (
        <Loading />
      ) : (
        <TranscriptLayout data={transcriptData ?? null} />
      )}
    </div>
  );
}
