import { getWeaponNormalized } from "lib/lists/weapons";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const connectHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  console.log("req.body", req.body);

  const { token, principalId, discordId } = req.body;

  if (
    [token, principalId, discordId].some((param) => typeof param !== "string")
  ) {
    return res.status(400).end();
  }

  console.log("past req body check");

  if (token !== process.env.LANISTA_TOKEN) {
    return res.status(401).end();
  }

  const user = await prisma.user.findUnique({
    where: { discordId },
    include: { player: true },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Please log-in to sendou.ink first" });
  }

  if (user.player) {
    return res
      .status(400)
      .json({ message: "Switch player account already linked" });
  }

  const [players, builds] = await Promise.all([
    prisma.player.findMany({
      where: { principalId },
      include: { user: true, placements: true },
    }),
    prisma.build.findMany({ where: { userId: user.id } }),
  ]);

  if (players.length === 0) {
    return res.status(400).json({ message: "Unexpected no players" });
  }

  if (players.some((player) => player.user)) {
    return res
      .status(400)
      .json({ message: "Another user has linked this Switch account already" });
  }

  if (players.length === 1) {
    const top500weapons = players[0].placements.reduce((acc, placement) => {
      acc.add(placement.weapon);
      return acc;
    }, new Set<string>());

    const idsToUpdate = builds.reduce((acc: number[], build) => {
      if (top500weapons.has(getWeaponNormalized(build.weapon))) {
        acc.push(build.id);
      }

      return acc;
    }, []);

    await prisma.$transaction([
      prisma.build.updateMany({
        where: {
          id: {
            in: idsToUpdate,
          },
        },
        data: {
          top500: true,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          player: { connect: { switchAccountId: players[0].switchAccountId } },
        },
      }),
    ]);

    res.status(200).end();
  } else {
    res.status(409).json({
      message: `Many options to link. Please contact Sendou#4059 with the one you want to connect: ${players
        .map((player) => `https://sendou.ink/player/${player.switchAccountId}`)
        .join(" ")}`,
    });
  }
};

export default connectHandler;
