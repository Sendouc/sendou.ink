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
  useRevalidator,
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
import { toToolsBracketsSubscribePage, toToolsMatchPage } from "~/utils/urls";
import type { TournamentToolsLoaderData } from "../../tournament/routes/to.$id";
import { resolveBestOfs } from "../core/bestOf.server";
import { findAllMatchesByTournamentId } from "../queries/findAllMatchesByTournamentId.server";
import { setBestOf } from "../queries/setBestOf.server";
import { canAdminTournament } from "~/permissions";
import { requireUser, useUser } from "~/modules/auth";
import { tournamentIdFromParams } from "~/features/tournament";
import {
  bracketSubscriptionKey,
  fillWithNullTillPowerOfTwo,
  resolveTournamentStageName,
  resolveTournamentStageSettings,
  resolveTournamentStageType,
} from "../tournament-bracket-utils";
import { sql } from "~/db/sql";
import { useEventSource } from "remix-utils";
import { Status } from "~/db/types";
import { checkInHasStarted, teamHasCheckedIn } from "~/features/tournament";

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

  let teams = findTeamsByTournamentId(tournamentId);
  if (checkInHasStarted(tournament)) {
    teams = teams.filter(teamHasCheckedIn);
  }

  validate(teams.length >= 2, "Not enough teams registered");

  sql.transaction(() => {
    manager.create({
      tournamentId,
      name: resolveTournamentStageName(tournament.format),
      type: resolveTournamentStageType(tournament.format),
      seeding: fillWithNullTillPowerOfTwo(teams.map((team) => team.name)),
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

  let teams = findTeamsByTournamentId(tournamentId);
  if (checkInHasStarted(tournament)) {
    teams = teams.filter(teamHasCheckedIn);
  }

  if (!hasStarted && teams.length >= 2) {
    manager.create({
      tournamentId,
      name: resolveTournamentStageName(tournament.format),
      type: resolveTournamentStageType(tournament.format),
      seeding: fillWithNullTillPowerOfTwo(teams.map((team) => team.name)),
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

  const lessThanTwoTeamsRegistered = parentRouteData.teams.length < 2;

  React.useEffect(() => {
    if (lessThanTwoTeamsRegistered) return;

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
  }, [
    data.bracket,
    navigate,
    parentRouteData.event.id,
    data.hasStarted,
    lessThanTwoTeamsRegistered,
  ]);

  // TODO: show floating prompt if active match
  return (
    <div>
      <AutoRefresher />
      {!data.hasStarted && !lessThanTwoTeamsRegistered ? (
        <Form method="post" className="stack items-center">
          {!canAdminTournament({ user, event: parentRouteData.event }) ? (
            <Alert variation="INFO" alertClassName="w-max">
              This bracket is a preview and subject to change
            </Alert>
          ) : (
            <Alert
              variation="INFO"
              alertClassName="tournament-bracket__start-bracket-alert"
              textClassName="stack horizontal md items-center"
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
      {lessThanTwoTeamsRegistered ? (
        <div className="text-center text-lg font-semi-bold text-lighter">
          Bracket will be shown here when at least 2 teams have registered
        </div>
      ) : null}
    </div>
  );
}

// TODO: don't render this guy if tournament is over
function AutoRefresher() {
  useAutoRefresh();

  return null;
}

function useAutoRefresh() {
  const { revalidate } = useRevalidator();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const lastEvent = useEventSource(
    toToolsBracketsSubscribePage(parentRouteData.event.id),
    {
      event: bracketSubscriptionKey(parentRouteData.event.id),
    }
  );

  React.useEffect(() => {
    if (!lastEvent) return;

    const [matchIdRaw, scoreOneRaw, scoreTwoRaw, isOverRaw] =
      lastEvent.split("-");
    const matchId = Number(matchIdRaw);
    const scoreOne = Number(scoreOneRaw);
    const scoreTwo = Number(scoreTwoRaw);
    const isOver = isOverRaw === "true";

    if (isOver) {
      // bracketsViewer.updateMatch can't advance bracket
      // so we revalidate loader when the match is over
      revalidate();
    } else {
      // @ts-expect-error - brackets-viewer is not typed
      window.bracketsViewer.updateMatch({
        id: matchId,
        opponent1: {
          score: scoreOne,
        },
        opponent2: {
          score: scoreTwo,
        },
        status: Status.Running,
      });
    }
  }, [lastEvent, revalidate]);
}
