/* eslint-disable no-console */
import "dotenv/config";

import invariant from "tiny-invariant";
import { sql } from "~/db/sql";
import type { XRankPlacement } from "~/db/types";
import { type MainWeaponId, mainWeaponIds } from "~/modules/in-game-lists";
import { xRankSchema } from "./schemas";

type Placements = Array<
  Omit<XRankPlacement, "playerId" | "id"> & { playerSplId: string }
>;

const modes = ["splatzones", "towercontrol", "rainmaker", "clamblitz"] as const;
const modeToShort = {
  splatzones: "SZ",
  towercontrol: "TC",
  rainmaker: "RM",
  clamblitz: "CB",
} as const;
const regions = ["a", "p"] as const;

void main();

async function main() {
  const placements: Placements = [];

  for (const mode of modes) {
    for (const region of regions) {
      for (const includeWeapon of [false]) {
        placements.push(
          ...(await processJson({ includeWeapon, mode, region, number: 2 }))
        );
      }
    }
  }

  addPlacements(placements);
  console.log(`done reading in ${placements.length} placements`);
}

async function processJson(args: {
  mode: (typeof modes)[number];
  region: (typeof regions)[number];
  includeWeapon: boolean;
  number: number;
}) {
  const result: Placements = [];

  const url = `https://splatoon3.ink/data/xrank/xrank.detail.${args.region}-${
    args.number
  }.${args.mode}${args.includeWeapon ? ".weapons" : ""}.json`;

  console.log(`reading in ${url}...`);

  const json = await fetch(url).then((res) => res.json());
  const validated = xRankSchema.parse(json);

  const array =
    validated.data.node.xRankingAr ??
    validated.data.node.xRankingCl ??
    validated.data.node.xRankingLf ??
    validated.data.node.xRankingGl;
  invariant(array, "array is null");

  for (const { node: placement } of array.edges) {
    const weaponId = Number(atob(placement.weapon.id).replace("Weapon-", ""));
    if (!mainWeaponIds.includes(weaponId as MainWeaponId)) {
      throw new Error(`Invalid weapon ID: ${weaponId}`);
    }

    const { month, year } = resolveMonthYear(args.number);

    result.push({
      name: placement.name,
      badges: placement.nameplate.badges
        .map((badge) => atob(badge.id).replace("Badge-", ""))
        .join(","),
      bannerSplId: Number(
        atob(placement.nameplate.background.id).replace(
          "NameplateBackground-",
          ""
        )
      ),
      nameDiscriminator: placement.nameId,
      power: placement.xPower,
      rank: placement.rank,
      region: args.region === "p" ? "JPN" : "WEST",
      title: placement.byname,
      weaponSplId: weaponId as MainWeaponId,
      month,
      year,
      mode: modeToShort[args.mode],
      playerSplId: parsePlayerId(placement.id),
    });
  }

  return result;
}

function parsePlayerId(encoded: string) {
  const parts = atob(encoded).split("-");
  const last = parts[parts.length - 1];
  invariant(last, "last is null");

  return last;
}

function resolveMonthYear(number: number) {
  const start = new Date("2023-03-15");
  // 2 is the first X Rank month
  // 3 is the length of x rank season
  const monthsToAdd = (number - 2) * 3;

  start.setMonth(start.getMonth() + monthsToAdd);

  return {
    month: start.getMonth() + 1,
    year: start.getFullYear(),
  };
}

const addPlayerStm = sql.prepare(/* sql */ `
  insert into "SplatoonPlayer" ("splId")
  values (@splId)
  on conflict ("splId") do nothing
`);

const addPlacementStm = sql.prepare(/* sql */ `
  insert into "XRankPlacement" (
    "weaponSplId",
    "name",
    "nameDiscriminator",
    "power",
    "rank",
    "title",
    "badges",
    "bannerSplId",
    "playerId",
    "month",
    "year",
    "region",
    "mode"
  )
  values (
    @weaponSplId,
    @name,
    @nameDiscriminator,
    @power,
    @rank,
    @title,
    @badges,
    @bannerSplId,
    (select "id" from "SplatoonPlayer" where "splId" = @playerSplId),
    @month,
    @year,
    @region,
    @mode
  )
`);

function addPlacements(placements: Placements) {
  sql.transaction(() => {
    for (const placement of placements) {
      addPlayerStm.run({ splId: placement.playerSplId });
      addPlacementStm.run(placement);
    }
  })();
}
