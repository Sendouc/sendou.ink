import { useState } from "react";
import { PlusStatus, Suggestions } from "services/plus";
import useSWR from "swr";
import { useUser } from "./common";

export function usePlus() {
  const [user] = useUser();
  const [suggestionsFilter, setSuggestionsFilter] = useState<
    number | undefined
  >(undefined);

  const { data: plusStatusData } = useSWR<PlusStatus>(
    user ? "/api/plus" : null
  );
  const { data: suggestionsData } = useSWR<Suggestions>(
    "/api/plus/suggestions"
  );

  const suggestions = suggestionsData ?? [];

  return {
    plusStatusData: plusStatusData?.status,
    suggestionsData: suggestions.filter(
      (suggestion) =>
        !suggestionsFilter || suggestion.tier === suggestionsFilter
    ),
    suggestionsLoading: !suggestionsData,
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
