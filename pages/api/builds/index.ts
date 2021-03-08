import { Ability } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getMySession } from "utils/api";
import { GANBA_DISCORD_ID } from "utils/constants";
import { getWeaponNormalized } from "utils/lists/weapons";
import { buildSchema } from "utils/validators/build";

const modes = ["TW", "SZ", "TC", "RM", "CB"];

const buildHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);

  switch (req.method) {
    case "POST":
      await postHandler();
      break;
    case "PUT":
      await updateHandler();
      break;
    case "DELETE":
      await deleteHandler();
      break;
    default:
      return res.status(405).end();
  }

  async function postHandler() {
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
        top500: await hasTop500WithTheWeapon(user.id, parsed.data.weapon),
        userId: user.id,
      },
    });

    res.status(200).end();
  }

  async function updateHandler() {
    if (!user) return res.status(401).end();

    const parsed = buildSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).end();
    }

    const id = parsed.data.id;

    const existingBuild = await prisma.build.findUnique({
      where: { id },
    });

    if (!existingBuild) {
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
        top500:
          parsed.data.weapon === existingBuild.weapon
            ? existingBuild.top500
            : await hasTop500WithTheWeapon(user.id, parsed.data.weapon),
        abilityPoints: getAbilityPoints(
          parsed.data.headAbilities,
          parsed.data.clothingAbilities,
          parsed.data.shoesAbilities
        ),
      },
    });

    res.status(200).end();
  }

  async function deleteHandler() {
    if (!user) return res.status(401).end();

    const id = parseInt(req.body.id);
    if (Number.isNaN(id)) return res.status(400).end();

    const buildToDelete = await prisma.build.findUnique({ where: { id } });
    if (!buildToDelete) return res.status(400).end();
    if (buildToDelete.userId !== user.id) return res.status(401).end();

    await prisma.build.delete({ where: { id } });

    res.status(200).end();
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

async function hasTop500WithTheWeapon(userId: number, weapon: string) {
  const playerData = await prisma.player.findFirst({
    where: { userId: userId },
    include: { placements: true },
  });

  if (!playerData) return false;

  return playerData.placements.some(
    (placement) => placement.weapon === getWeaponNormalized(weapon)
  );
}

export default buildHandler;
