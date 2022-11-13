import type { FindTeamsByEventId } from "~/db/models/tournaments/queries.server";
import type { User } from "~/db/types";

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
