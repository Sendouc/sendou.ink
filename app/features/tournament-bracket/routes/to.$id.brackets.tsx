import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import * as React from "react";
import bracketViewerStyles from "../brackets-viewer.css";
import bracketStyles from "../tournament-bracket.css";
import { findTeamsByTournamentId } from "../../tournament/queries/findTeamsByTournamentId.server";
import { Alert } from "~/components/Alert";
import { SubmitButton } from "~/components/SubmitButton";
import { getTournamentManager } from "../core/brackets-manager";
import hasTournamentStarted from "../../tournament/queries/hasTournamentStarted.server";
import { findByIdentifier } from "../../tournament/queries/findByIdentifier.server";
import { notFoundIfFalsy, validate } from "~/utils/remix";
import { toToolsMatchPage } from "~/utils/urls";
import type { TournamentToolsLoaderData } from "../../tournament/routes/to.$id";
import { resolveBestOfs } from "../core/bestOf.server";
import { findAllMatchesByTournamentId } from "../queries/findAllMatchesByTournamentId.server";
import { setBestOf } from "../queries/setBestOf.server";
import { canAdminTournament } from "~/permissions";
import { requireUser, useUser } from "~/modules/auth";
import { tournamentIdFromParams } from "~/features/tournament";
import {
  resolveTournamentStageName,
  resolveTournamentStageSettings,
  resolveTournamentStageType,
} from "../tournament-bracket-utils";
import { sql } from "~/db/sql";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/brackets-viewer@latest/dist/brackets-viewer.min.css",
    },
    {
      rel: "stylesheet",
      href: bracketViewerStyles,
    },
    {
      rel: "stylesheet",
      href: bracketStyles,
    },
  ];
};

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const manager = getTournamentManager("SQL");

  const tournamentId = tournamentIdFromParams(params);
  const tournament = notFoundIfFalsy(findByIdentifier(tournamentId));
  const hasStarted = hasTournamentStarted(tournamentId);

  validate(canAdminTournament({ user, event: tournament }));
  validate(!hasStarted);

  sql.transaction(() => {
    manager.create({
      tournamentId,
      name: resolveTournamentStageName(tournament.format),
      type: resolveTournamentStageType(tournament.format),
      seeding: fillWithNullTillPowerOfTwo(
        findTeamsByTournamentId(tournamentId).map((team) => team.name)
      ),
      settings: resolveTournamentStageSettings(tournament.format),
    });

    const bestOfs = resolveBestOfs(findAllMatchesByTournamentId(tournamentId));
    for (const [bestOf, id] of bestOfs) {
      setBestOf({ bestOf, id });
    }
  })();

  return null;
};

export const loader = ({ params }: LoaderArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const tournament = notFoundIfFalsy(findByIdentifier(tournamentId));

  const hasStarted = hasTournamentStarted(tournamentId);
  const manager = getTournamentManager(hasStarted ? "SQL" : "IN_MEMORY");

  if (!hasStarted) {
    manager.create({
      tournamentId,
      name: resolveTournamentStageName(tournament.format),
      type: resolveTournamentStageType(tournament.format),
      seeding: fillWithNullTillPowerOfTwo(
        findTeamsByTournamentId(tournamentId).map((team) => team.name)
      ),
      settings: resolveTournamentStageSettings(tournament.format),
    });
  }

  // TODO: use get.stageData
  const data = manager.get.tournamentData(tournamentId);

  return {
    bracket: data,
    hasStarted,
  };
};

export default function TournamentBracketsPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  React.useEffect(() => {
    // matches aren't generated before tournament starts
    if (data.hasStarted) {
      // @ts-expect-error - brackets-viewer is not typed
      window.bracketsViewer.onMatchClicked = (match) => {
        // can't view match page of a bye
        if (match.opponent1 === null || match.opponent2 === null) {
          return;
        }
        navigate(
          toToolsMatchPage({
            eventId: parentRouteData.event.id,
            matchId: match.id,
          })
        );
      };
    }
    // @ts-expect-error - brackets-viewer is not typed
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
  }, [data.bracket, navigate, parentRouteData.event.id, data.hasStarted]);

  // xxx: show dialog that shows which teams are not included in bracket due to lacking players or not being checked in
  // xxx: button inside alert not responsive, should it be in its own component?
  // xxx: show floating prompt if active match
  return (
    <div>
      {!data.hasStarted ? (
        <Form method="post">
          {!canAdminTournament({ user, event: parentRouteData.event }) ? (
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
