import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { User } from "~/db/types";
import type { FindTeamsByEventId } from "./queries/findTeamsByEventId.server";
import type { TournamentToolsLoaderData } from "./routes/to.$id";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import type { ModeShort } from "~/modules/in-game-lists";

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

export function HACKY_modesIncluded(
  event: TournamentToolsLoaderData["event"]
): ModeShort[] {
  if (event.name.includes("In The Zone")) return ["SZ"];

  return [...rankedModesShort];
}
