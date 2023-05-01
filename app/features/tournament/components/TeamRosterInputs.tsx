import clsx from "clsx";
import clone from "just-clone";
import * as React from "react";
import { TOURNAMENT } from "../tournament-constants";
import { Label } from "~/components/Label";
import type {
  TournamentToolsLoaderData,
  TournamentToolsTeam,
} from "../routes/to.$id";
import type { Unpacked } from "~/utils/types";
import { inGameNameWithoutDiscriminator } from "~/utils/strings";
import { useLoaderData } from "@remix-run/react";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";

export type TeamRosterInputsType = "DEFAULT" | "DISABLED" | "PRESENTATIONAL";

// xxx: inconsistent click behavior
/** Inputs to select who played for teams in a match as well as the winner. Can also be used in a presentational way. */
export function TeamRosterInputs({
  teams,
  winnerId,
  setWinnerId,
  checkedPlayers,
  setCheckedPlayers,
  presentational = false,
}: {
  teams: [TournamentToolsTeam, TournamentToolsTeam];
  winnerId?: number | null;
  setWinnerId: (newId?: number) => void;
  checkedPlayers: [number[], number[]];
  setCheckedPlayers?: (newPlayerIds: [number[], number[]]) => void;
  presentational?: boolean;
}) {
  const data = useLoaderData<TournamentMatchLoaderData>();
  const inputMode = (
    team: Unpacked<TournamentToolsLoaderData["teams"]>
  ): TeamRosterInputsType => {
    if (presentational) return "PRESENTATIONAL";

    // Disabled in this case because we expect a result to have exactly
    // TOURNAMENT_TEAM_ROSTER_MIN_SIZE members per team when reporting it
    // so there is no point to let user to change them around
    if (team.members.length <= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
      return "DISABLED";
    }

    return "DEFAULT";
  };

  React.useEffect(() => {
    setWinnerId(undefined);
  }, [data, setWinnerId]);

  return (
    <div className="tournament-bracket__during-match-actions__rosters">
      {teams.map((team, teamI) => (
        <div key={team.id}>
          <div className="text-xs text-lighter font-semi-bold stack horizontal xs items-center justify-center">
            <div
              className={
                teamI === 0
                  ? "tournament-bracket__team-one-dot"
                  : "tournament-bracket__team-two-dot"
              }
            />
            Team {teamI + 1}
          </div>
          <h4>{team.name}</h4>
          <WinnerRadio
            presentational={presentational}
            checked={winnerId === team.id}
            teamId={team.id}
            onChange={() => setWinnerId?.(team.id)}
          />
          <TeamRosterInputsCheckboxes
            team={team}
            checkedPlayers={checkedPlayers[teamI]!}
            mode={inputMode(team)}
            handlePlayerClick={(playerId: number) => {
              const newCheckedPlayers = () => {
                const newPlayers = clone(checkedPlayers);
                if (checkedPlayers.flat().includes(playerId)) {
                  newPlayers[teamI] = newPlayers[teamI]!.filter(
                    (id) => id !== playerId
                  );
                } else {
                  newPlayers[teamI]!.push(playerId);
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
  teamId: number;
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

function TeamRosterInputsCheckboxes({
  team,
  checkedPlayers,
  handlePlayerClick,
  mode,
}: {
  team: Unpacked<TournamentToolsLoaderData["teams"]>;
  checkedPlayers: number[];
  handlePlayerClick: (playerId: number) => void;
  /** DEFAULT = inputs work, DISABLED = inputs disabled and look disabled, PRESENTATION = inputs disabled but look like in DEFAULT (without hover styles) */
  mode: TeamRosterInputsType;
}) {
  const id = React.useId();

  return (
    <div className="tournament-bracket__during-match-actions__team-players">
      {team.members.map((member) => {
        return (
          <div
            key={member.userId}
            className={clsx(
              "tournament-bracket__during-match-actions__checkbox-name",
              { "disabled-opaque": mode === "DISABLED" },
              { presentational: mode === "PRESENTATIONAL" }
            )}
          >
            <input
              className="plain tournament-bracket__during-match-actions__checkbox"
              type="checkbox"
              id={`${member.userId}-${id}`}
              name="playerName"
              disabled={mode === "DISABLED" || mode === "PRESENTATIONAL"}
              value={member.userId}
              checked={checkedPlayers.flat().includes(member.userId)}
              onChange={() => handlePlayerClick(member.userId)}
            />{" "}
            <label
              className="tournament-bracket__during-match-actions__player-name"
              htmlFor={`${member.userId}-${id}`}
            >
              {member.inGameName
                ? inGameNameWithoutDiscriminator(member.inGameName)
                : member.discordName}
            </label>
          </div>
        );
      })}
    </div>
  );
}
