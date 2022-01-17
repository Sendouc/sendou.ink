import clsx from "clsx";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { Label } from "../Label";
import { TeamRosterInputTeam } from "./TeamRosterInputs";

export function TeamRosterInputsCheckboxes({
  team,
  checkedPlayers,
  handlePlayerClick,
  disabled,
}: {
  team: TeamRosterInputTeam;
  checkedPlayers: string[];
  handlePlayerClick: (playerId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="tournament-bracket__during-match-actions__team-players">
      {team.members.map(({ member }) => (
        <div
          key={member.id}
          className={clsx(
            "tournament-bracket__during-match-actions__checkbox-name",
            { "disabled-opaque": disabled }
          )}
        >
          <input
            className="plain tournament-bracket__during-match-actions__checkbox"
            type="checkbox"
            id={member.id}
            name="playerName"
            disabled={team.members.length === TOURNAMENT_TEAM_ROSTER_MIN_SIZE}
            value={member.id}
            checked={checkedPlayers.flat().includes(member.id)}
            onChange={() => handlePlayerClick(member.id)}
          />{" "}
          <Label
            className="tournament-bracket__during-match-actions__player-name"
            htmlFor={member.id}
          >
            {member.discordName}
          </Label>
        </div>
      ))}
    </div>
  );
}
