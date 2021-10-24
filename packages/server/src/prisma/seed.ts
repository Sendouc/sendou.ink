import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const user = await users();
  const organization = await organizations(user.id);
  await tournaments(organization.id);
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

async function tournaments(organizationId: number) {
  return prisma.tournament.create({
    data: {
      bannerBackground: "linear-gradient(to bottom, #9796f0, #fbc7d4)",
      bannerTextColor: "hsla(231, 9%, 16%, 0.2)",
      checkInTime: new Date(2025, 11, 17, 11),
      startTime: new Date(2025, 11, 17, 12),
      name: "In The Zone X",
      nameForUrl: "in-the-zone-x",
      organizerId: organizationId,
      desription: "In The Zone eXtreme",
    },
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
