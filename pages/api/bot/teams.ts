import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const teamsBotHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  let teams: any = await prisma.team.findMany({
    select: {
      bio: true,
      captainId: true,
      id: true,
      name: true,
      recruitingPost: true,
      twitterName: true,
      nameForUrl: true,
      roster: {
        select: {
          id: true,
          discordId: true,
          discordAvatar: true,
          discriminator: true,
          username: true,
          profile: {
            select: {
              country: true,
              weaponPool: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  teams = teams.map((team: any) => ({
    ...team,
    url: `https://sendou.ink/t/${team.nameForUrl}`,
    roster: team.roster.map((user: any) => ({
      ...user,
      captain: user.id === team.captainId ? true : undefined,
      id: undefined,
    })),
    nameForUrl: undefined,
    captainId: undefined,
  }));

  res.status(200).json(teams);
};

export default teamsBotHandler;
