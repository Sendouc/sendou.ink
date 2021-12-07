import type { Organization } from ".prisma/client";

export const isTournamentAdmin = ({
  userId,
  organization,
}: {
  userId: string;
  organization: Organization;
}) => {
  return organization.ownerId === userId;
};
