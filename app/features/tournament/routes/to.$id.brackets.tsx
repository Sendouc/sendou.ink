import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import * as React from "react";
import styles from "../brackets-viewer.css";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import { idFromParams } from "../tournament-utils";
import { Alert } from "~/components/Alert";
import { SubmitButton } from "~/components/SubmitButton";
import { getTournamentManager } from "../brackets-manager";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";

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

// xxx: validate can perform this action
// xxx: not a transaction so maybe getting lock on db would be most correct
// xxx: cascasde delete in DB?
export const action: ActionFunction = async ({ params }) => {
  const manager = getTournamentManager("SQL");

  const tournamentId = idFromParams(params);

  // xxx: function to get name and get type
  await manager.create({
    tournamentId,
    name: "Elimination stage",
    type: "double_elimination",
    seeding: fillWithNullTillPowerOfTwo(
      findTeamsByTournamentId(tournamentId).map((team) => team.name)
    ),
    settings: { grandFinal: "double" },
  });

  return null;
};

export const loader = async ({ params }: LoaderArgs) => {
  const tournamentId = idFromParams(params);

  const hasStarted = hasTournamentStarted(tournamentId);
  const manager = getTournamentManager(hasStarted ? "SQL" : "IN_MEMORY");

  if (!hasStarted) {
    await manager.create({
      tournamentId,
      name: "Elimination stage",
      type: "double_elimination",
      seeding: fillWithNullTillPowerOfTwo(
        findTeamsByTournamentId(tournamentId).map((team) => team.name)
      ),
      settings: { grandFinal: "double" },
    });
  }

  const data = await manager.get.tournamentData(tournamentId);

  return {
    bracket: data,
    hasStarted,
  };
};

export default function TournamentBracketsPage() {
  const data = useLoaderData<typeof loader>();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // @ts-expect-error TODO: type this
    window.bracketsViewer.render({
      stages: data.bracket.stage,
      matches: data.bracket.match,
      matchGames: data.bracket.match_game,
      participants: data.bracket.participant,
    });

    const element = ref.current;
    return () => {
      if (!element) return;

      element.innerHTML = "";
    };
  }, [data.bracket]);

  // xxx: show alert with controls if admin
  // xxx: show dialog that shows which teams are not included in bracket due to lacking players or not being checked in
  // xxx: button inside alert not responsive, should it be in its own component?
  return (
    <div>
      {!data.hasStarted ? (
        <Form method="post">
          {false ? (
            <Alert variation="INFO" alertClassName="w-max">
              This bracket is a preview and subject to change
            </Alert>
          ) : (
            <Alert
              variation="INFO"
              alertClassName="w-max"
              textClassName="stack horizontal sm items-center"
            >
              When everything looks good, finalize the bracket to start the
              tournament{" "}
              <SubmitButton variant="outlined" size="tiny">
                Finalize
              </SubmitButton>
            </Alert>
          )}
        </Form>
      ) : null}
      <div className="brackets-viewer" ref={ref}></div>
    </div>
  );
}

// xxx: move to utils with testing
function fillWithNullTillPowerOfTwo(teams: string[]) {
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(teams.length)));
  const nullsToAdd = nextPowerOfTwo - teams.length;

  return [...teams, ...new Array(nullsToAdd).fill(null)];
}
