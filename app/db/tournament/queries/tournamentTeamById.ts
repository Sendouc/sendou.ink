import { db } from "~/utils/db.server";

export function tournamentTeamById(id: string) {
  return db.tournamentTeam.findUnique({
    where: { id },
    include: { tournament: true, members: true },
  });
}
