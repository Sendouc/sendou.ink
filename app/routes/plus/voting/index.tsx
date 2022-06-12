import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { formatDistance } from "date-fns";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { RelativeTime } from "~/components/RelativeTime";
import { db } from "~/db";
import type { UsersForVoting } from "~/db/models/plusVotes.server";
import { getUser, requireUser } from "~/modules/auth";
import {
  monthsVotingRange,
  PlusVote,
  upcomingVoting,
  usePlusVoting,
} from "~/modules/plus-server";
import { isVotingActive } from "~/permissions";
import { discordFullName } from "~/utils/strings";
import { assertType, assertUnreachable } from "~/utils/types";
import { PlusSuggestionComments } from "../suggestions";
import * as React from "react";
import { z } from "zod";
import { safeJSONParse } from "~/utils/zod";
import { parseRequestFormData } from "~/utils/remix";

const voteSchema = z.object({
  userId: z.number(),
  score: z.number().refine((val) => [-1, 1].includes(val)),
});

assertType<z.infer<typeof voteSchema>, PlusVote>();

const votingActionSchema = z.object({
  votes: z.preprocess(safeJSONParse, z.array(voteSchema)),
});

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: votingActionSchema,
  });

  console.log({ data });

  return null;
};

type PlusVotingLoaderData =
  // voting is not active OR user is not eligible to vote
  | {
      type: "timeInfo";
      relativeTime: string;
      timestamp: number;
      timing: "starts" | "ends";
    }
  // user can vote
  | {
      type: "voting";
      usersForVoting: UsersForVoting;
    }
  // user already voted
  | { type: "votingInfo"; votingInfo: { placeholder: true } };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const now = new Date();
  const { startDate, endDate } = monthsVotingRange(upcomingVoting(now));
  if (!isVotingActive()) {
    return json<PlusVotingLoaderData>({
      type: "timeInfo",
      relativeTime: formatDistance(startDate, now, { addSuffix: true }),
      timestamp: startDate.getTime(),
      timing: "starts",
    });
  }

  const usersForVoting = db.plusVotes.usersForVoting(user);

  if (!usersForVoting) {
    return json<PlusVotingLoaderData>({
      type: "timeInfo",
      relativeTime: formatDistance(endDate, now, { addSuffix: true }),
      timestamp: endDate.getTime(),
      timing: "ends",
    });
  }

  return json<PlusVotingLoaderData>({
    type: "voting",
    usersForVoting,
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
    case "votingInfo": {
      return null;
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
    <div className="text-sm text-center">
      {data.timing === "starts"
        ? "Next voting starts"
        : "Voting is currently happening. Ends"}{" "}
      <RelativeTime timestamp={data.timestamp}>
        {data.relativeTime}
      </RelativeTime>
    </div>
  );
}

const tips = [
  "Voting progress is saved locally",
  "Use left and right arrows on desktop to vote",
  "You +1 yourself automatically",
];

function Voting(data: Extract<PlusVotingLoaderData, { type: "voting" }>) {
  const [randomTip] = React.useState(tips[Math.floor(Math.random() * 3)]);
  const { currentUser, previous, votes, vote, undoLast, isReady, progress } =
    usePlusVoting(data.usersForVoting);

  if (!isReady) return null;

  return (
    <div className="plus-voting__container stack md">
      {progress ? (
        <progress
          className="plus-voting__progress"
          value={progress[0]}
          max={progress[1]}
          title={`Voting progress ${progress[0]} out of ${progress[1]}`}
        />
      ) : null}
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
              onClick={() => vote("downvote")}
            >
              -1
            </Button>
            <Button
              className="plus-voting__vote-button"
              variant="outlined"
              onClick={() => vote("upvote")}
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
