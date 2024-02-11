import * as React from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { TOURNAMENT } from "../../tournament/tournament-constants";
import { SubmitButton } from "~/components/SubmitButton";
import { TeamRosterInputs } from "./TeamRosterInputs";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { useTranslation } from "react-i18next";
import type { Result } from "./ScoreReporter";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import type { SerializeFrom } from "@remix-run/node";
import { stageImageUrl } from "~/utils/urls";
import { Image } from "~/components/Image";
import type { TournamentDataTeam } from "../core/Tournament.server";
import { useTournament } from "~/features/tournament/routes/to.$id";
import { matchIsLocked } from "../tournament-bracket-utils";

export function ScoreReporterRosters({
  teams,
  position,
  currentStageWithMode,
  result,
  scores,
  bestOf,
  presentational: _presentational,
}: {
  teams: [TournamentDataTeam, TournamentDataTeam];
  position: number;
  currentStageWithMode: TournamentMapListMap;
  result?: Result;
  scores: [number, number];
  bestOf: number;
  presentational?: boolean;
}) {
  const tournament = useTournament();
  const data = useLoaderData<TournamentMatchLoaderData>();
  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [number[], number[]]
  >(
    checkedPlayersInitialState({
      teamOneId: teams[0].id,
      teamTwoId: teams[1].id,
      players: data.match.players,
    }),
  );
  const [winnerId, setWinnerId] = React.useState<number | undefined>();
  const [points, setPoints] = React.useState<[number, number]>([0, 0]);

  const presentational = _presentational || Boolean(result);

  const newScore = [
    scores[0] + (winnerId === teams[0].id ? 1 : 0),
    scores[1] + (winnerId === teams[1].id ? 1 : 0),
  ];
  const wouldEndSet = newScore.some((score) => score > bestOf / 2);

  const showPoints = tournament.bracketByIdxOrDefault(
    tournament.matchIdToBracketIdx(data.match.id) ?? 0,
  ).collectResultsWithPoints;

  return (
    <Form method="post" className="width-full">
      <div>
        <TeamRosterInputs
          teams={teams}
          winnerId={winnerId}
          setWinnerId={setWinnerId}
          checkedPlayers={checkedPlayers}
          setCheckedPlayers={setCheckedPlayers}
          points={showPoints ? points : undefined}
          setPoints={setPoints}
          result={result}
        />
        {!presentational ? (
          <div className="tournament-bracket__during-match-actions__actions">
            <input type="hidden" name="winnerTeamId" value={winnerId ?? ""} />
            <input
              type="hidden"
              name="playerIds"
              value={JSON.stringify(checkedPlayers.flat())}
            />
            {showPoints ? (
              <input
                type="hidden"
                name="points"
                value={JSON.stringify(points)}
              />
            ) : null}
            <input type="hidden" name="position" value={position} />
            <ReportScoreButtons
              winnerIdx={winnerId ? winningTeamIdx() : undefined}
              points={showPoints ? points : undefined}
              checkedPlayers={checkedPlayers}
              winnerName={winningTeam()}
              currentStageWithMode={currentStageWithMode}
              wouldEndSet={wouldEndSet}
              matchLocked={matchIsLocked({
                matchId: data.match.id,
                scores: scores,
                tournament,
              })}
            />
          </div>
        ) : null}
        {!result && presentational ? (
          <div className="tournament-bracket__during-match-actions__actions">
            <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
              No permissions to report score
            </p>
          </div>
        ) : null}
      </div>
    </Form>
  );

  function winningTeam() {
    if (!winnerId) return;
    if (teams[0].id === winnerId) return teams[0].name;
    if (teams[1].id === winnerId) return teams[1].name;

    throw new Error("No winning team matching the id");
  }

  function winningTeamIdx() {
    if (!winnerId) return;
    if (teams[0].id === winnerId) return 0;
    if (teams[1].id === winnerId) return 1;

    throw new Error("No winning team matching the id");
  }
}

// TODO: remember what previously selected for our team
function checkedPlayersInitialState({
  teamOneId,
  teamTwoId,
  players,
}: {
  teamOneId: number;
  teamTwoId: number;
  players: SerializeFrom<TournamentMatchLoaderData>["match"]["players"];
}): [number[], number[]] {
  const result: [number[], number[]] = [[], []];

  const teamOneMembers = players.filter(
    (player) => player.tournamentTeamId === teamOneId,
  );
  const teamTwoMembers = players.filter(
    (player) => player.tournamentTeamId === teamTwoId,
  );

  if (teamOneMembers.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
    result[0].push(...teamOneMembers.map((member) => member.id));
  }

  if (teamTwoMembers.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
    result[1].push(...teamTwoMembers.map((member) => member.id));
  }

  return result;
}

function ReportScoreButtons({
  points,
  winnerIdx,
  checkedPlayers,
  winnerName,
  currentStageWithMode,
  wouldEndSet,
  matchLocked,
}: {
  points?: [number, number];
  winnerIdx?: number;
  checkedPlayers: number[][];
  winnerName?: string;
  currentStageWithMode: TournamentMapListMap;
  wouldEndSet: boolean;
  matchLocked: boolean;
}) {
  const { t } = useTranslation(["game-misc"]);

  if (matchLocked) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Match is pending to be casted. Please wait a bit
      </p>
    );
  }

  if (checkedPlayers.some((team) => team.length === 0)) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Please select rosters to report the score
      </p>
    );
  }

  if (
    points &&
    typeof winnerIdx === "number" &&
    points[winnerIdx] <= points[winnerIdx === 0 ? 1 : 0]
  ) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Winner should have higher score than loser
      </p>
    );
  }

  if (
    points &&
    ((points[0] === 100 && points[1] !== 0) ||
      (points[0] !== 0 && points[1] === 100))
  ) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        If there was a KO (100 score), other team should have 0 score
      </p>
    );
  }

  if (
    !checkedPlayers.every(
      (team) => team.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
    )
  ) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Please choose {TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL} players from both
        teams to report the score
      </p>
    );
  }

  if (!winnerName) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Please select the winner of this map
      </p>
    );
  }

  return (
    <div className="stack sm items-center">
      <Image
        path={stageImageUrl(currentStageWithMode.stageId)}
        width={64}
        height={36}
        alt=""
        className="rounded-sm"
      />
      <div className="tournament-bracket__during-match-actions__confirm-score-text">
        Report <b>{winnerName}</b> win on{" "}
        <b>
          {t(`game-misc:MODE_LONG_${currentStageWithMode.mode}`)}{" "}
          {t(`game-misc:STAGE_${currentStageWithMode.stageId}`)}
        </b>
        ?
      </div>
      <SubmitButton
        size="tiny"
        _action="REPORT_SCORE"
        testId="report-score-button"
      >
        {wouldEndSet ? "Report & end set" : "Report"}
      </SubmitButton>
    </div>
  );
}
