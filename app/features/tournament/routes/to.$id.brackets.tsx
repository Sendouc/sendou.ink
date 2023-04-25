import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BracketsManager } from "brackets-manager";
import { InMemoryDatabase } from "brackets-memory-db";
import * as React from "react";
import styles from "../brackets-viewer.css";
import { findTeamsByEventId } from "../queries/findTeamsByEventId.server";
import { idFromParams } from "../tournament-utils";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/brackets-viewer@latest/dist/brackets-viewer.min.css",
    },
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const loader = async ({ params }: LoaderArgs) => {
  const storage = new InMemoryDatabase();
  const manager = new BracketsManager(storage);

  const eventId = idFromParams(params);

  await manager.create({
    tournamentId: 3,
    name: "Elimination stage",
    type: "double_elimination",
    seeding: fillWithNullTillPowerOfTwo(
      findTeamsByEventId(eventId).map((team) => team.name)
    ),
    settings: { grandFinal: "double" },
  });

  const data = await manager.get.tournamentData(3);

  return {
    bracketData: data,
  };
};

export default function TournamentBracketsPage() {
  const { bracketData } = useLoaderData<typeof loader>();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // @ts-expect-error TODO: type this
    window.bracketsViewer.render({
      stages: bracketData.stage,
      matches: bracketData.match,
      matchGames: bracketData.match_game,
      participants: bracketData.participant,
    });

    const element = ref.current;
    return () => {
      if (!element) return;

      element.innerHTML = "";
    };

    // TODO: do we need to return and clear the container?
  }, [bracketData]);

  return <div className="brackets-viewer" ref={ref}></div>;
}

function fillWithNullTillPowerOfTwo(teams: string[]) {
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(teams.length)));
  const nullsToAdd = nextPowerOfTwo - teams.length;

  return [...teams, ...new Array(nullsToAdd).fill(null)];
}
