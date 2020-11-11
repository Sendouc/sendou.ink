import { PrismaClient } from "@prisma/client";
import { codeToWeapon } from "lib/lists/weaponCodes";
import { NextApiRequest, NextApiResponse } from "next";
import {
  getBuildsByWeapon,
  GetBuildsByWeaponData,
} from "prisma/queries/getBuildsByWeapon";

const prisma = new PrismaClient();

const weaponHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetBuildsByWeaponData>
) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const key = req.query.weapon as keyof typeof codeToWeapon;
  const weapon = codeToWeapon[key];

  if (!weapon) return res.status(400).end();

  const builds = await getBuildsByWeapon({
    prisma,
    weapon,
  });

  res.status(200).json(builds);
};

export default weaponHandler;
