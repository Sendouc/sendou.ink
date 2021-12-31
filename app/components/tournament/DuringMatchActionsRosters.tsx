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
  stage,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  opponentTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  stage: Stage;
}) {
  const [checkedPlayers, setCheckedPlayers] = useState<[string[], string[]]>(
    checkedPlayersInitialState([ownTeam, opponentTeam])
  );
  return (
    <div>
      <h3>
        Report score for {stage.mode} {stage.name}
      </h3>
      <div className="flex justify-between mt-4">
        {[ownTeam, opponentTeam].map((team, teamI) => (
          <div key={team.id}>
            <h4>{team.name}</h4>
            <div className="flex flex-col gap-1.5 mt-2">
              {team.members.map(({ member }) => (
                <div key={member.id} className="flex items-center">
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
                  <label className="ml-2 plain" htmlFor={member.id}>
                    {member.discordName}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
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
        {TOURNAMENT_TEAM_ROSTER_MIN_SIZE} players
      </p>
    );
  }

  return <Button>Report score</Button>;
}
