import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { formatDistance } from "date-fns";
import * as React from "react";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { RelativeTime } from "~/components/RelativeTime";
import { PLUS_DOWNVOTE, PLUS_UPVOTE } from "~/constants";
import { db } from "~/db";
import type { UsersForVoting } from "~/db/models/plusVotes.server";
import { getUser, requireUser } from "~/modules/auth";
import type { PlusVoteFromFE } from "~/modules/plus-server";
import {
  monthsVotingRange,
  nextNonCompletedVoting,
  usePlusVoting,
} from "~/modules/plus-server";
import { isVotingActive } from "~/permissions";
import { parseRequestFormData } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { discordFullName } from "~/utils/strings";
import { assertType, assertUnreachable } from "~/utils/types";
import { safeJSONParse } from "~/utils/zod";
import { PlusSuggestionComments } from "../suggestions";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Plus Server voting"),
  };
};

const voteSchema = z.object({
  votedId: z.number(),
  score: z.number().refine((val) => [PLUS_DOWNVOTE, PLUS_UPVOTE].includes(val)),
});

assertType<z.infer<typeof voteSchema>, PlusVoteFromFE>();

const votingActionSchema = z.object({
  votes: z.preprocess(safeJSONParse, z.array(voteSchema)),
});

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: votingActionSchema,
  });

  if (!isVotingActive()) {
    throw new Response(null, { status: 400 });
  }
  const usersForVoting = db.plusVotes.usersForVoting(user);
  validateVotes({ votes: data.votes, usersForVoting });

  // freebie +1 for yourself if you vote
  const votesForDb = [...data.votes].concat({
    votedId: user.id,
    score: PLUS_UPVOTE,
  });

  const { month, year } = nextNonCompletedVoting(new Date());
  const { endDate } = monthsVotingRange({ month, year });
  db.plusVotes.upsertMany(
    votesForDb.map((vote) => ({
      ...vote,
      authorId: user.id,
      month,
      year,
      tier: user.plusTier!, // no clue why i couldn't make narrowing the type down above work
      validAfter: endDate,
    }))
  );

  return null;
};

function validateVotes({
  votes,
  usersForVoting,
}: {
  votes: PlusVoteFromFE[];
  usersForVoting?: UsersForVoting;
}) {
  if (!usersForVoting) throw new Response(null, { status: 400 });

  // converting it to set also handles the check for duplicate ids
  const votedUserIds = new Set(votes.map((v) => v.votedId));

  if (votedUserIds.size !== usersForVoting.length) {
    throw new Response(null, { status: 400 });
  }

  for (const { user } of usersForVoting) {
    if (!votedUserIds.has(user.id)) {
      throw new Response(null, { status: 400 });
    }
  }
}

type PlusVotingLoaderData =
  // voting is not active OR user is not eligible to vote
  | {
      type: "timeInfo";
      voted?: boolean;
      timeInfo: {
        timestamp: number;
        timing: "starts" | "ends";
        relativeTime: string;
      };
    }
  // user can vote
  | {
      type: "voting";
      usersForVoting: UsersForVoting;
      votingEnds: {
        timestamp: number;
        relativeTime: string;
      };
    };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const now = new Date();
  const { startDate, endDate } = monthsVotingRange(nextNonCompletedVoting(now));
  if (!isVotingActive()) {
    return json<PlusVotingLoaderData>({
      type: "timeInfo",
      timeInfo: {
        relativeTime: formatDistance(startDate, now, { addSuffix: true }),
        timestamp: startDate.getTime(),
        timing: "starts",
      },
    });
  }

  const usersForVoting = db.plusVotes.usersForVoting(user);
  const hasVoted = db.plusVotes.hasVoted({
    user,
    ...nextNonCompletedVoting(new Date()),
  });

  if (!usersForVoting || hasVoted) {
    return json<PlusVotingLoaderData>({
      type: "timeInfo",
      voted: hasVoted,
      timeInfo: {
        relativeTime: formatDistance(endDate, now, { addSuffix: true }),
        timestamp: endDate.getTime(),
        timing: "ends",
      },
    });
  }

  return json<PlusVotingLoaderData>({
    type: "voting",
    usersForVoting,
    votingEnds: {
      timestamp: endDate.getTime(),
      relativeTime: formatDistance(endDate, now, { addSuffix: true }),
    },
  });
};

export default function PlusVotingPage() {
  const data = useLoaderData<PlusVotingLoaderData>();

  switch (data.type) {
    case "timeInfo": {
      return <VotingTimingInfo {...data} />;
    }
    case "voting": {
      return <Voting {...data} />;
    }
    default: {
      assertUnreachable(data);
    }
  }
}

function VotingTimingInfo(
  data: Extract<PlusVotingLoaderData, { type: "timeInfo" }>
) {
  return (
    <div className="stack md">
      {data.voted ? (
        <div className="plus-voting__alert">
          <CheckmarkIcon /> You have voted
        </div>
      ) : null}
      <div className="text-sm text-center">
        {data.timeInfo.timing === "starts"
          ? "Next voting starts"
          : "Voting is currently happening. Ends"}{" "}
        <RelativeTime timestamp={data.timeInfo.timestamp}>
          {data.timeInfo.relativeTime}
        </RelativeTime>
      </div>
    </div>
  );
}

const tips = [
  "Voting progress is saved locally",
  "Use S (-1) and K (+1) arrows on desktop to vote",
  "You +1 yourself automatically",
];

function Voting(data: Extract<PlusVotingLoaderData, { type: "voting" }>) {
  const [randomTip] = React.useState(tips[Math.floor(Math.random() * 3)]);
  const { currentUser, previous, votes, addVote, undoLast, isReady, progress } =
    usePlusVoting(data.usersForVoting);

  if (!isReady) return null;

  return (
    <div className="plus-voting__container stack md">
      <div className="stack xs">
        <div className="text-sm text-center">
          Voting ends{" "}
          <RelativeTime timestamp={data.votingEnds.timestamp}>
            {data.votingEnds.relativeTime}
          </RelativeTime>
        </div>
        {progress ? (
          <progress
            className="plus-voting__progress"
            value={progress[0]}
            max={progress[1]}
            title={`Voting progress ${progress[0]} out of ${progress[1]}`}
          />
        ) : null}
      </div>
      {previous ? (
        <p className="button-text-paragraph text-sm text-lighter">
          Previously{" "}
          <span className={previous.score > 0 ? "text-success" : "text-error"}>
            {previous.score > 0 ? "+" : ""}
            {previous.score}
          </span>{" "}
          on {discordFullName(previous.user)}.
          <Button className="ml-auto" variant="minimal" onClick={undoLast}>
            Undo?
          </Button>
        </p>
      ) : (
        <p className="text-sm text-lighter">Tip: {randomTip}</p>
      )}
      {currentUser ? (
        <div className="stack md items-center">
          <Avatar
            discordAvatar={currentUser.user.discordAvatar}
            discordId={currentUser.user.discordId}
            size="lg"
          />
          <h2>{discordFullName(currentUser.user)}</h2>
          <div className="stack vertical md">
            <Button
              className="plus-voting__vote-button downvote"
              variant="outlined"
              onClick={() => addVote("downvote")}
            >
              -1
            </Button>
            <Button
              className="plus-voting__vote-button"
              variant="outlined"
              onClick={() => addVote("upvote")}
            >
              +1
            </Button>
          </div>
          {currentUser.suggestions ? (
            <PlusSuggestionComments
              suggestions={currentUser.suggestions}
              defaultOpen
            />
          ) : null}
          {currentUser.user.bio ? (
            <article>{currentUser.user.bio}</article>
          ) : null}
        </div>
      ) : (
        <Form method="post">
          <input type="hidden" name="votes" value={JSON.stringify(votes)} />
          <Button className="plus-voting__submit-button" type="submit">
            Submit votes
          </Button>
        </Form>
      )}
    </div>
  );
}
