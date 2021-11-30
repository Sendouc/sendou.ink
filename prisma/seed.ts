import { PrismaClient } from "@prisma/client";
import { stages as stagesList } from "../app/constants";
const prisma = new PrismaClient();
import faker from "faker";

const FAKER_SEED = 5800;

const randomOneDigitNumber = (includeZero?: boolean) =>
  faker.datatype.number(10) + (includeZero ? 0 : 1);

async function main() {
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw Error(
      "Trying to seed a database not in localhost or DATABASE_URL env var is not set"
    );
  }

  faker.seed(FAKER_SEED);
  const userCreated = await user();

  faker.seed(FAKER_SEED);
  await users();

  faker.seed(FAKER_SEED);
  const organization = await organizations(userCreated.id);

  faker.seed(FAKER_SEED);
  const tournament = await tournaments(organization.id);

  faker.seed(FAKER_SEED);
  const usersCreated = await prisma.user.findMany({});

  faker.seed(FAKER_SEED);
  await tournamentTeams(
    tournament.id,
    usersCreated.map((u) => u.id)
  );

  faker.seed(FAKER_SEED);
  await stages();

  faker.seed(FAKER_SEED);
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

// async function usersFromSendouInk() {
//   const fetched = (await (
//     await fetch("https://sendou.ink/api/users")
//   ).json()) as {
//     id: number;
//     username: string;
//     discriminator: string;
//     discordAvatar?: string;
//     discordId: string;
//     profile?: { twitterName?: string };
//   }[];

//   return prisma.user.createMany({
//     data: fetched
//       .filter((u) => u.discordId !== "79237403620945920")
//       .map((u) => ({
//         discordDiscriminator: u.discriminator,
//         discordId: u.discordId,
//         discordAvatar: u.discordAvatar,
//         discordRefreshToken: "none",
//         discordName: u.username,
//         twitter: u.profile?.twitterName,
//       })),
//     skipDuplicates: true,
//   });
// }

async function users() {
  return prisma.user.createMany({
    data: new Array(100).fill(null).map(() => ({
      discordId: new Array(17)
        .fill(null)
        .map((_, i) => String(randomOneDigitNumber(i !== 0)))
        .join(""),
      discordDiscriminator: new Array(4)
        .fill(null)
        .map(() => String(randomOneDigitNumber(true)))
        .join(""),
      discordName: faker.internet.userName(),
      discordRefreshToken: "none",
    })),
  });
}

async function tournamentTeams(tournamentId: number, users: number[]) {
  const randomIds = faker.helpers.shuffle(users);
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
          tournamentId,
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

// TODO: why this can't be done while creating?
async function tournamentAddMaps(id: number) {
  const ids = Array.from(
    new Set(
      new Array(24)
        .fill(null)
        .map(() => ({ id: faker.datatype.number({ min: 1, max: 115 }) }))
    )
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
