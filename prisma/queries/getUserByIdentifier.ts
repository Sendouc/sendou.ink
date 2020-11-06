import { PrismaClient } from "@prisma/client";

type Unwrap<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : T;

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
