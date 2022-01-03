import clone from "just-clone";
import * as React from "react";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";
import { Button } from "../Button";
import { Label } from "../Label";

export function DuringMatchActionsRosters({
  ownTeam,
  opponentTeam,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  opponentTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
}) {
  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [string[], string[]]
  >(checkedPlayersInitialState([ownTeam, opponentTeam]));
  const [winnerId, setWinnerId] = React.useState<string | null>(null);
  return (
    <div className="width-full">
      <div className="tournament-bracket__during-match-actions__rosters">
        {[ownTeam, opponentTeam].map((team, teamI) => (
          <div key={team.id}>
            <h4>{team.name}</h4>
            <div className="flex items-center justify-center my-1-5">
              <input
                type="radio"
                id={team.id}
                name="winner"
                value={team.id}
                onChange={(e) => setWinnerId(e.currentTarget.value)}
              />
              <Label className="mb-0 ml-2" htmlFor={team.id}>
                Winner
              </Label>
            </div>
            <div className="tournament-bracket__during-match-actions__team-players">
              {team.members.map(({ member }) => (
                <div
                  key={member.id}
                  className="tournament-bracket__during-match-actions__checkbox-name"
                >
                  <input
                    type="checkbox"
                    id={member.id}
                    name="playerName"
                    disabled={
                      team.members.length === TOURNAMENT_TEAM_ROSTER_MIN_SIZE
                    }
                    checked={checkedPlayers.flat().includes(member.id)}
                    onChange={() =>
                      setCheckedPlayers((players) => {
                        const newPlayers = clone(players);
                        if (checkedPlayers.flat().includes(member.id)) {
                          newPlayers[teamI] = newPlayers[teamI].filter(
                            (id) => id !== member.id
                          );
                        } else {
                          newPlayers[teamI].push(member.id);
                        }

                        return newPlayers;
                      })
                    }
                  />{" "}
                  <Label
                    className="plain tournament-bracket__during-match-actions__player-name"
                    htmlFor={member.id}
                  >
                    {member.discordName}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="tournament-bracket__during-match-actions__actions">
        <ReportScoreButtons
          checkedPlayers={checkedPlayers}
          winnerName={winningTeam()}
        />
      </div>
    </div>
  );

  function winningTeam() {
    if (!winnerId) return;
    if (ownTeam.id === winnerId) return ownTeam.name;
    if (opponentTeam.id === winnerId) return opponentTeam.name;

    throw new Error("No winning team matching the id");
  }
}

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
}: {
  checkedPlayers: string[][];
  winnerName?: string;
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
    <Button type="submit" variant="minimal">
      Report {winnerName} win
    </Button>
  );
}
