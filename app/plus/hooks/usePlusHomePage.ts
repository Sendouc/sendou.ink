import { useState } from "react";
import { getVotingRange } from "utils/plus";
import { trpc } from "utils/trpc";
import { useUser } from "../../../hooks/common";

export function usePlusHomePage() {
  const [user] = useUser();
  const [suggestionsFilter, setSuggestionsFilter] = useState<
    number | undefined
  >(undefined);

  const { data: suggestionsData } = trpc.useQuery(["plus.suggestions"], {
    enabled: !getVotingRange().isHappening,
  });
  const { data: plusStatusData } = trpc.useQuery(["plus.statuses"]);
  const { data: votingProgress } = trpc.useQuery(["plus.votingProgress"], {
    enabled: getVotingRange().isHappening,
  });

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
    votingProgress,
  };
}
