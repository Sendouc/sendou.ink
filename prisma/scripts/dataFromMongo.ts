import {
  BuildCreateWithoutUserInput,
  UserCreateInput,
  XRankPlacementCreateInput,
} from "@prisma/client";
import DBClient from "prisma/client";
import buildsJson from "./mongo/builds.json";
import placementsJson from "./mongo/placements.json";
import playersJson from "./mongo/players.json";
import usersJson from "./mongo/users.json";

const prisma = DBClient.getInstance().prisma;

const twitterToSwitchAccountId = new Map<string, string>();

for (const player of playersJson) {
  if (player.twitter)
    twitterToSwitchAccountId.set(player.twitter, player.unique_id);
}

const twitterToPlayerName = new Map<string, string>();

for (const player of playersJson) {
  if (player.twitter) twitterToPlayerName.set(player.twitter, player.name);
}

const discordIdToBuilds = new Map<string, BuildCreateWithoutUserInput[]>();

// @ts-ignore
for (const build of buildsJson) {
  const existing = discordIdToBuilds.get(build.discord_id);

  const newBuild = {
    abilityPoints: buildToAp(build.headgear, build.clothing, build.shoes),
    jpn: build.jpn ?? false,
    top500: build.top,
    weapon: build.weapon,
    clothingAbilities: build.clothing,
    clothingGear: build.clothingItem,
    updatedAt: new Date(build.updatedAt.$date),
    description: build.description,
    headAbilities: build.headgear,
    headGear: build.headgearItem,
    shoesAbilities: build.shoes,
    shoesGear: build.shoesItem,
    title: build.title,
  } as const;

  if (existing) {
    existing.push(newBuild);
  } else {
    discordIdToBuilds.set(build.discord_id, [newBuild]);
  }
}

const customUrls = new Set<string>();

usersJson.forEach((u) => {
  if (!!u.custom_url) {
    if (customUrls.has(u.custom_url)) console.log(u.custom_url);

    customUrls.add(u.custom_url);
  }
});

const users: UserCreateInput[] = usersJson.map((u) => ({
  discordAvatar: u.avatar,
  discordId: u.discord_id,
  discriminator: u.discriminator,
  username: u.username,
  profile: {
    create: {
      bio: u.bio ?? undefined,
      country: u.country ? u.country.toUpperCase() : undefined,
      //customUrlPath: u.custom_url ?? undefined,
      sensMotion: u.sens?.stick,
      sensStick: u.sens?.motion,
      twitchName: u.twitch_name ?? undefined,
      twitterName: u.twitter_name ?? undefined,
      weaponPool: u.weapons ?? [],
      youtubeId: u.youtube_id ?? undefined,
    },
  },
  player: twitterToSwitchAccountId.has(u.twitter_name)
    ? {
        create: {
          name: twitterToPlayerName.get(u.twitter_name)!,
          switchAccountId: twitterToSwitchAccountId.get(u.twitter_name)!,
        },
      }
    : undefined,
  builds: !!discordIdToBuilds.has(u.discord_id)
    ? { create: discordIdToBuilds.get(u.discord_id) }
    : undefined,
}));

const longest = usersJson.reduce(
  (acc, cur) => Math.max(acc, cur.bio?.length ?? 0),
  0
);

console.log({ "longest bio is": longest });

const placements: XRankPlacementCreateInput[] = [];

// "name": "かち",
//   "weapon": "Splat Brella",
//   "rank": 1,
//   "mode": 4,
//   "x_power": 2751,
//   "unique_id": "18202705273199683091",
//   "month": 8,
//   "year": 2018

// @ts-ignore
for (const placement of placementsJson) {
  placements.push({
    // @ts-ignore
    mode: ["", "SZ", "TC", "RM", "CB"][placement.mode],
    month: placement.month,
    player: {
      connectOrCreate: {
        where: {
          switchAccountId: placement.unique_id,
        },
        create: {
          name: placement.name,
          switchAccountId: placement.unique_id,
        },
      },
    },
    playerName: placement.name,
    ranking: placement.rank,
    weapon: placement.weapon,
    xPower: placement.x_power,
    year: placement.year,
  });
}

function buildToAp(aArr: any[], bArr: any[], cArr: any[]) {
  const result = {};

  function addToResult(item: any, index: number) {
    // @ts-ignore
    const existing = result[item] ?? 0;
    const toAdd = index === 0 ? 10 : 3;

    // @ts-ignore
    result[item] = existing + toAdd;
  }

  aArr.forEach(addToResult);
  bArr.forEach(addToResult);
  cArr.forEach(addToResult);

  return result;
}

const main = async () => {
  await prisma.build.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.xRankPlacement.deleteMany({});
  await prisma.player.deleteMany({});

  await Promise.all(users.map((u) => prisma.user.create({ data: u })));
  console.log("Created users");
  await Promise.all(
    placements.map((p) => prisma.xRankPlacement.create({ data: p }))
  );
  console.log("Created placements");
};

main();
