import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { formatDistance } from "date-fns";
import { RelativeTime } from "~/components/RelativeTime";
import { db } from "~/db";
import type { UsersForVoting } from "~/db/models/plusVotes.server";
import { getUser } from "~/modules/auth";
import { monthsVotingRange, upcomingVoting } from "~/modules/plus-server";
import { isVotingActive } from "~/permissions";

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
      usersForVoting?: UsersForVoting;
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

  if (data.type === "timeInfo") {
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

  return null;
}
