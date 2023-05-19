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
import {
  tournamentBracketsSubscribePage,
  tournamentMatchPage,
} from "~/utils/urls";
import type { TournamentLoaderData } from "../../tournament/routes/to.$id";
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
import clsx from "clsx";
import { LinkButton } from "~/components/Button";

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
    teamsForBracketCount: teams.length,
  };
};

export default function TournamentBracketsPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const parentRouteData = useOutletContext<TournamentLoaderData>();

  const lessThanTwoTeamsRegistered = data.teamsForBracketCount < 2;

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
          tournamentMatchPage({
            eventId: parentRouteData.event.id,
            matchId: match.id,
          })
        );
      };
    }

    // @ts-expect-error - brackets-viewer is not typed
    window.bracketsViewer.render(
      {
        stages: data.bracket.stage,
        matches: data.bracket.match,
        matchGames: data.bracket.match_game,
        participants: data.bracket.participant,
      },
      {
        customRoundName: (info: any) => {
          if (info.groupType === "final-group" && info.roundNumber === 1) {
            return "Grand Finals";
          }
          if (info.groupType === "final-group" && info.roundNumber === 2) {
            return "Bracket Reset";
          }

          return undefined;
        },
        separatedChildCountLabel: true,
      }
    );

    // my beautiful hack to show seeds
    // clean up probably not needed as it's not harmful to append more than one
    appendStyleTagToHead(
      parentRouteData.teams
        .map(
          (team, i) => `
      [data-participant-id="${team.id}"] {
        --seed: "${i + 1}  ";
        --space-after-seed: ${i < 10 ? "6px" : "0px"};
      }
    `
        )
        .join("\n")
    );

    const element = ref.current;
    return () => {
      if (!element) return;

      element.innerHTML = "";
    };
  }, [
    data.bracket,
    navigate,
    parentRouteData,
    data.hasStarted,
    lessThanTwoTeamsRegistered,
  ]);

  const myTeam = parentRouteData.teams.find((team) =>
    team.members.some((m) => m.userId === user?.id)
  );

  return (
    <div>
      <AutoRefresher />
      {!data.hasStarted && !lessThanTwoTeamsRegistered ? (
        <Form method="post" className="stack items-center">
          {!canAdminTournament({ user, event: parentRouteData.event }) ? (
            <Alert
              variation="INFO"
              alertClassName="tournament-bracket__start-bracket-alert"
              textClassName="stack horizontal md items-center text-center"
            >
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
      {parentRouteData.hasStarted && myTeam ? (
        <TournamentProgressPrompt ownedTeamId={myTeam.id} />
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

function appendStyleTagToHead(content: string) {
  const head = document.head || document.getElementsByTagName("head")[0];
  const style = document.createElement("style");

  head.appendChild(style);

  style.type = "text/css";
  style.appendChild(document.createTextNode(content));
}

function useAutoRefresh() {
  const { revalidate } = useRevalidator();
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const lastEvent = useEventSource(
    tournamentBracketsSubscribePage(parentRouteData.event.id),
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

function TournamentProgressPrompt({ ownedTeamId }: { ownedTeamId: number }) {
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const data = useLoaderData<typeof loader>();

  const { progress, currentMatchId, currentOpponent } = (() => {
    let lowestStatus = Infinity;
    let currentMatchId: number | undefined;
    let currentOpponent: string | undefined;

    for (const match of data.bracket.match) {
      // BYE
      if (match.opponent1 === null || match.opponent2 === null) {
        continue;
      }

      if (
        (match.opponent1.id === ownedTeamId ||
          match.opponent2.id === ownedTeamId) &&
        lowestStatus > match.status
      ) {
        lowestStatus = match.status;
        currentMatchId = match.id;
        const otherTeam =
          match.opponent1.id === ownedTeamId
            ? match.opponent2
            : match.opponent1;
        currentOpponent = parentRouteData.teams.find(
          (team) => team.id === otherTeam.id
        )?.name;
      }
    }

    return { progress: lowestStatus, currentMatchId, currentOpponent };
  })();

  if (progress === Infinity) {
    console.error("Unexpected no status");
    return null;
  }

  if (progress === Status.Waiting) {
    return (
      <TournamentProgressContainer>
        <WaitingForMatchText />
      </TournamentProgressContainer>
    );
  }

  if (progress >= Status.Completed) {
    return (
      <TournamentProgressContainer>
        Thanks for playing in {parentRouteData.event.name}!
      </TournamentProgressContainer>
    );
  }

  if (!currentMatchId || !currentOpponent) {
    console.error("Unexpected no match id or opponent");
    return null;
  }

  return (
    <TournamentProgressContainer>
      Current opponent: {currentOpponent}
      <LinkButton
        to={tournamentMatchPage({
          matchId: currentMatchId,
          eventId: parentRouteData.event.id,
        })}
        size="tiny"
        variant="outlined"
      >
        View
      </LinkButton>
    </TournamentProgressContainer>
  );
}

function TournamentProgressContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="stack items-center">
      <div className="tournament-bracket__progress">{children}</div>
    </div>
  );
}

function WaitingForMatchText() {
  const [showDot, setShowDot] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowDot((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div>
      Waiting for match..
      <span className={clsx({ invisible: !showDot })}>.</span>
    </div>
  );
}
