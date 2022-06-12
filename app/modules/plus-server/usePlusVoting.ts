import * as React from "react";
import invariant from "tiny-invariant";
import { PLUS_DOWNVOTE, PLUS_UPVOTE } from "~/constants";
import type { UsersForVoting } from "~/db/models/plusVotes.server";
import type { User } from "~/db/types";
import type { PlusVoteFromFE } from "./types";
import { nextNonCompletedVoting } from "./voting-time";

const LOCAL_STORAGE_KEY = "plusVoting";

interface VotingLocalStorageData {
  month: number;
  year: number;
  votes: PlusVoteFromFE[];
  /** User id -> order for sorting */
  usersForVotingOrder: Record<User["id"], number>;
}

export function usePlusVoting(usersForVotingFromServer: UsersForVoting) {
  const [usersForVoting, setUsersForVoting] = React.useState<UsersForVoting>();
  const [votes, setVotes] = React.useState<PlusVoteFromFE[]>([]);

  const addVote = React.useCallback(
    (type: "upvote" | "downvote") => {
      setVotes((votes) => {
        const votedId = usersForVoting?.[votes.length]?.user.id;
        if (!votedId) return votes;

        const newVotes = [
          ...votes,
          { votedId, score: type === "upvote" ? PLUS_UPVOTE : PLUS_DOWNVOTE },
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

  useVoteWithArrowKeysEffect(addVote);

  const currentUser = usersForVoting?.[votes.length];

  const progress: [currentAmount: number, targetAmount: number] | undefined =
    usersForVoting ? [votes.length, usersForVoting.length] : undefined;

  return {
    votes,
    addVote,
    undoLast,
    currentUser,
    previous: previousUser({ usersForVoting, votes }),
    isReady: Boolean(usersForVoting),
    progress,
  };
}

function useLoadInitialStateFromLocalStorageEffect({
  usersForVotingFromServer,
  setUsersForVoting,
  setVotes,
}: {
  usersForVotingFromServer: UsersForVoting;
  setUsersForVoting: React.Dispatch<
    React.SetStateAction<UsersForVoting | undefined>
  >;
  setVotes: React.Dispatch<React.SetStateAction<PlusVoteFromFE[]>>;
}) {
  const { month, year } = nextNonCompletedVoting(new Date());

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

    let usersForVotingForState = usersForVotingFromServer;

    // bit of defensive coding in case for some reason the local storage data is out of date
    try {
      usersForVotingForState = [...usersForVotingFromServer].sort((a, b) => {
        const aOrder = parsedUsersForVoting.usersForVotingOrder[a.user.id];
        const bOrder = parsedUsersForVoting.usersForVotingOrder[b.user.id];

        if (typeof aOrder !== "number") {
          throw new Error(`No order for user with id ${a.user.id}`);
        }
        if (typeof bOrder !== "number") {
          throw new Error(`No order for user with id ${b.user.id}`);
        }

        return aOrder - bOrder;
      });
      setVotes(parsedUsersForVoting.votes);
    } catch (e) {
      console.error(e);
    }

    setUsersForVoting(usersForVotingForState);
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
  votes: PlusVoteFromFE[];
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
  votes: PlusVoteFromFE[];
}) {
  const { month, year } = nextNonCompletedVoting(new Date());

  invariant(usersForVoting);
  const toLocalStorage: VotingLocalStorageData = {
    month,
    year,
    votes,
    usersForVotingOrder: Object.fromEntries(
      usersForVoting.map(({ user }, i) => [user.id, i])
    ),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toLocalStorage));
}
