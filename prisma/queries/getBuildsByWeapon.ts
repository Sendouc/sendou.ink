import { PromiseReturnType } from "@prisma/client";
import DBClient from "prisma/client";

export type GetBuildsByWeaponData = PromiseReturnType<typeof getBuildsByWeapon>;

type BuildsByWeapon = PromiseReturnType<typeof getBuildsByWeaponQuery>;

const prisma = DBClient.getInstance().prisma;

const getBuildsByWeaponQuery = async (weapon: string) =>
  prisma.build.findMany({
    where: { weapon },
    orderBy: [{ top500: "desc" }, { jpn: "desc" }, { updatedAt: "desc" }],
    include: { user: true },
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
