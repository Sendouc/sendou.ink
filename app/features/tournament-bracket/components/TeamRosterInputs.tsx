import clsx from "clsx";
import clone from "just-clone";
import * as React from "react";
import { TOURNAMENT } from "../../tournament/tournament-constants";
import { Label } from "~/components/Label";
import { useTournament } from "../../tournament/routes/to.$id";
import { inGameNameWithoutDiscriminator } from "~/utils/strings";
import { Link, useLoaderData } from "@remix-run/react";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import type { Result } from "./StartedMatch";
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
  checkedPlayers: [number[], number[]];
  setCheckedPlayers?: React.Dispatch<
    React.SetStateAction<[number[], number[]]>
  >;
  points?: [number, number];
  setWinnerId: (newId?: number) => void;
  setPoints: React.Dispatch<React.SetStateAction<[number, number]>>;
  result?: Result;
}) {
  const presentational = Boolean(result);

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

        return (
          <TeamRoster
            idx={teamI}
            setPoints={setPoints}
            presentational={presentational}
            team={team}
            setWinnerId={setWinnerId}
            setCheckedPlayers={setCheckedPlayers}
            checkedPlayers={checkedPlayers[teamI].join(",")}
            winnerRadioChecked={winnerRadioChecked}
            points={points ? points[teamI] : undefined}
            key={team.id}
          />
        );
      })}
    </div>
  );
}

const TeamRoster = React.memo(_TeamRoster);
function _TeamRoster({
  team,
  presentational,
  idx,
  setWinnerId,
  setPoints,
  setCheckedPlayers,
  points,
  winnerRadioChecked,
  checkedPlayers,
}: {
  team: TournamentDataTeam;
  presentational: boolean;
  idx: number;
  setWinnerId: (newId?: number) => void;
  setPoints: React.Dispatch<React.SetStateAction<[number, number]>>;
  setCheckedPlayers?: React.Dispatch<
    React.SetStateAction<[number[], number[]]>
  >;
  points?: number;
  winnerRadioChecked: boolean;
  checkedPlayers: string;
}) {
  const tournament = useTournament();

  const hasPoints = typeof points === "number";

  // just so we can center the points nicely
  const showWinnerRadio = !hasPoints || !presentational || winnerRadioChecked;

  const onPointsChange = React.useCallback(
    (newPoint: number) => {
      setPoints((points) => {
        const newPoints = clone(points);
        newPoints[idx] = newPoint;
        return newPoints;
      });
    },
    [idx, setPoints],
  );

  return (
    <div key={team.id}>
      <TeamRosterHeader
        idx={idx}
        team={team}
        tournamentId={tournament.ctx.id}
      />
      <div
        className={clsx("stack horizontal md justify-center", {
          "mt-1": hasPoints && !presentational,
        })}
      >
        {showWinnerRadio ? (
          <WinnerRadio
            presentational={presentational}
            checked={winnerRadioChecked}
            teamId={team.id}
            onChange={() => setWinnerId?.(team.id)}
            team={idx + 1}
          />
        ) : null}
        {hasPoints ? (
          <PointInput
            value={points}
            onChange={onPointsChange}
            presentational={presentational}
            testId={`points-input-${idx + 1}`}
          />
        ) : null}
      </div>
      <TeamRosterInputsCheckboxes
        teamId={team.id}
        checkedPlayers={checkedPlayers.split(",").map(Number)}
        presentational={presentational}
        handlePlayerClick={(playerId: number) => {
          if (!setCheckedPlayers) return;

          setCheckedPlayers((oldPlayers) => {
            const newPlayers = clone(oldPlayers);
            if (oldPlayers.flat().includes(playerId)) {
              newPlayers[idx] = newPlayers[idx].filter((id) => id !== playerId);
            } else {
              newPlayers[idx].push(playerId);
            }

            return newPlayers;
          });
        }}
      />
    </div>
  );
}

const TeamRosterHeader = React.memo(_TeamRosterHeader);
function _TeamRosterHeader({
  idx,
  team,
  tournamentId,
}: {
  idx: number;
  team: TournamentDataTeam;
  tournamentId: number;
}) {
  return (
    <>
      <div className="text-xs text-lighter font-semi-bold stack horizontal xs items-center justify-center">
        <div
          className={
            idx === 0
              ? "tournament-bracket__team-one-dot"
              : "tournament-bracket__team-two-dot"
          }
        />
        Team {idx + 1}
      </div>
      <h4>
        {team.seed ? (
          <span className="tournament-bracket__during-match-actions__seed">
            #{team.seed}
          </span>
        ) : null}{" "}
        <Link
          to={tournamentTeamPage({
            tournamentId,
            tournamentTeamId: team.id,
          })}
          className="tournament-bracket__during-match-actions__team-name"
        >
          {team.name}
        </Link>
      </h4>
    </>
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

const PointInput = React.memo(_PointInput);
function _PointInput({
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
