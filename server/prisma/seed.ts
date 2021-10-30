import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const user = await users();
  const organization = await organizations(user.id);
  const tournament = await tournaments(organization.id);
  await stages();
  await tournamentAddMaps(tournament.id);
}

async function users() {
  return prisma.user.create({
    data: {
      discordDiscriminator: "4059",
      discordId: "79237403620945920",
      discordName: "Sendou",
      discordRefreshToken: "none",
      twitch: "Sendou",
      youtubeId: "UCWbJLXByvsfQvTcR4HLPs5Q",
      youtubeName: "Sendou",
      discordAvatar: "fcfd65a3bea598905abb9ca25296816b",
      twitter: "sendouc",
    },
  });
}

async function organizations(userId: number) {
  return prisma.organization.create({
    data: {
      name: "Sendou's Tournaments",
      discordInvite: "sendou",
      nameForUrl: "sendou",
      twitter: "sendouc",
      ownerId: userId,
    },
  });
}

const stageList = [
  "The Reef",
  "Musselforge Fitness",
  "Starfish Mainstage",
  "Humpback Pump Track",
  "Inkblot Art Academy",
  "Sturgeon Shipyard",
  "Moray Towers",
  "Port Mackerel",
  "Manta Maria",
  "Kelp Dome",
  "Snapper Canal",
  "Blackbelly Skatepark",
  "MakoMart",
  "Walleye Warehouse",
  "Shellendorf Institute",
  "Arowana Mall",
  "Goby Arena",
  "Piranha Pit",
  "Camp Triggerfish",
  "Wahoo World",
  "New Albacore Hotel",
  "Ancho-V Games",
  "Skipper Pavilion",
] as const;

const modesList = ["TW", "SZ", "TC", "RM", "CB"] as const;

async function tournaments(organizationId: number) {
  return prisma.tournament.create({
    data: {
      bannerBackground: "linear-gradient(to bottom, #9796f0, #fbc7d4)",
      bannerTextHSLArgs: "231, 9%, 16%",
      checkInTime: new Date(2025, 11, 17, 11),
      startTime: new Date(2025, 11, 17, 12),
      name: "In The Zone X",
      nameForUrl: "in-the-zone-x",
      organizerId: organizationId,
      description: "In The Zone eXtreme",
    },
  });
}

function getRandomInt(maxInclusive: number) {
  let result = -1;

  while (result < 24) {
    result = Math.floor(Math.random() * maxInclusive) + 1;
  }
  return result;
}

// TODO: why this can't be done while creating?
async function tournamentAddMaps(id: number) {
  const ids = Array.from(
    new Set(new Array(24).fill(null).map(() => ({ id: getRandomInt(115) })))
  );

  return prisma.tournament.update({
    where: { id },
    data: {
      mapPool: {
        connect: ids,
      },
    },
  });
}

async function stages() {
  return prisma.stage.createMany({
    data: modesList.flatMap((mode) => {
      return stageList.map((name) => {
        return {
          name,
          mode,
        };
      });
    }),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
