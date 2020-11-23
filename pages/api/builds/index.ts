import { Ability } from "@prisma/client";
import { GANBA_DISCORD_ID } from "lib/constants";
import { getMySession } from "lib/getMySession";
import { altWeaponToNormal } from "lib/lists/weapons";
import { buildSchema } from "lib/validators/build";
import { NextApiRequest, NextApiResponse } from "next";
import DBClient from "prisma/client";

const prisma = DBClient.getInstance().prisma;

const buildHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const parsed = buildSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).end();
  }

  const postsJpBuilds = user.discordId === GANBA_DISCORD_ID;

  if (
    !postsJpBuilds &&
    (await prisma.build.count({ where: { id: user.id } })) >= 100
  ) {
    return res
      .status(400)
      .json({ message: "You have too many builds posted already" });
  }

  const getAbilityPoints = () => {
    const result: Partial<Record<Ability, number>> = {};

    const getPointsFromAbilityArray = (ability: Ability, index: number) => {
      const existingAmount = result[ability] ?? 0;
      const apsToAdd = index === 0 ? 10 : 3;

      result[ability] = existingAmount + apsToAdd;
    };

    parsed.data.headAbilities.forEach(getPointsFromAbilityArray);
    parsed.data.clothingAbilities.forEach(getPointsFromAbilityArray);
    parsed.data.shoesAbilities.forEach(getPointsFromAbilityArray);

    return result;
  };

  const hasTop500WithTheWeapon = async () => {
    const playerData = await prisma.player.findFirst({
      where: { userId: user.id },
      include: { placements: true },
    });

    if (!playerData) return false;

    const weaponNormalized = altWeaponToNormal.has(parsed.data.weapon)
      ? altWeaponToNormal.get(parsed.data.weapon)
      : parsed.data.weapon;

    return playerData.placements.some(
      (placement) => placement.weapon === weaponNormalized
    );
  };

  await prisma.build.create({
    data: {
      ...parsed.data,
      abilityPoints: getAbilityPoints(),
      jpn: postsJpBuilds,
      top500: await hasTop500WithTheWeapon(),
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.status(200).end();
};

export default buildHandler;
