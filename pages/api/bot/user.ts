import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const discordId =
    typeof req.query.discordId === "string" ? req.query.discordId : undefined;

  if (!discordId) {
    return res
      .status(400)
      .json({ message: "Include 'discordId' as query parameter." });
  }

  const users = await prisma.user.findUnique({
    where: { discordId },
    select: {
      discordAvatar: true,
      username: true,
      discriminator: true,
      profile: {
        select: {
          twitchName: true,
          twitterName: true,
          youtubeId: true,
          weaponPool: true,
          sensMotion: true,
          sensStick: true,
          country: true,
        },
      },
      team: {
        select: {
          name: true,
          nameForUrl: true,
          twitterName: true,
        },
      },
      player: {
        select: {
          switchAccountId: true,
          placements: {
            select: {
              mode: true,
              month: true,
              year: true,
              weapon: true,
              ranking: true,
              playerName: true,
              xPower: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json(users);
};

export default userHandler;
