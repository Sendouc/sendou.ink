export const isTournamentAdmin = ({
  userId,
  organization,
}: {
  userId?: string;
  organization: { ownerId: string };
}) => {
  return organization.ownerId === userId;
};
