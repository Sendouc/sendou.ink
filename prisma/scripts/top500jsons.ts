import { Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import { getWeaponNormalized } from "../../utils/lists/weapons";
import prisma from "../client";

const MONTHS = [
  "",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

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

  const files = await fs.readdir(path.join(__dirname, "data"));

  if (files.length !== 4) throw Error("not 4");

  let sz: any = null;
  let tc: any = null;
  let rm: any = null;
  let cb: any = null;

  let month = -1;
  let year = -1;

  for (const file of files) {
    const fileParts = file.replace(".json", "").split("_");
    year = Number(fileParts[fileParts.length - 1]);
    // @ts-expect-error
    month = MONTHS.indexOf(fileParts[0]);

    let previousMonth = new Date().getMonth();
    let previousYear = new Date().getFullYear();
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear = previousYear - 1;
    }
    if (month !== previousMonth) {
      throw Error("month mismatch");
    }
    if (year !== previousYear) {
      throw Error("year mismatch");
    }

    const contents = JSON.parse(
      await fs.readFile(path.join(__dirname, "data", file), "utf8")
    );

    if (file.includes("splat_zones")) {
      sz = contents;
    } else if (file.includes("tower_control")) {
      tc = contents;
    } else if (file.includes("rainmaker")) {
      rm = contents;
    } else if (file.includes("clam_blitz")) {
      cb = contents;
    } else {
      throw Error("unknown file");
    }
  }

  if ([sz, tc, rm, cb].some((x) => x === null)) {
    throw Error("null mode");
  }

  const inputSZ = sz
    .filter(filterJson)
    .map((json: any) => jsonToInput(json, "SZ", month, year));

  const inputTC = tc
    .filter(filterJson)
    .map((json: any) => jsonToInput(json, "TC", month, year));

  const inputRM = rm
    .filter(filterJson)
    .map((json: any) => jsonToInput(json, "RM", month, year));

  const inputCB = cb
    .filter(filterJson)
    .map((json: any) => jsonToInput(json, "CB", month, year));

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

  const playerNamesToUpdate = await prisma.player.findMany({
    where: { name: null, placements: { some: { NOT: { weapon: "" } } } },
    include: { placements: true },
  });

  for (const player of playerNamesToUpdate) {
    await prisma.player.update({
      where: { switchAccountId: player.switchAccountId },
      data: {
        name: player.placements[0].playerName,
        isJP: isNameJapanese(player.placements[0].playerName) && !player.userId,
      },
    });
    console.log("updated name for:", player.placements[0].playerName);
  }
};

function isNameJapanese(name: string) {
  const jpCharaRegex =
    /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;

  let ratio = 0;
  for (const character of name.split("")) {
    if (jpCharaRegex.test(character)) ratio++;
    else ratio--;
  }

  return ratio > 0;
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
