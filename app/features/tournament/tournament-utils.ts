import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { User } from "~/db/types";
import type { FindTeamsByEventId } from "./queries/findTeamsByEventId.server";

export function findOwnedTeam({
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

export function identifierFromParams(params: Params<string>) {
  const result = params["identifier"];
  invariant(typeof result === "string", "identifier is not a string");

  return result;
}
