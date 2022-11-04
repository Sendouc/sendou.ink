import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { db } from "~/db";
import { getUser } from "~/modules/auth";
import { notFoundIfFalsy } from "~/utils/remix";
import { findOwnedTeam } from "~/utils/tournaments";

export type TournamentToolsLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);
  const eventId = params["identifier"]!;

  const event = notFoundIfFalsy(db.tournaments.findByIdentifier(eventId));
  const teams = db.tournaments.findTeamsByEventId(event.id);

  return {
    event,
    tieBreakerMapPool:
      db.calendarEvents.findTieBreakerMapPoolByEventId(eventId),
    teams,
    ownTeam: findOwnedTeam({ userId: user?.id, teams }),
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
