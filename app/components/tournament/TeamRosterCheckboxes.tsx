import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";
import { Label } from "../Label";

export function TeamRosterCheckboxes({
  team,
  checkedPlayers,
  handlePlayerClick,
}: {
  team: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  checkedPlayers: string[];
  handlePlayerClick: (playerId: string) => void;
}) {
  return (
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
