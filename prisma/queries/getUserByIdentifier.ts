import { PrismaClient } from "@prisma/client";
import { Unwrap } from "lib/types";

export type GetUserByIdentifierData = Unwrap<
  ReturnType<typeof getUserByIdentifier>
>;

export const getUserByIdentifier = async (
  prisma: PrismaClient,
  identifier: string
) => {
  return prisma.user.findFirst({
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
};
