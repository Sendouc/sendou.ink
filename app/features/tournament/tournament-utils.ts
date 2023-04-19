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

export function modesIncluded(
  event: TournamentToolsLoaderData["event"]
): ModeShort[] {
  if (event.toToolsMode) return [event.toToolsMode];

  return [...rankedModesShort];
}

export function isOneModeTournamentOf(
  event: TournamentToolsLoaderData["event"]
) {
  if (event.toToolsMode) return event.toToolsMode;

  return null;
}

export function HACKY_resolvePicture(
  event: TournamentToolsLoaderData["event"]
) {
  if (event.name.includes("In The Zone"))
    return "https://abload.de/img/screenshot2023-04-19a2bfv0.png";

  return "https://abload.de/img/screenshot2022-12-15ap0ca1.png";
}

export function mapPickCountPerMode(event: TournamentToolsLoaderData["event"]) {
  return isOneModeTournamentOf(event)
    ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
    : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE;
}
