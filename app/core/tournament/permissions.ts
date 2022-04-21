// TODO: move to validators
export function canReportMatchScore({
  userId,
  members,
}: {
  userId: string;
  members: { memberId: string }[];
}) {
  return members.some((member) => member.memberId === userId);
}
