import clsx from "clsx";
import clone from "just-clone";
import * as React from "react";
import { TOURNAMENT } from "../../tournament/tournament-constants";
import { Label } from "~/components/Label";
import { useTournament } from "../../tournament/routes/to.$id";
import { inGameNameWithoutDiscriminator } from "~/utils/strings";
import { Link, useLoaderData } from "@remix-run/react";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import type { Result } from "./ScoreReporter";
import { tournamentTeamPage, userPage } from "~/utils/urls";
import type { TournamentDataTeam } from "../core/Tournament.server";
import { Avatar } from "~/components/Avatar";

/** Inputs to select who played for teams in a match as well as the winner. Can also be used in a presentational way. */
export function TeamRosterInputs({
  teams,
  winnerId,
  setWinnerId,
  checkedPlayers,
  setCheckedPlayers,
  points: _points,
  setPoints,
  result,
}: {
  teams: [TournamentDataTeam, TournamentDataTeam];
  winnerId?: number | null;
  setWinnerId: (newId?: number) => void;
  checkedPlayers: [number[], number[]];
  setCheckedPlayers?: (newPlayerIds: [number[], number[]]) => void;
  points?: [number, number];
  setPoints: (newPoints: [number, number]) => void;
  result?: Result;
}) {
  const presentational = Boolean(result);

  const tournament = useTournament();
  const data = useLoaderData<TournamentMatchLoaderData>();

  React.useEffect(() => {
    setWinnerId(undefined);
    setPoints([0, 0]);
  }, [data, setWinnerId, setPoints]);

  const points =
    typeof result?.opponentOnePoints === "number" &&
    typeof result?.opponentTwoPoints === "number"
      ? ([result.opponentOnePoints, result.opponentTwoPoints] as [
          number,
          number,
        ])
      : _points;

  return (
    <div className="tournament-bracket__during-match-actions__rosters">
      {teams.map((team, teamI) => {
        const winnerRadioChecked = result
          ? result.winnerTeamId === team.id
          : winnerId === team.id;

        // just so we can center the points nicely
        const showWinnerRadio =
          !points || !presentational || winnerRadioChecked;

        const seed = tournament.teamById(team.id)?.seed;

        return (
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
            <h4>
              {seed ? (
                <span className="tournament-bracket__during-match-actions__seed">
                  #{seed}
                </span>
              ) : null}{" "}
              <Link
                to={tournamentTeamPage({
                  tournamentId: tournament.ctx.id,
                  tournamentTeamId: team.id,
                })}
                className="tournament-bracket__during-match-actions__team-name"
              >
                {team.name}
              </Link>
            </h4>
            <div
              className={clsx("stack horizontal md justify-center", {
                "mt-1": points && !presentational,
              })}
            >
              {showWinnerRadio ? (
                <WinnerRadio
                  presentational={presentational}
                  checked={winnerRadioChecked}
                  teamId={team.id}
                  onChange={() => setWinnerId?.(team.id)}
                  team={teamI + 1}
                />
              ) : null}
              {points ? (
                <PointInput
                  value={points[teamI]}
                  onChange={(newPoint: number) => {
                    const newPoints = clone(points);
                    newPoints[teamI] = newPoint;
                    setPoints(newPoints);
                  }}
                  presentational={presentational}
                  testId={`points-input-${teamI + 1}`}
                />
              ) : null}
            </div>
            <TeamRosterInputsCheckboxes
              teamId={team.id}
              checkedPlayers={result?.participantIds ?? checkedPlayers[teamI]}
              presentational={presentational}
              handlePlayerClick={(playerId: number) => {
                const newCheckedPlayers = () => {
                  const newPlayers = clone(checkedPlayers);
                  if (checkedPlayers.flat().includes(playerId)) {
                    newPlayers[teamI] = newPlayers[teamI].filter(
                      (id) => id !== playerId,
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
        );
      })}
    </div>
  );
}

/** Renders radio button to select winner, or in presentational mode just display the text "Winner" */
function WinnerRadio({
  presentational,
  teamId,
  checked,
  onChange,
  team,
}: {
  presentational: boolean;
  teamId: number;
  checked: boolean;
  onChange: () => void;
  team: number;
}) {
  const id = React.useId();

  if (presentational) {
    return (
      <div
        className={clsx("text-xs font-bold stack justify-center", {
          invisible: !checked,
          "text-theme": team === 1,
          "text-theme-secondary": team === 2,
        })}
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
        data-testid={`winner-radio-${team}`}
      />
      <Label className="mb-0 ml-2" htmlFor={`${teamId}-${id}`}>
        Winner
      </Label>
    </div>
  );
}

function PointInput({
  value,
  onChange,
  presentational,
  testId,
}: {
  value: number;
  onChange: (newPoint: number) => void;
  presentational: boolean;
  testId?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  const id = React.useId();

  if (presentational) {
    return (
      <div className="text-xs text-lighter">
        {value === 100 ? <>KO</> : <>{value}p</>}
      </div>
    );
  }

  return (
    <div className="stack horizontal sm items-center">
      <input
        className="tournament-bracket__points-input"
        onChange={(e) => onChange(Number(e.target.value))}
        type="number"
        min={0}
        max={100}
        value={focused && !value ? "" : String(value)}
        required
        id={id}
        data-testid={testId}
        pattern="[0-9]*"
        inputMode="numeric"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <Label htmlFor={id} spaced={false}>
        Score
      </Label>
    </div>
  );
}

function TeamRosterInputsCheckboxes({
  teamId,
  checkedPlayers,
  handlePlayerClick,
  presentational,
}: {
  teamId: number;
  checkedPlayers: number[];
  handlePlayerClick: (playerId: number) => void;
  presentational: boolean;
}) {
  const data = useLoaderData<TournamentMatchLoaderData>();
  const id = React.useId();

  const members = data.match.players.filter(
    (p) => p.tournamentTeamId === teamId,
  );

  const mode = () => {
    if (presentational) return "PRESENTATIONAL";

    // Disabled in this case because we expect a result to have exactly
    // TOURNAMENT_TEAM_ROSTER_MIN_SIZE members per team when reporting it
    // so there is no point to let user to change them around
    if (members.length <= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
      return "DISABLED";
    }

    return "DEFAULT";
  };

  return (
    <div className="tournament-bracket__during-match-actions__team-players">
      {members.map((member, i) => {
        return (
          <div key={member.id} className="stack horizontal xs">
            <div
              className={clsx(
                "tournament-bracket__during-match-actions__checkbox-name",
                { "disabled-opaque": mode() === "DISABLED" },
                { presentational: mode() === "PRESENTATIONAL" },
              )}
            >
              <input
                className="plain tournament-bracket__during-match-actions__checkbox"
                type="checkbox"
                id={`${member.id}-${id}`}
                name="playerName"
                disabled={mode() === "DISABLED" || mode() === "PRESENTATIONAL"}
                value={member.id}
                checked={checkedPlayers.flat().includes(member.id)}
                onChange={() => handlePlayerClick(member.id)}
                data-testid={`player-checkbox-${i}`}
              />{" "}
              <label
                className="tournament-bracket__during-match-actions__player-name"
                htmlFor={`${member.id}-${id}`}
              >
                <span className="tournament-bracket__during-match-actions__player-name__inner">
                  {member.inGameName
                    ? inGameNameWithoutDiscriminator(member.inGameName)
                    : member.discordName}
                </span>
              </label>
            </div>
            <Link to={userPage(member)} target="_blank">
              <Avatar size="xxs" user={member} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
