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
    include: {
      profile: true,
    },
  });
};
