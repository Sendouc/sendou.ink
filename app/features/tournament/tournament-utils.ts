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
