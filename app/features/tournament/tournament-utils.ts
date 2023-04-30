import type { Params } from "@remix-run/react";
import type { DataTypes } from "brackets-manager/dist/types";
import invariant from "tiny-invariant";
import type {
  Tournament,
  TournamentFormat,
  TournamentStage,
  User,
} from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { databaseTimestampToDate } from "~/utils/dates";
import { assertUnreachable } from "~/utils/types";
import type { FindTeamsByTournamentId } from "./queries/findTeamsByTournamentId.server";
import type { TournamentToolsLoaderData } from "./routes/to.$id";
import { TOURNAMENT } from "./tournament-constants";

export function resolveOwnedTeam({
  teams,
  userId,
}: {
  teams: FindTeamsByTournamentId;
  userId?: User["id"];
}) {
  if (typeof userId !== "number") return;

  return teams.find((team) =>
    team.members.some((member) => member.isOwner && member.userId === userId)
  );
}

export function idFromParams(params: Params<string>) {
  const result = Number(params["id"]);
  invariant(!Number.isNaN(result), "id is not a number");

  return result;
}

export function matchIdFromParams(params: Params<string>) {
  const result = Number(params["mid"]);
  invariant(!Number.isNaN(result), "mid is not a number");

  return result;
}

export function modesIncluded(
  tournament: Pick<Tournament, "mapPickingStyle">
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
  tournament: Pick<Tournament, "mapPickingStyle">
) {
  return modesIncluded(tournament).length === 1
    ? modesIncluded(tournament)[0]!
    : null;
}

export function HACKY_resolvePicture(
  event: TournamentToolsLoaderData["event"]
) {
  if (event.name.includes("In The Zone"))
    return "https://abload.de/img/screenshot2023-04-19a2bfv0.png";

  return "https://abload.de/img/screenshot2022-12-15ap0ca1.png";
}

// hacky because db query not taking in account possibility of many start times
// AND always assumed check-in starts 1h before
export function HACKY_resolveCheckInTime(
  event: TournamentToolsLoaderData["event"]
) {
  return databaseTimestampToDate(event.startTime - 60 * 60);
}

export function mapPickCountPerMode(event: TournamentToolsLoaderData["event"]) {
  return isOneModeTournamentOf(event)
    ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
    : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE;
}

export function resolveTournamentStageName(format: TournamentFormat) {
  switch (format) {
    case "SE":
    case "DE":
      return "Elimination stage";
    default: {
      assertUnreachable(format);
    }
  }
}

export function resolveTournamentStageType(
  format: TournamentFormat
): TournamentStage["type"] {
  switch (format) {
    case "SE":
      return "single_elimination";
    case "DE":
      return "double_elimination";
    default: {
      assertUnreachable(format);
    }
  }
}

export function resolveTournamentStageSettings(
  format: TournamentFormat
): DataTypes["stage"]["settings"] {
  switch (format) {
    case "SE":
      return {};
    case "DE":
      return { grandFinal: "double" };
    default: {
      assertUnreachable(format);
    }
  }
}
