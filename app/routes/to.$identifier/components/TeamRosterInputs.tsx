import clsx from "clsx";
import clone from "just-clone";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { Label } from "../Label";
import { TeamRosterInputsCheckboxes } from "./TeamRosterInputsCheckboxes";
import * as React from "react";

/** Fields of a tournament team required to render `<TeamRosterInputs />` */
export interface TeamRosterInputTeam {
  name: string;
  id: string;
  members: {
    member: {
      id: string;
      discordName: string;
      played?: boolean;
    };
  }[];
}

export type TeamRosterInputsType = "DEFAULT" | "DISABLED" | "PRESENTATIONAL";

/** Inputs to select who played for teams in a match as well as the winner. Can also be used in a presentational way. */
export function TeamRosterInputs({
  teamUpper,
  teamLower,
  winnerId,
  setWinnerId,
  checkedPlayers,
  setCheckedPlayers,
  presentational = false,
}: {
  teamUpper: TeamRosterInputTeam;
  teamLower: TeamRosterInputTeam;
  winnerId?: string | null;
  setWinnerId?: (newId: string) => void;
  checkedPlayers: [string[], string[]];
  setCheckedPlayers?: (newPlayerIds: [string[], string[]]) => void;
  presentational?: boolean;
}) {
  const inputMode = (team: TeamRosterInputTeam): TeamRosterInputsType => {
    if (presentational) return "PRESENTATIONAL";

    // Disabled in this case because we expect a result to have exactly
    // TOURNAMENT_TEAM_ROSTER_MIN_SIZE members per team when reporting it
    // so there is no point to let user to change them around
    if (team.members.length <= TOURNAMENT_TEAM_ROSTER_MIN_SIZE) {
      return "DISABLED";
    }

    return "DEFAULT";
  };

  return (
    <div className="tournament-bracket__during-match-actions__rosters">
      {[teamUpper, teamLower].map((team, teamI) => (
        <div key={team.id}>
          <h4>{team.name}</h4>
          <WinnerRadio
            presentational={presentational}
            checked={winnerId === team.id}
            teamId={team.id}
            onChange={() => setWinnerId?.(team.id)}
          />
          <TeamRosterInputsCheckboxes
            team={team}
            checkedPlayers={checkedPlayers[teamI]}
            mode={inputMode(team)}
            handlePlayerClick={(playerId: string) => {
              const newCheckedPlayers = () => {
                const newPlayers = clone(checkedPlayers);
                if (checkedPlayers.flat().includes(playerId)) {
                  newPlayers[teamI] = newPlayers[teamI].filter(
                    (id) => id !== playerId
                  );
                } else {
                  newPlayers[teamI].push(playerId);
                }

                return newPlayers;
              };
              setCheckedPlayers?.(newCheckedPlayers());
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** Renders radio button to select winner, or in presentational mode just display the text "Winner" */
function WinnerRadio({
  presentational,
  teamId,
  checked,
  onChange,
}: {
  presentational: boolean;
  teamId: string;
  checked: boolean;
  onChange: () => void;
}) {
  const id = React.useId();

  if (presentational) {
    return (
      <div
        className={clsx(
          "tournament-bracket__during-match-actions__winner-text",
          { invisible: !checked }
        )}
      >
        Winner
      </div>
    );
  }

  return (
    <div className="tournament-bracket__during-match-actions__radio-container">
      <input
        type="radio"
        id={`${teamId}-${id}`}
        onChange={onChange}
        checked={checked}
      />
      <Label className="mb-0 ml-2" htmlFor={`${teamId}-${id}`}>
        Winner
      </Label>
    </div>
  );
}
