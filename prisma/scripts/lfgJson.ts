import prisma from "../client";
import fs from "fs";
import path from "path";

// Include Prisma's .env file as well, so we can fetch the DATABASE_URL
require("dotenv").config({ path: "prisma/.env" });

const main = async () => {
  const users = await prisma.user.findMany({
    include: {
      profile: { select: { weaponPool: true } },
      player: {
        include: {
          leaguePlacements: {
            select: { squad: { select: { leaguePower: true } } },
          },
          placements: { select: { xPower: true } },
        },
      },
    },
  });

  const data = users.reduce((acc, cur) => {
    let peakXP = cur.player?.placements.reduce((acc, cur) => {
      if (acc < cur.xPower) return cur.xPower;

      return acc;
    }, -Infinity);
    if (peakXP === -Infinity) peakXP = undefined;

    let peakLP = cur.player?.leaguePlacements.reduce((acc, cur) => {
      if (acc < cur.squad.leaguePower) return cur.squad.leaguePower;

      return acc;
    }, -Infinity);
    if (peakLP === -Infinity) peakLP = undefined;

    acc[cur.discordId] = {
      weapons: cur.profile?.weaponPool.length
        ? cur.profile?.weaponPool
        : undefined,
      peakXP,
      peakLP,
    };

    return acc;
  }, {} as Record<string, { weapons?: string[]; peakXP?: number; peakLP?: number }>);

  const result = Object.fromEntries(
    Object.entries(data).filter(([_key, value]) => {
      return JSON.stringify(value) !== "{}";
    })
  );

  fs.writeFile(
    path.resolve(__dirname, "lfg.json"),
    JSON.stringify(result, null, 2),
    function (err) {
      if (err) throw err;
    }
  );
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
