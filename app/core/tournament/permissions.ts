import type { TournamentTeamMember } from "@prisma/client";

export function isTournamentAdmin({
  userId,
  organization,
}: {
  userId?: string;
  organization: { ownerId: string };
}) {
  return organization.ownerId === userId;
}

export function canReportMatchScore({
  userId,
  members,
}: {
  userId: string;
  members: TournamentTeamMember[];
}) {
  return members.some((member) => member.memberId === userId);
}
