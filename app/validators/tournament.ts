import { FindTournamentById } from "~/db/tournament/queries/findTournamentById";

/** Checks that a user is considered an admin of the tournament. An admin can perform all sorts of actions that normal users can't.  */
export function isTournamentAdmin({
  userId,
  organization,
}: {
  userId?: string;
  organization: { ownerId: string };
}) {
  return organization.ownerId === userId;
}

/** Checks if tournament has not started meaning there is no bracket with rounds generated. */
export function tournamentHasNotStarted(
  tournament: NonNullable<FindTournamentById>
) {
  return (tournament.brackets[0]?.rounds.length ?? 0) === 0;
}
