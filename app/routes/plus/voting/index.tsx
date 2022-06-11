import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/db";
import type { UsersForVoting } from "~/db/models/plusVotes.server";
import { getUser } from "~/modules/auth";
import { monthsVotingRange, upcomingVoting } from "~/modules/plus-server";

interface PlusVotingLoaderData {
  usersForVoting?: UsersForVoting;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  return json<PlusVotingLoaderData>({
    usersForVoting: db.plusVotes.usersForVoting(user),
  });
};

export default function PlusVotingPage() {
  const data = useLoaderData();

  return <NextVotingInfo />;
}

function NextVotingInfo() {
  return (
    <div className="text-sm text-center">
      Next voting starts{" "}
      {monthsVotingRange(upcomingVoting(new Date())).startDate.toLocaleString(
        "en-US"
      )}
    </div>
  );
}
