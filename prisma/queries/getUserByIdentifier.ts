import { PromiseReturnType } from "@prisma/client";
import DBClient from "prisma/client";

export type GetUserByIdentifierData = PromiseReturnType<
  typeof getUserByIdentifier
>;

const prisma = DBClient.getInstance().prisma;

export const getUserByIdentifier = (identifier: string) =>
  prisma.user.findFirst({
    where: {
      // this is ok because the values are mutually exclusive: customUrlPath can't contain only numbers etc.
      OR: [
        {
          discordId: identifier,
        },
        {
          profile: {
            customUrlPath: identifier.toLowerCase(),
          },
        },
        {
          id: Number(identifier),
        },
      ],
    },
    select: {
      id: true,
      discordId: true,
      discordAvatar: true,
      username: true,
      discriminator: true,
      profile: {
        select: {
          bio: true,
          country: true,
          customUrlPath: true,
          sensMotion: true,
          sensStick: true,
          twitchName: true,
          twitterName: true,
          weaponPool: true,
          youtubeId: true,
        },
      },
      player: {
        select: {
          switchAccountId: true,
        },
      },
    },
  });
