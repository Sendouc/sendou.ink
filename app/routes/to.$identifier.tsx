import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { db } from "~/db";
import { getUser } from "~/modules/auth";
import { notFoundIfFalsy } from "~/utils/remix";

export type TournamentToolsLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);
  const eventId = params["identifier"]!;

  const event = notFoundIfFalsy(db.tournaments.findByIdentifier(eventId));
  const teams = db.tournaments.findTeamsByEventId(event.id);
  const ownTeam = teams.find((team) =>
    team.members.some((m) => m.userId === user?.id)
  );

  return {
    event,
    tieBreakerMapPool:
      db.calendarEvents.findTieBreakerMapPoolByEventId(eventId),
    teams,
    ownTeam,
  };
};

export default function TournamentToolsLayout() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet context={data} />
    </>
  );
}
