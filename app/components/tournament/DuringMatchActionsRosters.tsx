import * as React from "react";
import { Form } from "@remix-run/react";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";
import { SubmitButton } from "../SubmitButton";
import { TeamRosterInputs } from "./TeamRosterInputs";

export function DuringMatchActionsRosters({
  ownTeam,
  opponentTeam,
  matchId,
  position,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  opponentTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  matchId: string;
  position: number;
}) {
  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [string[], string[]]
  >(checkedPlayersInitialState([ownTeam, opponentTeam]));
  const [winnerId, setWinnerId] = React.useState<string | undefined>();

  return (
    <Form method="post" className="width-full">
      <div>
        <TeamRosterInputs
          teamUpper={ownTeam}
          teamLower={opponentTeam}
          winnerId={winnerId}
          setWinnerId={setWinnerId}
          checkedPlayers={checkedPlayers}
          setCheckedPlayers={setCheckedPlayers}
        />
        <div className="tournament-bracket__during-match-actions__actions">
          <input type="hidden" name="_action" value="REPORT_SCORE" />
          <input type="hidden" name="matchId" value={matchId} />
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
            clearWinner={() => setWinnerId(undefined)}
          />
        </div>
      </div>
    </Form>
  );

  function winningTeam() {
    if (!winnerId) return;
    if (ownTeam.id === winnerId) return ownTeam.name;
    if (opponentTeam.id === winnerId) return opponentTeam.name;

    throw new Error("No winning team matching the id");
  }
}

// TODO: remember what previously selected for our team
function checkedPlayersInitialState([teamOne, teamTwo]: [
  Unpacked<FindTournamentByNameForUrlI["teams"]>,
  Unpacked<FindTournamentByNameForUrlI["teams"]>
]): [string[], string[]] {
  const result: [string[], string[]] = [[], []];

  if (teamOne.members.length === TOURNAMENT_TEAM_ROSTER_MIN_SIZE) {
    result[0].push(...teamOne.members.map(({ member }) => member.id));
  }

  if (teamTwo.members.length === TOURNAMENT_TEAM_ROSTER_MIN_SIZE) {
    result[1].push(...teamTwo.members.map(({ member }) => member.id));
  }

  return result;
}

function ReportScoreButtons({
  checkedPlayers,
  winnerName,
  clearWinner,
}: {
  checkedPlayers: string[][];
  winnerName?: string;
  clearWinner: () => void;
}) {
  if (
    !checkedPlayers.every(
      (team) => team.length === TOURNAMENT_TEAM_ROSTER_MIN_SIZE
    )
  ) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Please choose exactly {TOURNAMENT_TEAM_ROSTER_MIN_SIZE}+
        {TOURNAMENT_TEAM_ROSTER_MIN_SIZE} players to report score
      </p>
    );
  }

  if (!winnerName) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Please select the winning team
      </p>
    );
  }

  return (
    <SubmitButton
      variant="minimal"
      actionType="REPORT_SCORE"
      loadingText={`Reporting ${winnerName} win...`}
      onSuccess={clearWinner}
    >
      Report {winnerName} win
    </SubmitButton>
  );
}
