import { TEAM } from "./team-constants";
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

export function isTeamFull(team: DetailedTeam) {
  return team.members.length >= TEAM.MAX_MEMBER_COUNT;
}
