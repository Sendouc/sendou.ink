import { PrismaClient } from "@prisma/client";
import { Unwrap } from "lib/types";

export type GetBuildsByWeaponData = Unwrap<
  ReturnType<typeof getBuildsByWeapon>
>;

type BuildsByWeapon = Unwrap<ReturnType<typeof getBuildsByWeaponQuery>>;

const getBuildsByWeaponQuery = async ({
  prisma,
  weapon,
}: {
  prisma: PrismaClient;
  weapon: string;
}) => {
  return prisma.build.findMany({
    where: { weapon },
    orderBy: [
      { top500: "desc" },
      { jpn: "desc" },
      { userId: "desc" },
      { updatedAt: "desc" },
    ],
    include: {
      user: {
        select: {
          username: true,
          discriminator: true,
          discordId: true,
          discordAvatar: true,
        },
      },
    },
  });
};

export const getBuildsByWeapon = async (args: {
  prisma: PrismaClient;
  weapon: string;
}) => {
  const builds = await getBuildsByWeaponQuery(args);

  return builds.reduce((acc: BuildsByWeapon[], build, i) => {
    if (i === 0 || acc[acc.length - 1][0].userId !== build.userId) {
      acc.push([build]);
    } else acc[acc.length - 1].push(build);

    return acc;
  }, []);
};
