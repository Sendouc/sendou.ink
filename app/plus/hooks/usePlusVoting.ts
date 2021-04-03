import { useToast } from "@chakra-ui/toast";
import { useUser } from "hooks/common";
import { useState } from "react";
import { getToastOptions } from "utils/getToastOptions";
import { trpc } from "utils/trpc";
import { Unpacked } from "utils/types";
import { votesSchema } from "utils/validators/votes";
import * as z from "zod";

export default function usePlusVoting() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<z.infer<typeof votesSchema>>([]);

  const toast = useToast();
  const [user] = useUser();

  const {
    data: votedUserScores,
    isLoading: hasVotedIsLoading,
  } = trpc.useQuery(["plus.votedUserScores"]);
  const { data: usersForVoting, isLoading: isLoadingBallots } = trpc.useQuery([
    "plus.usersForVoting",
  ]);
  const { data: statuses, isLoading: isLoadingStatuses } = trpc.useQuery([
    "plus.statuses",
  ]);
  const utils = trpc.useQueryUtils();
  const { mutate: mutateVote, status: voteStatus } = trpc.useMutation(
    "plus.vote",
    {
      onSuccess() {
        toast(getToastOptions("Successfully voted", "success"));
        utils.invalidateQuery(["plus.votedUserScores"]);
        utils.invalidateQuery(["plus.votingProgress"]);
      },
      onError(error) {
        toast(getToastOptions(error.message, "error"));
      },
    },
  );
  const { mutate: editVoteMutate, status: editVoteStatus } = trpc.useMutation(
    "plus.editVote",
    {
      onSuccess() {
        toast(getToastOptions("Successfully edited vote", "success"));
        utils.invalidateQuery(["plus.votedUserScores"]);
      },
      onError(error) {
        toast(getToastOptions(error.message, "error"));
      },
    },
  );

  const ownPlusStatus = statuses?.find((status) => status.user.id === user?.id);

  const getVotedUsers = () => {
    if (!votedUserScores || !usersForVoting) return undefined;

    return usersForVoting
      .map((u) => {
        return { ...u, score: votedUserScores.get(u.userId)! };
      })
      .sort((a, b) => a.username.localeCompare(b.username));
  };

  return {
    isLoading: isLoadingBallots || isLoadingStatuses || hasVotedIsLoading,
    shouldRedirect: !isLoadingBallots && !usersForVoting,
    plusStatus: ownPlusStatus,
    currentUser: usersForVoting?.[currentIndex],
    previousUser:
      currentIndex > 0 && usersForVoting
        ? { ...usersForVoting[currentIndex - 1], ...votes[votes.length - 1] }
        : undefined,
    progress: usersForVoting
      ? (currentIndex / usersForVoting.length) * 100
      : undefined,
    handleVote: (vote: Unpacked<z.infer<typeof votesSchema>>) => {
      const nextIndex = currentIndex + 1;
      setVotes([...votes, vote]);
      setCurrentIndex(nextIndex);
      (<HTMLElement>document.activeElement).blur();

      // preload next avatar
      const next = usersForVoting?.[nextIndex + 1];
      if (next) {
        new Image().src = `https://cdn.discordapp.com/avatars/${next.discordId}/${next.discordAvatar}.jpg`;
      }
    },
    goBack: () => {
      setVotes(votes.slice(0, votes.length - 1));
      setCurrentIndex(currentIndex - 1);
    },
    submit: () => mutateVote(votes),
    voteStatus,
    votedUsers: getVotedUsers(),
    editVote: editVoteMutate,
  };
}
