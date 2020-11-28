import { Ability, PrismaClient } from "@prisma/client";
import { GANBA_DISCORD_ID } from "lib/constants";
import { getMySession } from "lib/getMySession";
import { altWeaponToNormal } from "lib/lists/weapons";
import { buildSchema } from "lib/validators/build";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const modes = ["TW", "SZ", "TC", "RM", "CB"];

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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
      modes: parsed.data.modes.sort(
        (a, b) => modes.indexOf(a) - modes.indexOf(b)
      ),
      abilityPoints: getAbilityPoints(
        parsed.data.headAbilities,
        parsed.data.clothingAbilities,
        parsed.data.shoesAbilities
      ),
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

const updateHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const parsed = buildSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).end();
  }

  const id = parsed.data.id;

  const existingBuild = await prisma.build.findUnique({
    where: { id },
  });

  if (!existingBuild || existingBuild.weapon !== parsed.data.weapon) {
    return res.status(400).end();
  }

  if (existingBuild.userId !== user.id) {
    return res.status(403).end();
  }

  delete parsed.data.id;

  await prisma.build.update({
    where: { id },
    data: {
      ...parsed.data,
      modes: parsed.data.modes.sort(
        (a, b) => modes.indexOf(a) - modes.indexOf(b)
      ),
      abilityPoints: getAbilityPoints(
        parsed.data.headAbilities,
        parsed.data.clothingAbilities,
        parsed.data.shoesAbilities
      ),
    },
  });

  res.status(200).end();
};

const buildHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      await postHandler(req, res);
      break;
    case "PUT":
      await updateHandler(req, res);
      break;
    default:
      return res.status(405).end();
  }
};

function getAbilityPoints(
  headAbilities: Ability[],
  clothingAbilities: Ability[],
  shoesAbilities: Ability[]
) {
  const result: Partial<Record<Ability, number>> = {};

  const getPointsFromAbilityArray = (ability: Ability, index: number) => {
    const existingAmount = result[ability] ?? 0;
    const apsToAdd = index === 0 ? 10 : 3;

    result[ability] = existingAmount + apsToAdd;
  };

  headAbilities.forEach(getPointsFromAbilityArray);
  clothingAbilities.forEach(getPointsFromAbilityArray);
  shoesAbilities.forEach(getPointsFromAbilityArray);

  return result;
}

export default buildHandler;
