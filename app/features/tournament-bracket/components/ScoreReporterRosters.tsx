import * as React from "react";
import { Form, useLoaderData } from "@remix-run/react";
import type { TournamentLoaderTeam } from "../../tournament/routes/to.$id";
import { TOURNAMENT } from "../../tournament/tournament-constants";
import { SubmitButton } from "~/components/SubmitButton";
import { TeamRosterInputs } from "./TeamRosterInputs";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { useTranslation } from "~/hooks/useTranslation";
import type { Result } from "./ScoreReporter";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import type { SerializeFrom } from "@remix-run/node";

export function ScoreReporterRosters({
  teams,
  position,
  currentStageWithMode,
  result,
}: {
  teams: [TournamentLoaderTeam, TournamentLoaderTeam];
  position: number;
  currentStageWithMode: TournamentMapListMap;
  result?: Result;
}) {
  const data = useLoaderData<TournamentMatchLoaderData>();
  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [number[], number[]]
  >(
    checkedPlayersInitialState({
      teamOneId: teams[0].id,
      teamTwoId: teams[1].id,
      players: data.match.players,
    })
  );
  const [winnerId, setWinnerId] = React.useState<number | undefined>();

  const presentational = Boolean(result);

  return (
    <Form method="post" className="width-full">
      <div>
        <TeamRosterInputs
          teams={teams}
          winnerId={winnerId}
          setWinnerId={setWinnerId}
          checkedPlayers={checkedPlayers}
          setCheckedPlayers={setCheckedPlayers}
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
            <input type="hidden" name="position" value={position} />
            <ReportScoreButtons
              checkedPlayers={checkedPlayers}
              winnerName={winningTeam()}
              currentStageWithMode={currentStageWithMode}
            />
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
    (player) => player.tournamentTeamId === teamOneId
  );
  const teamTwoMembers = players.filter(
    (player) => player.tournamentTeamId === teamTwoId
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
  checkedPlayers,
  winnerName,
  currentStageWithMode,
}: {
  checkedPlayers: number[][];
  winnerName?: string;
  currentStageWithMode: TournamentMapListMap;
}) {
  const { t } = useTranslation(["game-misc"]);

  if (
    !checkedPlayers.every(
      (team) => team.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL
    )
  ) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Please choose exactly {TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL}+
        {TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL} players to report score
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
        Report
      </SubmitButton>
    </div>
  );
}
