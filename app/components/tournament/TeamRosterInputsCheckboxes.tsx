import clsx from "clsx";
import { Label } from "../Label";
import { TeamRosterInputsType, TeamRosterInputTeam } from "./TeamRosterInputs";

export function TeamRosterInputsCheckboxes({
  team,
  checkedPlayers,
  handlePlayerClick,
  mode,
}: {
  team: TeamRosterInputTeam;
  checkedPlayers: string[];
  handlePlayerClick: (playerId: string) => void;
  /** DEFAULT = inputs work, DISABLED = inputs disabled and look disabled, PRESENTATION = inputs disabled but look like in DEFAULT (without hover styles) */
  mode: TeamRosterInputsType;
}) {
  return (
    <div className="tournament-bracket__during-match-actions__team-players">
      {team.members.map(({ member }) => (
        <div
          key={member.id}
          className={clsx(
            "tournament-bracket__during-match-actions__checkbox-name",
            { "disabled-opaque": mode === "DISABLED" },
            { presentational: mode === "PRESENTATIONAL" }
          )}
        >
          <input
            className="plain tournament-bracket__during-match-actions__checkbox"
            type="checkbox"
            id={member.id}
            name="playerName"
            disabled={mode === "DISABLED" || mode === "PRESENTATIONAL"}
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
