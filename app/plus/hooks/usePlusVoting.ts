import { useUser } from "hooks/common";
import { useState } from "react";
import { trpc } from "utils/trpc";
import { Unpacked } from "utils/types";
import { votesSchema } from "utils/validators/votes";
import * as z from "zod";

export default function usePlusVoting() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<z.infer<typeof votesSchema>>([]);

  const [user] = useUser();
  const { data: ballotsData, isLoading: isLoadingBallots } = trpc.useQuery([
    "plus.usersForVoting",
  ]);
  const { data: statusesData, isLoading: isLoadingStatuses } = trpc.useQuery([
    "plus.statuses",
  ]);

  const ownPlusStatus = statusesData?.find(
    (status) => status.user.id === user?.id
  );

  return {
    isLoading: isLoadingBallots || isLoadingStatuses,
    shouldRedirect: !isLoadingBallots && !ballotsData,
    plusStatus: ownPlusStatus,
    currentUser: ballotsData?.[currentIndex],
    previousUser:
      currentIndex > 0 && ballotsData
        ? { ...ballotsData[currentIndex - 1], ...votes[votes.length - 1] }
        : undefined,
    progress: ballotsData
      ? ((currentIndex + 1) / ballotsData.length) * 100
      : undefined,
    handleVote: (vote: Unpacked<z.infer<typeof votesSchema>>) => {
      setVotes([...votes, vote]);
      setCurrentIndex(currentIndex + 1);
      (<HTMLElement>document.activeElement).blur();
    },
    goBack: () => {
      setVotes(votes.slice(0, votes.length - 1));
      setCurrentIndex(currentIndex - 1);
    },
  };
}
