import { Prisma } from "@prisma/client";
import { getWeaponNormalized } from "../../lib/lists/weapons";
import prisma from "../client";
import cb from "./data/january_clam_blitz_2021.json";
import rm from "./data/january_rainmaker_2021.json";
import sz from "./data/january_splat_zones_2021.json";
import tc from "./data/january_tower_control_2021.json";

const MONTH = 1;
const YEAR = 2021;

const filterJson = (result: any) => !result.cheater;

const jsonToInput = (
  result: any,
  mode: "SZ" | "TC" | "RM" | "CB",
  month: number,
  year: number
): Prisma.XRankPlacementCreateManyInput => ({
  playerName: result.name,
  mode,
  month,
  year,
  ranking: result.rank,
  xPower: result.x_power,
  weapon: getWeaponNormalized(result.weapon.name.trim()),
  switchAccountId: result.unique_id,
});

const jsonToPlayerInput = (result: any): Prisma.PlayerCreateManyInput => ({
  switchAccountId: result.unique_id,
  name: result.name,
  principalId: result.principal_id,
});

const jsonToWeaponArrMap = (acc: Map<string, string[]>, result: any) => {
  const weaponArr = acc.get(result.unique_id) ?? [];
  acc.set(
    result.unique_id,
    weaponArr.concat(getWeaponNormalized(result.weapon.name))
  );

  return acc;
};

const main = async () => {
  const builds = await prisma.build.findMany({
    where: {
      top500: false,
    },
    include: { user: { include: { player: true } } },
  });

  const inputSZ = sz
    .filter(filterJson)
    .map((json) => jsonToInput(json, "SZ", MONTH, YEAR));

  const inputTC = tc
    .filter(filterJson)
    .map((json) => jsonToInput(json, "TC", MONTH, YEAR));

  const inputRM = rm
    .filter(filterJson)
    .map((json) => jsonToInput(json, "RM", MONTH, YEAR));

  const inputCB = cb
    .filter(filterJson)
    .map((json) => jsonToInput(json, "CB", MONTH, YEAR));

  const playersData = [...sz, ...tc, ...rm, ...cb].map(jsonToPlayerInput);

  const idsToWeapons = [...sz, ...tc, ...rm, ...cb].reduce(
    jsonToWeaponArrMap,
    new Map()
  );

  const idsToUpdate: number[] = [];

  builds.forEach((build) => {
    if (!build.user.player?.switchAccountId) return;
    const weaponArr = idsToWeapons.get(build.user.player.switchAccountId);
    if (!weaponArr) return;
    if (!weaponArr.includes(getWeaponNormalized(build.weapon))) return;

    idsToUpdate.push(build.id);
  });

  await prisma.player.createMany({ data: playersData, skipDuplicates: true });

  console.log("players created");

  await prisma.xRankPlacement.createMany({
    data: [...inputSZ, ...inputTC, ...inputRM, ...inputCB],
  });
  console.log("new placements submitted");

  await prisma.build.updateMany({
    where: {
      id: {
        in: idsToUpdate,
      },
    },
    data: {
      top500: true,
    },
  });
  console.log("builds updated:", idsToUpdate.length);
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
