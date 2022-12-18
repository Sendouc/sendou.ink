import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { User } from "~/db/types";
import type { FindTeamsByEventId } from "./queries/findTeamsByEventId.server";

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
