import { TOURNAMENT_TEAM_ROSTER_MAX_SIZE } from "~/constants";

/** Checks that a user is considered an admin of the tournament. An admin can perform all sorts of actions that normal users can't.  */
export function isTournamentAdmin({
  // TODO: refactor to user
  userId,
  organization,
}: {
  userId?: string;
  organization: { ownerId: string };
}) {
  return organization.ownerId === userId;
}

/** Checks if tournament has not started meaning there is no bracket with rounds generated. */
export function tournamentHasNotStarted(tournament: {
  brackets: { rounds: unknown[] }[];
}) {
  return (tournament.brackets[0]?.rounds.length ?? 0) === 0;
}

/** Checks if given user is captain of the team. Captain is considered the admin of the team. */
export function isCaptainOfTheTeam(
  user: { id: string },
  team: { members: { captain: boolean; memberId: string }[] }
) {
  return team.members.some(
    ({ memberId, captain }) => captain && memberId === user.id
  );
}

/** Checks tournament team's member count is below the max roster size constant. */
export function tournamentTeamIsNotFull(team: { members: unknown[] }) {
  return team.members.length < TOURNAMENT_TEAM_ROSTER_MAX_SIZE;
}

export function teamHasNotCheckedIn(team: { checkedInTime: Date | null }) {
  return !Boolean(team.checkedInTime);
}
