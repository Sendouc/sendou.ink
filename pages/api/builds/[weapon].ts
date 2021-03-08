import { NextApiRequest, NextApiResponse } from "next";
import {
  getBuildsByWeapon,
  GetBuildsByWeaponData,
} from "prisma/queries/getBuildsByWeapon";
import { codeToWeapon } from "utils/lists/weaponCodes";

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

  const builds = await getBuildsByWeapon(weapon);

  res.status(200).json(builds);
};

export default weaponHandler;
