import { Unpacked } from "lib/types";
import { useState } from "react";
import { PlusStatus, Suggestions } from "services/plus";
import useSWR from "swr";
import { useUser } from "./common";

export function usePlus() {
  const [user] = useUser();
  const [suggestionsFilter, setSuggestionsFilter] = useState<
    number | undefined
  >(undefined);

  const { data: plusStatusData } = useSWR<PlusStatus>("/api/plus");
  const { data: suggestionsData } = useSWR<Suggestions>(
    "/api/plus/suggestions"
  );

  const suggestions = suggestionsData ?? [];

  const suggestionDescriptions = suggestions
    .filter((suggestion) => suggestion.isResuggestion)
    .reduce(
      (descriptions: Partial<Record<string, Suggestions>>, suggestion) => {
        const key = suggestion.suggestedUser.id + "_" + suggestion.tier;
        if (!descriptions[key]) descriptions[key] = [];

        descriptions[key]!.push(suggestion);

        return descriptions;
      },
      {}
    );

  return {
    plusStatusData,
    suggestionsData: suggestions
      .filter((suggestion) => {
        if (suggestion.isResuggestion) return false;
        return !suggestionsFilter || suggestion.tier === suggestionsFilter;
      })
      .map((suggestion) => ({
        ...suggestion,
        resuggestions:
          suggestionDescriptions[
            suggestion.suggestedUser.id + "_" + suggestion.tier
          ],
      })),
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
