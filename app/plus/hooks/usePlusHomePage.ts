import { useState } from "react";
import { trpc } from "utils/trpc";
import { useUser } from "../../../hooks/common";

export function usePlusHomePage() {
  const [user] = useUser();
  const [suggestionsFilter, setSuggestionsFilter] = useState<
    number | undefined
  >(undefined);

  const { data: suggestionsData } = trpc.useQuery(["plusSuggestions"]);
  const { data: plusStatusData } = trpc.useQuery(["plusStatuses"]);

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
