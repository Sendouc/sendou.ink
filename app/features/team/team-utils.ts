import type { DetailedTeam } from "./team-types";

export function isTeamOwner({
  team,
  user,
}: {
  team: DetailedTeam;
  user: { id: number };
}) {
  return team.members.some((member) => member.isOwner && member.id === user.id);
}
