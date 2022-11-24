import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useLocation,
  useMatches,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { EditIcon } from "~/components/icons/Edit";
import Modal from "~/components/Modal";
import { FancyStageBanner } from "~/components/tournament/FancyStageBanner";
import { TeamRosterInputs } from "~/components/tournament/TeamRosterInputs";
import { newResultChangesWinner } from "~/core/tournament/bracket";
import { canEditMatchResults } from "~/core/tournament/validators";
import { useUser } from "~/hooks/common";
import * as TournamentMatch from "~/models/TournamentMatch.server";
import { bracketById } from "~/services/bracket";
import {
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import styles from "~/styles/tournament-match.css";
import {
  getSocket,
  parseRequestFormData,
  requireUser,
  safeJSONParse,
  Unpacked,
  validate,
} from "~/utils";
import {
  reportedMatchPlayerIds,
  reportedMatchPositions,
} from "~/utils/schemas";
import * as React from "react";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { BracketData } from "~/hooks/useBracketDataWithEvents";
import { TeamOrder } from "@prisma/client";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export type BracketMatchAction = z.infer<typeof bracketMatchActionSchema>;
const bracketMatchActionSchema = z.object({
  results: z.preprocess(
    safeJSONParse,
    z.array(
      z.object({
        winnerTeamId: z.string().uuid().nullish(),
        position: reportedMatchPositions,
        playerIds: reportedMatchPlayerIds,
      })
    )
  ),
});

const matchParamsSchema = z.object({
  organization: z.string(),
  tournament: z.string(),
  bid: z.string(),
  num: z.preprocess(Number, z.number()),
});

// - if match has concluded admin can edit score
// - can't edit to change winner if would cause more than 2 match resets
export const action: ActionFunction = async ({ params, request, context }) => {
  const user = requireUser(context);
  const data = await parseRequestFormData({
    request,
    schema: bracketMatchActionSchema,
  });
  const socket = getSocket(context);
  const {
    organization: organizationNameForUrl,
    tournament: tournamentNameForUrl,
    bid: bracketId,
    num: matchNumber,
  } = matchParamsSchema.parse(params);
  const [match, tournament, bracket] = await Promise.all([
    TournamentMatch.findInfoForModal({
      bracketId,
      matchNumber,
    }),
    findTournamentByNameForUrl({
      organizationNameForUrl,
      tournamentNameForUrl,
    }),
    bracketById(bracketId),
  ]);
  invariant(match, "!match");

  validate(
    canEditMatchResults({
      userId: user?.id,
      tournamentConcluded: tournament.concluded,
      organization: tournament.organizer,
      match: { score: match.score, bestOf: match.bestOf },
    }),
    "Can't edit match"
  );

  // in future we could change the scores and adjust bracket directly but now
  // for simplicity we just reset the related matches and let people to rereport those
  if (
    newResultChangesWinner({
      oldResults: match.matchInfos,
      newResults: data.results,
    })
  ) {
    // check if affected would only be this match + 2 others or fail
    // on related matches delete these teams, reset score
    // on this match reset score
    throw new Error("Not implemented");
  } else {
    const newResults = data.results
      .filter((s) => s.winnerTeamId)
      .map((stage) => {
        const stageInBracket = bracket.rounds
          .flatMap((round) =>
            round.matches.flatMap((match) => ({
              matchId: match.id,
              stages: round.stages,
            }))
          )
          .find((matchWithStages) => matchWithStages.matchId === match.id)
          ?.stages.find((stageInArr) => stageInArr.position === stage.position);
        invariant(stageInBracket, "!stageInBracket");

        return {
          UNSAFE_playerIds: stage.playerIds,
          roundStageId: stageInBracket.id,
          winnerOrder: (match.matchInfos[0].teamUpper.id === stage.winnerTeamId
            ? "UPPER"
            : "LOWER") as TeamOrder,
        };
      });

    await TournamentMatch.updateResults({
      matchId: match.id,
      reporterId: user.id,
      newResults,
    });

    const bracketData: BracketData = [
      {
        number: matchNumber,
        score: newResults.reduce(
          (acc: [number, number], result) => {
            acc[result.winnerOrder === "UPPER" ? 0 : 1]++;

            return acc;
          },
          [0, 0]
        ),
        participants: undefined,
      },
    ];

    socket.emit(`bracket-${bracketId}`, bracketData);
  }

  return null;
};

type MatchLoaderData = {
  match: NonNullable<TournamentMatch.FindInfoForModal>;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { bid: bracketId, num: matchNumber } = matchParamsSchema.parse(params);

  const match = await TournamentMatch.findInfoForModal({
    bracketId,
    matchNumber,
  });
  if (!match) throw new Response("No match found", { status: 404 });

  return json<MatchLoaderData>({ match });
};

export default function MatchModal() {
  const { match } = useLoaderData<MatchLoaderData>();
  const location = useLocation();
  const [editEnabled, setEditEnabled] = React.useState(false);
  const [results, setResults] = React.useState<BracketMatchAction["results"]>(
    match.matchInfos.map((matchInfo, i) => ({
      playerIds: [
        ...matchInfo.teamLower.members.map(preCheckPlayerIfNoSubs),
        ...matchInfo.teamUpper.members.map(preCheckPlayerIfNoSubs),
      ]
        .filter((m) => m.member.played)
        .map((m) => m.member.id),
      position: i + 1,
      winnerTeamId: matchInfo.winnerId,
    }))
  );

  return (
    <Modal
      title={
        <div>
          <span className="tournament-match-modal__vs-title">
            {match.title}
          </span>{" "}
          <span className="tournament-match-modal__score-title">
            {match.scoreTitle}
          </span>
        </div>
      }
      closeUrl={location.pathname.split("/match")[0]}
    >
      <div className="flex items-center gap-4">
        <h4 className="tournament-match-modal__round-name">
          {match.roundName}
        </h4>
        <EditResults
          results={results}
          editEnabled={editEnabled}
          setEditEnabled={setEditEnabled}
        />
      </div>
      <div className="tournament-match-modal__rounds">
        {!editEnabled
          ? match.matchInfos
              .filter((matchInfo) => matchInfo.winnerId)
              .map((matchInfo, i) => {
                return (
                  <div
                    className="tournament-match-modal__round"
                    key={matchInfo.idForFrontend}
                  >
                    <FancyStageBanner
                      stage={matchInfo.stage}
                      roundNumber={i + 1}
                    />
                    <TeamRosterInputs
                      teamUpper={matchInfo.teamUpper}
                      teamLower={matchInfo.teamLower}
                      checkedPlayers={matchInfoToCheckedPlayers(matchInfo)}
                      winnerId={matchInfo.winnerId}
                      presentational
                    />
                  </div>
                );
              })
          : null}
        {editEnabled
          ? results.map((result, i) => {
              const matchInfo = match.matchInfos[i];
              invariant(matchInfo, "!matchInfo");

              return (
                <div
                  className="tournament-match-modal__round"
                  key={matchInfo.idForFrontend}
                >
                  <FancyStageBanner
                    stage={matchInfo.stage}
                    roundNumber={i + 1}
                  />
                  <TeamRosterInputs
                    teamUpper={matchInfo.teamUpper}
                    teamLower={matchInfo.teamLower}
                    checkedPlayers={resultToCheckedPlayers(
                      matchInfo,
                      result.playerIds
                    )}
                    setCheckedPlayers={(newPlayers) => {
                      setResults(
                        results.map((result, resultI) =>
                          resultI !== i
                            ? result
                            : { ...result, playerIds: newPlayers.flat() }
                        )
                      );
                    }}
                    setWinnerId={(newWinnerId) => {
                      setResults(
                        results.map((result, resultI) =>
                          resultI !== i
                            ? result
                            : { ...result, winnerTeamId: newWinnerId }
                        )
                      );
                    }}
                    winnerId={result.winnerTeamId}
                  />
                </div>
              );
            })
          : null}
      </div>
    </Modal>
  );
}

function EditResults({
  results,
  editEnabled,
  setEditEnabled,
}: {
  results: BracketMatchAction["results"];
  editEnabled: boolean;
  setEditEnabled: (enabled: boolean) => void;
}) {
  const { match } = useLoaderData<MatchLoaderData>();
  const user = useUser();
  const [, parentRoute] = useMatches();
  const transition = useTransition();

  React.useEffect(() => {
    if (transition.type !== "actionReload") return;
    setEditEnabled(false);
  }, [setEditEnabled, transition.type]);

  const tournament = parentRoute.data as FindTournamentByNameForUrlI;

  if (
    !canEditMatchResults({
      userId: user?.id,
      tournamentConcluded: tournament.concluded,
      organization: tournament.organizer,
      match: { score: match.score, bestOf: match.bestOf },
    })
  ) {
    return null;
  }

  if (!editEnabled) {
    return (
      <Button
        onClick={() => setEditEnabled(true)}
        type="button"
        variant="outlined"
        icon={<EditIcon />}
        tiny
      >
        Edit result
      </Button>
    );
  }

  const newResultsErrorMsg = () => {
    const parsed = bracketMatchActionSchema.safeParse({
      results: results.filter((res) => res.winnerTeamId),
    });

    // should be the only thing that can go wrong here
    if (!parsed.success) return "Each team in each map needs to have 4 players";

    const scores: Record<string, number> = {};
    let matchConcluded = false;
    for (const result of results) {
      if (!result.winnerTeamId) continue;

      if (matchConcluded) return "Too many maps reported";

      if (!scores[result.winnerTeamId]) scores[result.winnerTeamId] = 0;
      scores[result.winnerTeamId]++;

      const winsRequiredToTakeTheSet = Math.ceil(match.bestOf / 2);
      if (scores[result.winnerTeamId] === winsRequiredToTakeTheSet) {
        matchConcluded = true;
      }
    }
    if (!matchConcluded) return "Not enough maps reported";
  };

  if (newResultsErrorMsg()) {
    return (
      <div className="tournament-match-modal__error-msg">
        {newResultsErrorMsg()}
      </div>
    );
  }

  if (
    newResultChangesWinner({
      oldResults: match.matchInfos,
      newResults: results,
    })
  ) {
    return (
      <p className="tournament-match-modal__reset-match-msg button-text-paragraph">
        Changing the winner of the set. Reset the related matches so they can be
        re-reported by the teams?{" "}
        <Button variant="minimal-success" tiny>
          Reset matches
        </Button>
      </p>
    );
  }

  return (
    <Form method="post" className="flex items-center gap-2">
      <input
        type="hidden"
        name="results"
        value={JSON.stringify(results.filter((res) => res.winnerTeamId))}
      />
      <Button type="submit" variant="outlined-success" tiny>
        Save
      </Button>
      <Button
        type="button"
        variant="outlined"
        tiny
        onClick={() => setEditEnabled(false)}
      >
        Cancel
      </Button>
    </Form>
  );
}

function matchInfoToCheckedPlayers(
  matchInfo: Unpacked<
    NonNullable<TournamentMatch.FindInfoForModal>["matchInfos"]
  >
): [string[], string[]] {
  return [
    matchInfo.teamUpper.members
      .filter((m) => m.member.played)
      .map((m) => m.member.id),
    matchInfo.teamLower.members
      .filter((m) => m.member.played)
      .map((m) => m.member.id),
  ];
}

function resultToCheckedPlayers(
  matchInfo: Unpacked<
    NonNullable<TournamentMatch.FindInfoForModal>["matchInfos"]
  >,
  playerIds: string[]
): [string[], string[]] {
  return [
    matchInfo.teamUpper.members
      .filter((m) => playerIds.includes(m.member.id))
      .map((m) => m.member.id),
    matchInfo.teamLower.members
      .filter((m) => playerIds.includes(m.member.id))
      .map((m) => m.member.id),
  ];
}

function preCheckPlayerIfNoSubs(
  member: Unpacked<
    Unpacked<MatchLoaderData["match"]["matchInfos"]>["teamUpper"]["members"]
  >,
  _: number,
  roster: unknown[]
): Unpacked<
  Unpacked<MatchLoaderData["match"]["matchInfos"]>["teamUpper"]["members"]
> {
  return roster.length === TOURNAMENT_TEAM_ROSTER_MIN_SIZE
    ? { member: { ...member.member, played: true } }
    : member;
}
