import type { UsersForVoting } from "~/db/models/plusVotes.server";
import * as React from "react";
import { upcomingVoting } from "./voting-time";
import type { PlusVotingResult, User } from "~/db/types";
import invariant from "tiny-invariant";

const LOCAL_STORAGE_KEY = "plusVoting";

interface PlusVote {
  userId: User["id"];
  score: PlusVotingResult["score"];
}
interface VotingLocalStorageData {
  month: number;
  year: number;
  votes: PlusVote[];
  usersForVoting: UsersForVoting;
}

export function usePlusVoting(usersForVotingFromServer: UsersForVoting) {
  const [usersForVoting, setUsersForVoting] = React.useState<UsersForVoting>();
  const [votes, setVotes] = React.useState<PlusVote[]>([]);

  const vote = React.useCallback(
    (type: "upvote" | "downvote") => {
      setVotes((votes) => {
        const userId = usersForVoting?.[votes.length]?.user.id;
        if (!userId) return votes;

        const newVotes = [
          ...votes,
          { userId, score: type === "upvote" ? 1 : -1 },
        ];

        votesToLocalStorage({ usersForVoting, votes: newVotes });

        return newVotes;
      });
    },
    [usersForVoting]
  );

  const undoLast = React.useCallback(() => {
    setVotes((votes) => {
      const newVotes = [...votes];
      newVotes.pop();

      votesToLocalStorage({ usersForVoting, votes: newVotes });
      return newVotes;
    });
  }, [usersForVoting]);

  useLoadInitialStateFromLocalStorageEffect({
    usersForVotingFromServer,
    setUsersForVoting,
    setVotes,
  });

  useVoteWithArrowKeysEffect(vote);

  const currentUser = usersForVoting?.[votes.length];

  const progress: [currentAmount: number, targetAmount: number] | undefined =
    usersForVoting ? [votes.length, usersForVoting.length] : undefined;

  return {
    vote,
    undoLast,
    currentUser,
    previous: previousUser({ usersForVoting, votes }),
    isReady: Boolean(usersForVoting),
    progress,
  };
}

// xxx: with this implementation i guess bio's / suggestions won't update mid-voting?
function useLoadInitialStateFromLocalStorageEffect({
  usersForVotingFromServer,
  setUsersForVoting,
  setVotes,
}: {
  usersForVotingFromServer: UsersForVoting;
  setUsersForVoting: React.Dispatch<
    React.SetStateAction<UsersForVoting | undefined>
  >;
  setVotes: React.Dispatch<React.SetStateAction<PlusVote[]>>;
}) {
  const { month, year } = upcomingVoting(new Date());

  React.useEffect(() => {
    const usersForVotingFromLocalStorage =
      localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!usersForVotingFromLocalStorage) {
      setUsersForVoting(usersForVotingFromServer);
      return;
    }

    const parsedUsersForVoting = JSON.parse(
      usersForVotingFromLocalStorage
    ) as VotingLocalStorageData;

    if (
      parsedUsersForVoting.month !== month ||
      parsedUsersForVoting.year !== year
    ) {
      setUsersForVoting(usersForVotingFromServer);
      return;
    }

    setUsersForVoting(parsedUsersForVoting.usersForVoting);
    setVotes(parsedUsersForVoting.votes);
  }, [month, year, usersForVotingFromServer, setUsersForVoting, setVotes]);
}

function useVoteWithArrowKeysEffect(
  vote: (type: "upvote" | "downvote") => void
) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight") {
        vote("upvote");
      } else if (e.code === "ArrowLeft") {
        vote("downvote");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [vote]);
}

function previousUser({
  usersForVoting,
  votes,
}: {
  usersForVoting?: UsersForVoting;
  votes: PlusVote[];
}) {
  if (!usersForVoting) return;

  const previousUser = usersForVoting?.[votes.length - 1];
  if (!previousUser) return;

  const previousScore = votes[votes.length - 1]?.score;
  invariant(previousScore);

  return {
    ...previousUser,
    score: previousScore,
  };
}

function votesToLocalStorage({
  usersForVoting,
  votes,
}: {
  usersForVoting?: UsersForVoting;
  votes: PlusVote[];
}) {
  const { month, year } = upcomingVoting(new Date());

  invariant(usersForVoting);
  const toLocalStorage: VotingLocalStorageData = {
    month,
    year,
    votes,
    usersForVoting,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toLocalStorage));
}
