import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.lfgGroupMatch.findMany({
    include: {
      stages: { include: { stage: true } },
      groups: { include: { members: { include: { user: true } } } },
    },
  });

  const result: {
    id: string;
    mapList: { mode: string; map: string }[];
    start_time: string;
    end_time: string;
    players: string[];
  }[] = [];

  for (const match of matches) {
    const mapList = match.stages
      .sort((a, b) => a.order - b.order)
      .filter((stage) => stage.winnerGroupId)
      .map((stage) => ({ map: stage.stage.name, mode: stage.stage.mode }));

    if (!mapList.length) continue;

    result.push({
      id: match.id,
      mapList,
      start_time: match.createdAt.toISOString(),
      end_time: new Date(match.createdAt.getTime() + 60 * 60000).toISOString(),
      players: match.groups
        .flatMap((g) => g.members)
        .flatMap((m) => m.user.discordId),
    });
  }

  fs.writeFileSync("for_lean.json", JSON.stringify(result, null, 2));
}

main()
  // eslint-disable-next-line no-console
  .then(() => console.log("done"))
  .catch((e) => console.error(e));
