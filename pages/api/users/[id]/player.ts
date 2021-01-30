import { getMySession } from "lib/api";
import { ADMIN_DISCORD_ID } from "lib/constants";
import { getWeaponNormalized } from "lib/lists/weapons";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PATCH") {
    return res.status(405).end();
  }

  const user = await getMySession(req);
  if (user?.discordId !== ADMIN_DISCORD_ID) return res.status(401).end();

  const discordId = req.query.id;
  const { switchAccountId } = req.body;
  if (typeof discordId !== "string" || !switchAccountId)
    return res.status(400).end();

  const userToUpdate = await prisma.user.findUnique({ where: { discordId } });
  if (!userToUpdate) return res.status(400).end();

  const [player, builds] = await Promise.all([
    prisma.player.findUnique({
      where: { switchAccountId },
      include: { placements: true },
    }),
    prisma.build.findMany({ where: { userId: userToUpdate.id } }),
  ]);

  if (!player) return res.status(400).end();

  const top500weapons = player.placements.reduce((acc, placement) => {
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
      where: { id: userToUpdate.id },
      data: { player: { connect: { switchAccountId } } },
    }),
  ]);

  return res.status(200).end();
};

export default userHandler;
