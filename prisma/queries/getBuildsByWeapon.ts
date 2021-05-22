import { Prisma } from "@prisma/client";
import prisma from "prisma/client";
import { altWeaponToNormal } from "utils/lists/weapons";

export type GetBuildsByWeaponData = Prisma.PromiseReturnType<
  typeof getBuildsByWeapon
>;

type BuildsByWeapon = Prisma.PromiseReturnType<typeof getBuildsByWeaponQuery>;

const getBuildsByWeaponQuery = async (weapon: string) => {
  const normalWeaponToAlt = new Map(
    Array.from(altWeaponToNormal, (entry) => [entry[1], entry[0]])
  );

  const where = normalWeaponToAlt.has(weapon)
    ? { OR: [{ weapon }, { weapon: normalWeaponToAlt.get(weapon) }] }
    : { weapon };
  return prisma.build.findMany({
    where,
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
};

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
