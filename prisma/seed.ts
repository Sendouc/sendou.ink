import { PrismaClient } from "@prisma/client";
import { stages as stagesList } from "../app/constants";
import { readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
const prisma = new PrismaClient();

export const ADMIN_UUID = "846e12eb-d373-4002-a0c3-e23077e1c88c";
export const ADMIN_DISCORD_ID = "79237403620945920";
export const ADMIN_AVATAR = "fcfd65a3bea598905abb9ca25296816b";

async function main() {
  //
  // make sure we won't override production database
  //
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw Error(
      "Trying to seed a database not in localhost or DATABASE_URL env var is not set"
    );
  }

  //
  // wipe database
  //
  await prisma.tournamentTeamMember.deleteMany();
  await prisma.tournamentTeam.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stage.deleteMany();

  //
  // create mock data
  //
  const adminUserCreated = await adminUser();
  const userIds = new Array(500).fill(null).map(() => crypto.randomUUID());
  await users(userIds);
  const organization = await organizations(adminUserCreated.id);
  const tournament = await tournaments(organization.id);
  await tournamentTeams(tournament.id, userIds);
  const stageIds = await stages();
  await tournamentAddMaps(tournament.id, stageIds);
}

async function adminUser() {
  return prisma.user.create({
    data: {
      id: ADMIN_UUID,
      discordDiscriminator: "4059",
      discordId: ADMIN_DISCORD_ID,
      discordName: "Sendou",
      discordRefreshToken: "none",
      twitch: "Sendou",
      youtubeId: "UCWbJLXByvsfQvTcR4HLPs5Q",
      youtubeName: "Sendou",
      discordAvatar: ADMIN_AVATAR,
      twitter: "sendouc",
    },
  });
}

async function users(ids: string[]) {
  const usersFromSendouInk = await readFile(
    path.resolve("prisma", "seed", "users.json"),
    "utf8"
  );

  return prisma.user.createMany({
    data: JSON.parse(usersFromSendouInk)
      .slice(0, 200)
      .map((user: any, i: number) => ({
        id: ids[i],
        discordId: user.discordId,
        discordDiscriminator: user.discriminator,
        discordName: user.username,
        discordRefreshToken: "none",
        twitter: user.profile?.twitterName,
      })),
  });
}

const mockTeams = [
  "Team Olive",
  "Chimera",
  "Team Paradise",
  "Team Blue",
  "🛏️",
  "Name Subject to Change",
  "FTWin!",
  "Starbust",
  "Jackpot",
  "Crème Fresh",
  "Squids Next Door",
  "Get Kraken",
  "Kougeki",
  "Last Minute",
  "Squidding Good",
  "Alliance Rogue",
  "Second Wind",
  "Kelp Domers",
  "Arctic Moon",
  "sink gang",
  "Good Morning",
  "Kings",
  "NIS",
  "Woomy Zoomy Boomy",
];

async function tournamentTeams(tournamentId: string, userIds: string[]) {
  const userIdsCopy = [...userIds];
  for (const [mockTeamI, mockTeam] of mockTeams.entries()) {
    const team = await prisma.tournamentTeam.create({
      data: {
        name: mockTeam,
        tournamentId,
      },
    });

    for (let memberI = 0; memberI < (mockTeamI % 6) + 2; memberI++) {
      const memberId = userIdsCopy.shift()!;
      await prisma.tournamentTeamMember.create({
        data: {
          memberId,
          teamId: team.id,
          captain: memberI === 0,
          tournamentId,
        },
      });
    }
  }
}

async function organizations(userId: string) {
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

const modesList = ["TW", "SZ", "TC", "RM", "CB"] as const;

async function tournaments(organizationId: string) {
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

const mapIds = [
  6, 13, 16, 17, 20, 23, 26, 39, 41, 43, 49, 51, 61, 63, 75, 78, 79, 83, 84, 94,
  95, 98, 99, 101,
];

// TODO: why this can't be done while creating?
async function tournamentAddMaps(id: string, stageIds: number[]) {
  const mapIdObjects = mapIds.map((id) => ({ id: stageIds[id] }));

  return prisma.tournament.update({
    where: { id },
    data: {
      mapPool: {
        connect: mapIdObjects,
      },
    },
  });
}

async function stages() {
  const result = [];
  for (const mapName of stagesList) {
    for (const modeName of modesList) {
      const created = await prisma.stage.create({
        data: {
          name: mapName,
          mode: modeName,
        },
      });

      result.push(created.id);
    }
  }

  return result;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
