import prisma from "../client";
import principalToUnique from "./data/league/principal_to_unique.json";

const main = async () => {
  const players = await prisma.player.findMany({});

  console.log("amount", Object.entries(principalToUnique));

  const mapped = Object.entries(principalToUnique).reduce((acc, cur) => {
    acc.set("" + cur[1], cur[0]);

    return acc;
  }, new Map<string, string>());

  let notFound = 0;

  players.forEach((player) => {
    const found = mapped.get(player.switchAccountId);

    if (!found) notFound++;
  });

  console.log("notFound", notFound);
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
