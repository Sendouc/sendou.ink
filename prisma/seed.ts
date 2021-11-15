import pkg from "@prisma/client";
import { stages as stagesList } from "../utils/constants";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import fetch from "node-fetch";
import shuffle from "just-shuffle";
import faker from "faker";

async function main() {
  const userCreated = await user();
  await users();
  const organization = await organizations(userCreated.id);
  const tournament = await tournaments(organization.id);
  const usersCreated = await prisma.user.findMany({});
  await tournamentTeams(
    tournament.id,
    usersCreated.map((u) => u.id)
  );
  await stages();
  await tournamentAddMaps(tournament.id);
}

async function user() {
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

async function users() {
  const fetched = (await (
    await fetch("https://sendou.ink/api/users")
  ).json()) as {
    id: number;
    username: string;
    discriminator: string;
    discordAvatar?: string;
    discordId: string;
    profile?: { twitterName?: string };
  }[];

  return prisma.user.createMany({
    data: fetched
      .filter((u) => u.discordId !== "79237403620945920")
      .map((u) => ({
        discordDiscriminator: u.discriminator,
        discordId: u.discordId,
        discordAvatar: u.discordAvatar,
        discordRefreshToken: "none",
        discordName: u.username,
        twitter: u.profile?.twitterName,
      })),
    skipDuplicates: true,
  });
}

async function tournamentTeams(tournamentId: number, users: number[]) {
  const randomIds = shuffle(users);
  for (let index = 0; index < 24; index++) {
    const team = await prisma.tournamentTeam.create({
      data: {
        name: faker.address.cityName(),
        tournamentId,
      },
    });

    for (let index = 0; index < faker.datatype.number(6) + 1; index++) {
      const memberId = randomIds.pop()!;
      await prisma.tournamentTeamMember.create({
        data: {
          memberId,
          teamId: team.id,
          captain: index === 0,
        },
      });
    }
  }
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
      return stagesList.map((name) => {
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
