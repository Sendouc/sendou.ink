import clone from "just-clone";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";
import { Label } from "../Label";
import { TeamRosterInputsCheckboxes } from "./TeamRosterInputsCheckboxes";

export function TeamRosterInputs({
  teamOne,
  teamTwo,
  winnerId,
  setWinnerId,
  checkedPlayers,
  setCheckedPlayers,
}: {
  teamOne: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  teamTwo: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  winnerId?: string;
  setWinnerId: (newId: string) => void;
  checkedPlayers: [string[], string[]];
  setCheckedPlayers: React.Dispatch<React.SetStateAction<[string[], string[]]>>;
}) {
  return (
    <div className="tournament-bracket__during-match-actions__rosters">
      {[teamOne, teamTwo].map((team, teamI) => (
        <div key={team.id}>
          <h4>{team.name}</h4>
          <div className="tournament-bracket__during-match-actions__radio-container">
            <input
              type="radio"
              id={team.id}
              name="winnerTeamId"
              onChange={() => setWinnerId(team.id)}
              checked={winnerId === team.id}
            />
            <Label className="mb-0 ml-2" htmlFor={team.id}>
              Winner
            </Label>
          </div>
          <TeamRosterInputsCheckboxes
            team={team}
            checkedPlayers={checkedPlayers[teamI]}
            disabled={team.members.length <= TOURNAMENT_TEAM_ROSTER_MIN_SIZE}
            handlePlayerClick={(playerId: string) =>
              setCheckedPlayers((players) => {
                const newPlayers = clone(players);
                if (checkedPlayers.flat().includes(playerId)) {
                  newPlayers[teamI] = newPlayers[teamI].filter(
                    (id) => id !== playerId
                  );
                } else {
                  newPlayers[teamI].push(playerId);
                }

                return newPlayers;
              })
            }
          />
        </div>
      ))}
    </div>
  );
}
