import type { LoaderArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { db } from "~/db";
import { notFoundIfFalsy } from "~/utils/remix";

export type TournamentToolsLoaderData = typeof loader;

export const loader = ({ params }: LoaderArgs) => {
  const eventId = params["identifier"]!;

  return {
    event: notFoundIfFalsy(db.tournaments.findByIdentifier(eventId)),
    tieBreakerMapPool:
      db.calendarEvents.findTieBreakerMapPoolByEventId(eventId),
  };
};

export default function TournamentToolsLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
