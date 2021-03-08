import { PlusStatuses, Suggestions } from "app/plus/service";
import { useState } from "react";
import useSWR from "swr";
import { useUser } from "../../../hooks/common";

export function usePlusHomePage({
  suggestions: suggestionsInitial,
  statuses: statusesInitial,
}: {
  suggestions: Suggestions;
  statuses: PlusStatuses;
}) {
  const [user] = useUser();
  const [suggestionsFilter, setSuggestionsFilter] = useState<
    number | undefined
  >(undefined);

  const { data: plusStatusData } = useSWR<PlusStatuses>(
    user ? "/api/plus" : null,
    { initialData: statusesInitial }
  );
  const { data: suggestionsData } = useSWR<Suggestions>(
    "/api/plus/suggestions",
    { initialData: suggestionsInitial }
  );

  const suggestions = suggestionsData ?? [];

  return {
    plusStatusData: plusStatusData?.find(
      (status) => status.user.id === user?.id
    ),
    vouchedPlusStatusData: plusStatusData?.find(
      (status) => status.voucher?.id === user?.id
    ),
    suggestionsData: suggestions.filter(
      (suggestion) =>
        !suggestionsFilter || suggestion.tier === suggestionsFilter
    ),
    suggestionCounts: suggestions.reduce(
      (counts, suggestion) => {
        const tierString = [null, "ONE", "TWO", "THREE"][
          suggestion.tier
        ] as keyof typeof counts;
        counts[tierString]++;

        return counts;
      },
      { ONE: 0, TWO: 0, THREE: 0 }
    ),
    ownSuggestion: suggestions.find(
      (suggestion) => suggestion.suggesterUser.id === user?.id
    ),
    setSuggestionsFilter,
  };
}
