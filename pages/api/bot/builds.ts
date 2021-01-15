import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const buildsBotHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const weapon =
    typeof req.query.weapon === "string" ? req.query.weapon : undefined;
  const discordId =
    typeof req.query.discordId === "string" ? req.query.discordId : undefined;

  if (weapon && discordId) {
    return res
      .status(400)
      .json({ message: "Choose either discordId or weapon not both." });
  }
  if (!weapon && !discordId) {
    return res
      .status(400)
      .json({ message: "Include discordId or weapon as query parameter." });
  }

  const builds = await prisma.build.findMany({
    where: weapon ? { weapon } : { user: { discordId } },
    select: {
      abilityPoints: true,
      clothingAbilities: true,
      clothingGear: true,
      description: true,
      headAbilities: true,
      headGear: true,
      id: true,
      jpn: true,
      modes: true,
      shoesAbilities: true,
      shoesGear: true,
      title: true,
      top500: true,
      updatedAt: true,
      weapon: true,
      user: {
        select: {
          discordId: true,
          discriminator: true,
          username: true,
        },
      },
    },
    orderBy: [{ top500: "desc" }, { jpn: "desc" }, { updatedAt: "desc" }],
  });

  res.status(200).json(builds);
};

export default buildsBotHandler;
