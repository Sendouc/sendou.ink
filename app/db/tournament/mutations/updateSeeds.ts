import { db } from "~/utils/db.server";

export async function updateSeeds({
  tournamentId,
  seeds,
}: {
  tournamentId: string;
  seeds: string[];
}) {
  return db.tournament.update({
    where: {
      id: tournamentId,
    },
    data: {
      seeds,
    },
  });
}
