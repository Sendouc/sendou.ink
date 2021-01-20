import prisma from "../client";
import principalToUnique from "./data/league/uuid2pid.json";

const main = async () => {
  const players = await prisma.player.findMany({
    where: { principalId: null },
  });

  const mapped = Object.entries(principalToUnique).reduce((acc, cur) => {
    acc.set("" + cur[0], cur[1]);

    return acc;
  }, new Map<string, string>());

  await Promise.allSettled(
    players
      .filter((player) => {
        if (mapped.get(player.switchAccountId)) return true;

        throw Error(player.switchAccountId);
      })
      .map((player) =>
        prisma.player.update({
          where: { switchAccountId: player.switchAccountId },
          data: { principalId: mapped.get(player.switchAccountId) },
        })
      )
  );

  console.log("all done");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
