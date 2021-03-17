import { useUser } from "hooks/common";
import { getVotingRange } from "utils/plus";
import { trpc } from "utils/trpc";

export default function usePlusVoting() {
  const [user] = useUser();
  const { data: ballotsData, isLoading: isLoadingBallots } = trpc.useQuery([
    "plus.ballots",
  ]);
  const { data: statusesData, isLoading: isLoadingStatuses } = trpc.useQuery([
    "plus.statuses",
  ]);
  const {
    data: suggestionsData,
    isLoading: isLoadingSuggestions,
  } = trpc.useQuery(["plus.suggestions"]);

  const ownPlusStatus = statusesData?.find(
    (status) => status.user.id === user?.id
  );

  const votingTier = ownPlusStatus?.membershipTier;

  return {
    ballotsData: ballotsData?.filter((ballot) => !ballot.isStale),
    staleBallots: ballotsData?.filter((ballot) => ballot.isStale),
    shouldRedirect:
      (statusesData && !votingTier) || !getVotingRange().isHappening,
    usersToVoteOn: statusesData?.filter(
      (user) =>
        (user.membershipTier && user.membershipTier === votingTier) ||
        (user.vouchTier && user.vouchTier === votingTier)
    ),
    suggestedUsersToVoteOn: suggestionsData?.filter(
      (suggestion) => suggestion.tier === votingTier
    ),
    isLoading: isLoadingBallots || isLoadingStatuses || isLoadingSuggestions,
  };
}
