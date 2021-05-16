import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetBuildsByWeaponData = Prisma.PromiseReturnType<
  typeof getBuildsByWeapon
>;

type BuildsByWeapon = Prisma.PromiseReturnType<typeof getBuildsByWeaponQuery>;

const getBuildsByWeaponQuery = async (weapon: string) =>
  prisma.build.findMany({
    where: { weapon },
    orderBy: [
      { top500: "desc" },
      { jpn: "desc" },
      { user: { plusStatus: { membershipTier: "asc" } } },
      { updatedAt: "desc" },
    ],
    include: {
      user: { include: { plusStatus: { select: { membershipTier: true } } } },
    },
  });

export const getBuildsByWeapon = async (weapon: string) =>
  getBuildsByWeaponQuery(weapon).then((builds) =>
    Array.from(
      builds
        .reduce((usersBuild, build) => {
          if (usersBuild.has(build.userId)) {
            usersBuild.get(build.userId)!.push(build);
          } else {
            usersBuild.set(build.userId, [build]);
          }

          return usersBuild;
        }, new Map<number, BuildsByWeapon>())
        .entries()
    ).map(([_userId, buildArray]) => buildArray)
  );
