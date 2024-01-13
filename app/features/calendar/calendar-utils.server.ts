import { isAdmin } from "~/permissions";

const usersWithTournamentPerms =
  process.env["TOURNAMENT_PERMS"]?.split(",").map(Number) ?? [];
export function canCreateTournament(user?: { id: number }) {
  if (!user) return false;

  return isAdmin(user) || usersWithTournamentPerms.includes(user.id);
}
