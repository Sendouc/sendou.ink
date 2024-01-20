import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Tournament, User } from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { databaseTimestampToDate } from "~/utils/dates";
import type { FindTeamsByTournamentId } from "./queries/findTeamsByTournamentId.server";
import type {
  TournamentLoaderData,
  TournamentLoaderTeam,
} from "./routes/to.$id";
import { TOURNAMENT } from "./tournament-constants";
import { validate } from "~/utils/remix";
import type { PlayedSet } from "./core/sets.server";
import { tournamentLogoUrl } from "~/utils/urls";

export function resolveOwnedTeam({
  teams,
  userId,
}: {
  teams: Array<TournamentLoaderTeam>;
  userId?: User["id"];
}) {
  if (typeof userId !== "number") return;

  return teams.find((team) =>
    team.members.some((member) => member.isOwner && member.userId === userId),
  );
}

export function teamHasCheckedIn(
  team: Pick<TournamentLoaderTeam, "checkedInAt">,
) {
  return Boolean(team.checkedInAt);
}

export function tournamentIdFromParams(params: Params<string>) {
  const result = Number(params["id"]);
  invariant(!Number.isNaN(result), "id is not a number");

  return result;
}

export function tournamentTeamIdFromParams(params: Params<string>) {
  const result = Number(params["tid"]);
  invariant(!Number.isNaN(result), "tid is not a number");

  return result;
}

export function modesIncluded(
  tournament: Pick<Tournament, "mapPickingStyle">,
): ModeShort[] {
  switch (tournament.mapPickingStyle) {
    case "AUTO_SZ": {
      return ["SZ"];
    }
    case "AUTO_TC": {
      return ["TC"];
    }
    case "AUTO_RM": {
      return ["RM"];
    }
    case "AUTO_CB": {
      return ["CB"];
    }
    default: {
      return [...rankedModesShort];
    }
  }
}

export function isOneModeTournamentOf(
  tournament: Pick<Tournament, "mapPickingStyle">,
) {
  return modesIncluded(tournament).length === 1
    ? modesIncluded(tournament)[0]!
    : null;
}

export function HACKY_resolvePicture(event: { name: string }) {
  if (HACKY_isInviteOnlyEvent(event)) {
    return tournamentLogoUrl("sf");
  }

  if (event.name.includes("Paddling Pool")) {
    return tournamentLogoUrl("pp");
  }

  if (event.name.includes("In The Zone")) {
    return tournamentLogoUrl("itz");
  }

  if (event.name.includes("PICNIC")) {
    return tournamentLogoUrl("pn");
  }

  if (event.name.includes("Proving Grounds")) {
    return tournamentLogoUrl("pg");
  }

  if (event.name.includes("Triton")) {
    return tournamentLogoUrl("tc");
  }

  return tournamentLogoUrl("default");
}

// hacky because db query not taking in account possibility of many start times
// AND always assumed check-in starts 1h before
export function HACKY_resolveCheckInTime(
  event: Pick<TournamentLoaderData["tournament"], "startTime">,
) {
  return databaseTimestampToDate(event.startTime - 60 * 60);
}

const HACKY_isSendouQSeasonFinale = (event: { name: string }) =>
  event.name.includes("Finale");

export function HACKY_isInviteOnlyEvent(event: { name: string }) {
  return HACKY_isSendouQSeasonFinale(event);
}

export function HACKY_subsFeatureEnabled(
  event: TournamentLoaderData["tournament"],
) {
  if (HACKY_isSendouQSeasonFinale(event)) return false;

  return true;
}

export function HACKY_maxRosterSizeBeforeStart(event: { name: string }) {
  if (HACKY_isSendouQSeasonFinale(event)) return 5;

  return TOURNAMENT.DEFAULT_TEAM_MAX_MEMBERS_BEFORE_START;
}

export function mapPickCountPerMode(event: TournamentLoaderData["tournament"]) {
  return isOneModeTournamentOf(event)
    ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
    : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE;
}

export function checkInHasStarted(
  event: Pick<TournamentLoaderData["tournament"], "startTime">,
) {
  return HACKY_resolveCheckInTime(event).getTime() < Date.now();
}

export function checkInHasEnded(
  event: Pick<TournamentLoaderData["tournament"], "startTime">,
) {
  return databaseTimestampToDate(event.startTime).getTime() < Date.now();
}

export function validateCanCheckIn({
  event,
  team,
  mapPool,
}: {
  event: Pick<TournamentLoaderData["tournament"], "startTime">;
  team: FindTeamsByTournamentId[number];
  mapPool: unknown[] | null;
}) {
  validate(checkInHasStarted(event), "Check-in has not started yet");
  validate(
    team.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
    "Team does not have enough members",
  );
  validate(mapPool && mapPool.length > 0, "Team does not have a map pool");

  return true;
}

export function tournamentRoundI18nKey(round: PlayedSet["round"]) {
  if (round.round === "grand_finals") return `bracket.grand_finals` as const;
  if (round.round === "bracket_reset") {
    return `bracket.grand_finals.bracket_reset` as const;
  }
  if (round.round === "finals") return `bracket.${round.type}.finals` as const;

  return `bracket.${round.type}` as const;
}

export function tournamentTeamMaxSize({
  tournament,
  tournamentHasStarted,
}: {
  tournament: { name: string };
  tournamentHasStarted: boolean;
}) {
  // ensuring every team can add at least one sub while the tournament is ongoing
  return (
    HACKY_maxRosterSizeBeforeStart(tournament) + Number(tournamentHasStarted)
  );
}
