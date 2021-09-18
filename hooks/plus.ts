import { useMutation, useUser } from "hooks/common";
import { PlusStatusesGet } from "pages/api/plus";
import type { SuggestionsGet } from "pages/api/plus/suggestions";
import { UsersForVotingGet } from "pages/api/plus/users-for-voting";
import { VotesGet } from "pages/api/plus/votes";
import { useState } from "react";
import { PlusStatuses } from "services/plus";
import useSWR from "swr";
import { Serialized, Unpacked } from "utils/types";
import { voteSchema, votesSchema } from "utils/validators/votes";
import * as z from "zod";

export function usePlusHomePage(statuses: Serialized<PlusStatuses>) {
  const [user, userIsLoading] = useUser();
  const [suggestionsFilter, setSuggestionsFilter] = useState<
    number | undefined
  >(undefined);

  const suggestionsQuery = useSWR<SuggestionsGet>("/api/plus/suggestions");

  const suggestions = suggestionsQuery.data ?? [];

  return {
    plusStatusData: statuses?.find((status) => status.user.id === user?.id),
    plusStatusDataLoading: userIsLoading,
    vouchStatuses: statuses
      ?.filter((status) => status.voucher)
      .sort((a, b) => a.vouchTier! - b.vouchTier!),
    vouchedPlusStatusData: statuses?.find(
      (status) => status.voucher?.id === user?.id
    ),
    suggestionsData: suggestions.filter(
      (suggestion) =>
        !suggestionsFilter || suggestion.tier === suggestionsFilter
    ),
    suggestionsLoading: !suggestionsQuery.data,
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

type VoteInput = z.infer<typeof votesSchema>;
type EditVoteInput = z.infer<typeof voteSchema>;

export default function usePlusVoting() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<z.infer<typeof votesSchema>>([]);

  const [user] = useUser();

  const votedUserScores = useSWR<VotesGet>("/api/plus/votes");
  const usersForVoting = useSWR<UsersForVotingGet>(
    "/api/plus/users-for-voting"
  );
  const statuses = useSWR<PlusStatusesGet>("/api/plus");
  const voteMutation = useMutation<VoteInput>({
    url: "/api/plus/votes",
    method: "POST",
    successToastMsg: "Successfully voted",
    afterSuccess: () => {
      votedUserScores.mutate();
    },
  });

  const editVoteMutation = useMutation<EditVoteInput>({
    url: "/api/plus/votes",
    method: "PATCH",
    successToastMsg: "Successfully edited vote",
    afterSuccess: () => {
      votedUserScores.mutate();
    },
  });

  const ownPlusStatus = statuses.data?.find(
    (status) => status.user.id === user?.id
  );

  const getVotedUsers = () => {
    if (
      !usersForVoting.data ||
      Object.keys(votedUserScores.data ?? {}).length === 0 ||
      usersForVoting.data.length === 0
    )
      return undefined;

    return usersForVoting.data
      .map((u) => {
        return { ...u, score: votedUserScores.data?.[u.userId]! };
      })
      .sort((a, b) => a.username.localeCompare(b.username));
  };

  return {
    isLoading: !usersForVoting.data || !statuses.data || !votedUserScores.data,
    shouldRedirect: !usersForVoting.data && !usersForVoting,
    plusStatus: ownPlusStatus,
    currentUser: usersForVoting.data?.[currentIndex],
    previousUser:
      currentIndex > 0 &&
      usersForVoting &&
      (usersForVoting.data ?? []).length > 0
        ? {
            ...usersForVoting.data![currentIndex - 1],
            ...votes[votes.length - 1],
          }
        : undefined,
    progress: usersForVoting
      ? (currentIndex / (usersForVoting.data?.length ?? 0)) * 100
      : undefined,
    handleVote: (vote: Unpacked<z.infer<typeof votesSchema>>) => {
      const nextIndex = currentIndex + 1;
      setVotes([...votes, vote]);
      setCurrentIndex(nextIndex);
      (<HTMLElement>document.activeElement).blur();

      // preload next avatar
      const next = usersForVoting.data?.[nextIndex + 1];
      if (next) {
        new Image().src = `https://cdn.discordapp.com/avatars/${next.discordId}/${next.discordAvatar}.jpg`;
      }
    },
    goBack: () => {
      setVotes(votes.slice(0, votes.length - 1));
      setCurrentIndex(currentIndex - 1);
    },
    submit: () => voteMutation.mutate(votes),
    voteMutating: voteMutation.isMutating,
    votedUsers: getVotedUsers(),
    editVote: editVoteMutation.mutate,
    isLoadingEditVote: editVoteMutation.isMutating,
  };
}
