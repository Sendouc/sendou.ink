import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetUserByIdentifierData = Prisma.PromiseReturnType<
  typeof getUserByIdentifier
>;

export const getUserByIdentifier = (identifier: string) =>
  prisma.user.findFirst({
    where: {
      // this is ok because the values are mutually exclusive
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
          // for some reason it doesn't like passing in id: undefined so using this as workaround
          id: Number(identifier) || -1,
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
