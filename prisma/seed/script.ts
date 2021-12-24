import { PrismaClient } from "@prisma/client";
import {
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  ADMIN_TEST_UUID,
  NZAP_TEST_AVATAR,
  NZAP_TEST_DISCORD_ID,
  NZAP_TEST_UUID,
  stages as stagesList,
} from "../../app/constants";
import { readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import shuffle from "just-shuffle";
const prisma = new PrismaClient();

export async function seed(variation?: "check-in") {
  try {
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
    await prisma.tournamentMatchParticipant.deleteMany();
    await prisma.tournamentMatchGameResult.deleteMany();
    await prisma.tournamentMatch.deleteMany();
    await prisma.tournamentRoundStage.deleteMany();
    await prisma.tournamentRound.deleteMany();
    await prisma.tournamentTeam.deleteMany();
    await prisma.tournamentBracket.deleteMany({});
    await prisma.tournament.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.trustRelationships.deleteMany();
    await prisma.user.deleteMany();
    await prisma.stage.deleteMany();

    //
    // create mock data
    //
    const adminUserCreated = await adminUser();
    const nzapUserCreated = await nzapUser();
    const userIds = new Array(500).fill(null).map(() => crypto.randomUUID());
    await users(userIds);
    const organization = await organizations(adminUserCreated.id);
    const tournament = await tournaments(organization.id);
    await tournamentTeams(tournament.id, userIds, adminUserCreated.id);
    await trustRelationship(nzapUserCreated.id, adminUserCreated.id);
    await stages();
    await tournamentAddMaps(tournament.id);
  } finally {
    await prisma.$disconnect();
  }

  async function adminUser() {
    return prisma.user.create({
      data: {
        id: ADMIN_TEST_UUID,
        discordDiscriminator: "4059",
        discordId: ADMIN_TEST_DISCORD_ID,
        discordName: "Sendou",
        discordRefreshToken: "none",
        twitch: "Sendou",
        youtubeId: "UCWbJLXByvsfQvTcR4HLPs5Q",
        youtubeName: "Sendou",
        discordAvatar: ADMIN_TEST_AVATAR,
        twitter: "sendouc",
      },
    });
  }

  async function nzapUser() {
    return prisma.user.create({
      data: {
        id: NZAP_TEST_UUID,
        discordDiscriminator: "6227",
        discordId: NZAP_TEST_DISCORD_ID,
        discordName: "N-ZAP",
        discordRefreshToken: "none",
        discordAvatar: NZAP_TEST_AVATAR,
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

  async function tournamentTeams(
    tournamentId: string,
    userIds: string[],
    loggedInUserId: string
  ) {
    const userIdsCopy = [...userIds];
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

    if (variation === "check-in") {
      const team = await prisma.tournamentTeam.create({
        data: {
          name: "Kraken Paradise",
          tournamentId,
        },
      });

      await prisma.tournamentTeamMember.create({
        data: {
          memberId: loggedInUserId,
          teamId: team.id,
          captain: true,
          tournamentId,
        },
      });

      for (let memberI = 0; memberI < 3; memberI++) {
        const memberId = userIdsCopy.shift()!;
        await prisma.tournamentTeamMember.create({
          data: {
            memberId,
            teamId: team.id,
            tournamentId,
          },
        });
      }
    }

    for (const [mockTeamI, mockTeam] of mockTeams.entries()) {
      const memberCount = (mockTeamI % 5) + 2;
      const team = await prisma.tournamentTeam.create({
        data: {
          name: mockTeam,
          tournamentId,
          checkedInTime: memberCount >= 4 ? new Date() : undefined,
        },
      });

      for (let memberI = 0; memberI < memberCount; memberI++) {
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

  async function trustRelationship(
    trustGiverId: string,
    trustReceiverId: string
  ) {
    return prisma.trustRelationships.create({
      data: {
        trustGiverId,
        trustReceiverId,
      },
    });
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

  async function tournaments(organizationId: string) {
    const lastFullHour = new Date();
    lastFullHour.setMinutes(0);
    lastFullHour.setSeconds(0);
    lastFullHour.setMilliseconds(0);

    const oneAfterNextFullHour = new Date(lastFullHour);
    oneAfterNextFullHour.setHours(lastFullHour.getHours() + 2);

    return prisma.tournament.create({
      data: {
        bannerBackground:
          "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
        bannerTextHSLArgs: "231, 9%, 16%",
        checkInStartTime:
          variation === "check-in" ? lastFullHour : new Date(2025, 11, 17, 11),
        startTime:
          variation === "check-in"
            ? oneAfterNextFullHour
            : new Date(2025, 11, 17, 12),
        name: "In The Zone X",
        nameForUrl: "in-the-zone-x",
        organizerId: organizationId,
        description:
          "In The Zone eXtreme\n\nCroissant cookie jelly macaroon caramels. Liquorice icing bonbon fruitcake wafer. Fruitcake pudding icing biscuit pie pie macaroon carrot cake shortbread. Soufflé dessert powder marshmallow biscuit.\n\nJelly-o wafer chocolate bar tootsie roll cheesecake chocolate bar. Icing candy canes cookie chocolate bar sesame snaps sugar plum cheesecake lollipop biscuit. Muffin marshmallow sweet soufflé bonbon pudding gummies sweet apple pie.\n\nSoufflé cookie sugar plum sesame snaps muffin cupcake wafer jelly-o carrot cake. Ice cream danish jelly-o dragée marzipan croissant. Shortbread cheesecake marshmallow biscuit gummi bears.",
        brackets: {
          create: {
            type: "DE",
          },
        },
      },
    });
  }

  async function tournamentAddMaps(id: string) {
    const stages = await prisma.stage.findMany({});

    const mapsIncluded: string[] = [];
    const modesIncluded = {
      SZ: 0,
      TC: 0,
      RM: 0,
      CB: 0,
    };
    const connect: { id: number }[] = [];

    for (const stage of shuffle(stages)) {
      if (
        modesIncluded.SZ === 8 &&
        modesIncluded.TC === 6 &&
        modesIncluded.RM === 6 &&
        modesIncluded.CB === 6
      ) {
        break;
      }
      if (stage.mode === "TW") continue;
      if (modesIncluded.SZ === 8 && stage.mode === "SZ") {
        continue;
      }
      if (modesIncluded.TC === 6 && stage.mode === "TC") {
        continue;
      }
      if (modesIncluded.RM === 6 && stage.mode === "RM") {
        continue;
      }
      if (modesIncluded.CB === 6 && stage.mode === "CB") {
        continue;
      }
      if (
        mapsIncluded.reduce(
          (acc, cur) => acc + (cur === stage.name ? 1 : 0),
          0
        ) >= 2
      ) {
        continue;
      }

      connect.push({ id: stage.id });
      modesIncluded[stage.mode]++;
      mapsIncluded.push(stage.name);
    }

    return prisma.tournament.update({
      where: { id },
      data: {
        mapPool: {
          connect,
        },
      },
    });
  }

  async function stages() {
    const modesList = ["TW", "SZ", "TC", "RM", "CB"] as const;
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
}
