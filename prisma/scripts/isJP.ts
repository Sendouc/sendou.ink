import prisma from "../client";

const main = async () => {
  const players = await prisma.player.findMany({
    where: { NOT: { name: null }, isJP: false },
  });

  const jpCharaRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;

  const jps: string[] = [];

  for (const player of players) {
    let ratio = 0;
    for (const character of player.name!.split("")) {
      if (jpCharaRegex.test(character)) ratio++;
      else ratio--;
    }

    if (ratio > 0 && !player.userId) {
      jps.push(player.switchAccountId);
      console.log(player.name);
    }
  }

  await prisma.player.updateMany({
    data: { isJP: true },
    where: { switchAccountId: { in: jps } },
  });

  // const players = await prisma.player.findMany({
  //   where: { NOT: { name: null }, isJP: false },
  //   include: { leaguePlacements: { include: { squad: true } } },
  // });

  // const actuallyJP: string[] = [];

  // for (const player of players) {
  //   let ratio = 0;
  //   for (const placement of player.leaguePlacements) {
  //     if (placement.squad.region === "JP") ratio++;
  //     else ratio--;
  //   }
  //   if (ratio > 0) {
  //     actuallyJP.push(player.switchAccountId);
  //     console.log(player.name);
  //   }
  // }

  // await prisma.player.updateMany({
  //   data: { isJP: true },
  //   where: { switchAccountId: { in: actuallyJP } },
  // });

  // console.log("done", players.length);

  // const players = await prisma.player.findMany({
  //   where: { name: null, placements: { some: { NOT: { weapon: "" } } } },
  //   include: { placements: true },
  // });

  // for (const player of players) {
  //   await prisma.player.update({
  //     where: { switchAccountId: player.switchAccountId },
  //     data: { name: player.placements[0].playerName },
  //   });
  //   console.log(player.placements[0].playerName);
  // }

  // console.log("players.length", players.length);
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
