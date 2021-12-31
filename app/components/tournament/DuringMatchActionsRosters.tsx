import { Stage } from "@prisma/client";
import clone from "just-clone";
import { useState } from "react";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";
import { Button } from "../Button";

export function DuringMatchActionsRosters({
  ownTeam,
  opponentTeam,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  opponentTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
}) {
  const [checkedPlayers, setCheckedPlayers] = useState<[string[], string[]]>(
    checkedPlayersInitialState([ownTeam, opponentTeam])
  );
  return (
    <div>
      <div className="tournament-bracket__during-match-actions__rosters">
        {[ownTeam, opponentTeam].map((team, teamI) => (
          <div key={team.id}>
            <h4>{team.name}</h4>
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
                  <label
                    className="plain tournament-bracket__during-match-actions__player-name"
                    htmlFor={member.id}
                  >
                    {member.discordName}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <ReportScoreButtons checkedPlayers={checkedPlayers} />
      </div>
    </div>
  );
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
}: {
  checkedPlayers: string[][];
}) {
  if (
    !checkedPlayers.every(
      (team) => team.length === TOURNAMENT_TEAM_ROSTER_MIN_SIZE
    )
  ) {
    return (
      <p>
        Please choose exactly {TOURNAMENT_TEAM_ROSTER_MIN_SIZE}+
        {TOURNAMENT_TEAM_ROSTER_MIN_SIZE} players to report score
      </p>
    );
  }

  return <Button>Report score</Button>;
}
