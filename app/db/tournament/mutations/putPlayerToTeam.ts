import { db } from "~/utils/db.server";

export async function putPlayerToTeam({
  tournamentId,
  teamId,
  newPlayerId,
}: {
  tournamentId: string;
  teamId: string;
  newPlayerId: string;
}) {
  return db.tournamentTeamMember.create({
    data: {
      tournamentId,
      teamId,
      memberId: newPlayerId,
    },
  });
}
