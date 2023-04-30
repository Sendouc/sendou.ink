import * as React from "react";
import { Form } from "@remix-run/react";
import type { TournamentToolsLoaderData } from "../routes/to.$id";
import type { Unpacked } from "~/utils/types";
import { TOURNAMENT } from "../tournament-constants";
import { SubmitButton } from "~/components/SubmitButton";
import { TeamRosterInputs } from "./TeamRosterInputs";

export function ScoreReporterRosters({
  ownTeam,
  opponentTeam,
  matchId,
  position,
}: {
  ownTeam: Unpacked<TournamentToolsLoaderData["teams"]>;
  opponentTeam: Unpacked<TournamentToolsLoaderData["teams"]>;
  matchId: string;
  position: number;
}) {
  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [number[], number[]]
  >(checkedPlayersInitialState([ownTeam, opponentTeam]));
  const [winnerId, setWinnerId] = React.useState<number | undefined>();

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
  clearWinner,
}: {
  checkedPlayers: number[][];
  winnerName?: string;
  clearWinner: () => void;
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
        Please select the winning team
      </p>
    );
  }

  return (
    <SubmitButton
      variant="minimal"
      _action="REPORT_SCORE"
      loadingText={`Reporting ${winnerName} win...`}
      // xxx: implement
      // onSuccess={clearWinner}
    >
      Report {winnerName} win
    </SubmitButton>
  );
}