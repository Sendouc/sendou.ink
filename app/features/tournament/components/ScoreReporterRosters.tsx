import * as React from "react";
import { Form } from "@remix-run/react";
import type {
  TournamentToolsLoaderData,
  TournamentToolsTeam,
} from "../routes/to.$id";
import type { Unpacked } from "~/utils/types";
import { TOURNAMENT } from "../tournament-constants";
import { SubmitButton } from "~/components/SubmitButton";
import { TeamRosterInputs } from "./TeamRosterInputs";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";

export function ScoreReporterRosters({
  teams,
  position,
  currentStageWithMode,
}: {
  teams: [TournamentToolsTeam, TournamentToolsTeam];
  position: number;
  currentStageWithMode: TournamentMapListMap;
}) {
  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [number[], number[]]
  >(checkedPlayersInitialState(teams));
  const [winnerId, setWinnerId] = React.useState<number | undefined>();

  return (
    <Form method="post" className="width-full">
      <div>
        <TeamRosterInputs
          teams={teams}
          winnerId={winnerId}
          setWinnerId={setWinnerId}
          checkedPlayers={checkedPlayers}
          setCheckedPlayers={setCheckedPlayers}
        />
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
          <input type="hidden" name="mode" value={currentStageWithMode.mode} />
          <ReportScoreButtons
            checkedPlayers={checkedPlayers}
            winnerName={winningTeam()}
          />
        </div>
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

// xxx: popup confirm when set will be ended
function ReportScoreButtons({
  checkedPlayers,
  winnerName,
}: {
  checkedPlayers: number[][];
  winnerName?: string;
}) {
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
    <SubmitButton variant="minimal" _action="REPORT_SCORE">
      Report {winnerName} win
    </SubmitButton>
  );
}
