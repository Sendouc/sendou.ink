import { Prisma } from "@prisma/client";
import { getRoundNameByPositions } from "~/core/tournament/bracket";
import { db } from "~/utils/db.server";

export type FindMatchModalInfoByNumber = Prisma.PromiseReturnType<
  typeof findMatchModalInfoByNumber
>;

export async function findMatchModalInfoByNumber({
  bracketId,
  matchNumber,
}: {
  bracketId: string;
  matchNumber: number;
}) {
  const tournamentRounds = await db.tournamentRound.findMany({
    where: { bracketId },
    include: {
      matches: {
        include: { results: true, participants: { include: { team: true } } },
      },
      stages: true,
    },
  });

  const tournamentRound = tournamentRounds.find((round) =>
    round.matches.find((match) => match.position === matchNumber)
  );
  const match = tournamentRound?.matches.find(
    (match) => match.position === matchNumber
  );

  if (!tournamentRound || !match) return;

  const teamsOrdered = match.participants.sort((a, b) =>
    b.order.localeCompare(a.order)
  );

  return {
    title: `${teamsOrdered[0].team.name} vs. ${teamsOrdered[1].team.name}`,
    roundName: getRoundNameByPositions(
      tournamentRound.position,
      tournamentRounds.map((round) => round.position)
    ),
  };
}
