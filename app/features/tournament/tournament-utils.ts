import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { User } from "~/db/types";
import type { FindTeamsByEventId } from "./queries/findTeamsByEventId.server";
import type { TournamentToolsLoaderData } from "./routes/to.$id";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import type { ModeShort } from "~/modules/in-game-lists";
import { TOURNAMENT } from "./tournament-constants";

export function resolveOwnedTeam({
  teams,
  userId,
}: {
  teams: FindTeamsByEventId;
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

const SZ_TOURNAMENT_NAME = "In The Zone";

export function HACKY_modesIncluded(
  event: TournamentToolsLoaderData["event"]
): ModeShort[] {
  if (event.name.includes(SZ_TOURNAMENT_NAME)) return ["SZ"];

  return [...rankedModesShort];
}

export function HACKY_isOneModeTournamentOf(
  event: TournamentToolsLoaderData["event"]
) {
  if (event.name.includes(SZ_TOURNAMENT_NAME)) return "SZ";

  return null;
}

export function mapPickCountPerMode(event: TournamentToolsLoaderData["event"]) {
  return HACKY_isOneModeTournamentOf(event)
    ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
    : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE;
}
