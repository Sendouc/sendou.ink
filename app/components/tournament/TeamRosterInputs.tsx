import clone from "just-clone";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { Label } from "../Label";
import { TeamRosterInputsCheckboxes } from "./TeamRosterInputsCheckboxes";

/** Fields of a tournament team required to render `<TeamRosterInputs />` */
export interface TeamRosterInputTeam {
  name: string;
  id: string;
  members: {
    member: {
      id: string;
      discordName: string;
    };
  }[];
}

/** Inputs to select who played for teams in a match as well as the winner. Can also be used in a presentational way. */
export function TeamRosterInputs({
  teamOne,
  teamTwo,
  winnerId,
  setWinnerId,
  checkedPlayers,
  setCheckedPlayers,
}: {
  teamOne: TeamRosterInputTeam;
  teamTwo: TeamRosterInputTeam;
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
