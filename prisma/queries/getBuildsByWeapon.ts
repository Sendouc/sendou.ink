import { PrismaClient } from "@prisma/client";
import { Unwrap } from "lib/types";

export type GetBuildsByWeaponData = Unwrap<
  ReturnType<typeof getBuildsByWeapon>
>;

export const getBuildsByWeapon = async ({
  prisma,
  weapon,
}: {
  prisma: PrismaClient;
  weapon: string;
}) => {
  return prisma.build.findMany({
    where: { weapon },
    orderBy: [{ top500: "desc" }, { jpn: "desc" }, { updatedAt: "desc" }],
  });
};
