import * as React from "react";
import { Form } from "@remix-run/react";
import type {
  TournamentToolsLoaderData,
  TournamentToolsTeam,
} from "../../tournament/routes/to.$id";
import type { Unpacked } from "~/utils/types";
import { TOURNAMENT } from "../../tournament/tournament-constants";
import { SubmitButton } from "~/components/SubmitButton";
import { TeamRosterInputs } from "./TeamRosterInputs";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { useTranslation } from "~/hooks/useTranslation";
import type { Result } from "./ScoreReporter";

export function ScoreReporterRosters({
  teams,
  position,
  currentStageWithMode,
  result,
}: {
  teams: [TournamentToolsTeam, TournamentToolsTeam];
  position: number;
  currentStageWithMode: TournamentMapListMap;
  result?: Result;
}) {
  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [number[], number[]]
  >(checkedPlayersInitialState(teams));
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
            <input
              type="hidden"
              name="stageId"
              value={currentStageWithMode.stageId}
            />
            <input
              type="hidden"
              name="mode"
              value={currentStageWithMode.mode}
            />
            <input
              type="hidden"
              name="source"
              value={currentStageWithMode.source}
            />
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
function checkedPlayersInitialState([teamOne, teamTwo]: [
  Unpacked<TournamentToolsLoaderData["teams"]>,
  Unpacked<TournamentToolsLoaderData["teams"]>
]): [number[], number[]] {
  const result: [number[], number[]] = [[], []];

  if (teamOne.members.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
    result[0].push(...teamOne.members.map((member) => member.userId));
  }

  if (teamTwo.members.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
    result[1].push(...teamTwo.members.map((member) => member.userId));
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
      <SubmitButton size="tiny" _action="REPORT_SCORE">
        Report
      </SubmitButton>
    </div>
  );
}
