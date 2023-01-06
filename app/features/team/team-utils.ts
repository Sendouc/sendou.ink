import type { DetailedTeam } from "./team-types";

export function isTeamOwner({
  team,
  user,
}: {
  team: DetailedTeam;
  user?: { id: number };
}) {
  if (!user) return false;

  return team.members.some((member) => member.isOwner && member.id === user.id);
}

export function isTeamMember({
  team,
  user,
}: {
  team: DetailedTeam;
  user?: { id: number };
}) {
  if (!user) return false;

  return team.members.some((member) => member.id === user.id);
}
