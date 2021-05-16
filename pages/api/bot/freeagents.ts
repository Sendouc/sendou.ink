import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const teamsFreeAgentsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const dateMonthAgo = new Date();
  dateMonthAgo.setMonth(dateMonthAgo.getMonth() - 1);

  const freeAgents = await prisma.freeAgentPost.findMany({
    select: {
      id: true,
      canVC: true,
      content: true,
      playstyles: true,
      updatedAt: true,
      user: {
        select: {
          discordId: true,
          discordAvatar: true,
          username: true,
          discriminator: true,
          profile: {
            select: { country: true, weaponPool: true, updatedAt: true },
          },
        },
      },
    },
    where: { updatedAt: { gte: dateMonthAgo } },
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.status(200).json(freeAgents);
};

export default teamsFreeAgentsHandler;
