/* eslint-disable */

import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import clone from "just-clone";
import shuffle from "just-shuffle";
import path from "path";
import invariant from "tiny-invariant";
import { v4 as uuidv4 } from "uuid";
import { stagesWithIds } from "~/core/stages/stages";
import { SeedVariations } from "~/utils/schemas";
import {
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  ADMIN_TEST_UUID,
  NZAP_TEST_AVATAR,
  NZAP_TEST_DISCORD_ID,
  NZAP_TEST_UUID,
} from "../../app/constants";
import { createTournamentRounds } from "../../app/services/tournament";
const prisma = new PrismaClient();

const mapListDE = `{"losers":[[{"id":4647,"name":"Kelp Dome","mode":"SZ"},{"id":4658,"name":"Blackbelly Skatepark","mode":"TC"},{"id":4645,"name":"Manta Maria","mode":"CB"}],[{"id":4624,"name":"Inkblot Art Academy","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"},{"id":4618,"name":"Humpback Pump Track","mode":"TC"}],[{"id":4692,"name":"Camp Triggerfish","mode":"SZ"},{"id":4665,"name":"MakoMart","mode":"CB"},{"id":4634,"name":"Moray Towers","mode":"RM"}],[{"id":4609,"name":"Musselforge Fitness","mode":"RM"},{"id":4647,"name":"Kelp Dome","mode":"SZ"},{"id":4678,"name":"Arowana Mall","mode":"TC"}],[{"id":4705,"name":"New Albacore Hotel","mode":"CB"},{"id":4644,"name":"Manta Maria","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"}],[{"id":4657,"name":"Blackbelly Skatepark","mode":"SZ"},{"id":4690,"name":"Piranha Pit","mode":"CB"},{"id":4682,"name":"Goby Arena","mode":"SZ"},{"id":4678,"name":"Arowana Mall","mode":"TC"},{"id":4624,"name":"Inkblot Art Academy","mode":"RM"}]],"winners":[[{"id":4677,"name":"Arowana Mall","mode":"SZ"},{"id":4665,"name":"MakoMart","mode":"CB"},{"id":4618,"name":"Humpback Pump Track","mode":"TC"}],[{"id":4624,"name":"Inkblot Art Academy","mode":"RM"},{"id":4683,"name":"Goby Arena","mode":"TC"},{"id":4692,"name":"Camp Triggerfish","mode":"SZ"}],[{"id":4647,"name":"Kelp Dome","mode":"SZ"},{"id":4634,"name":"Moray Towers","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"},{"id":4610,"name":"Musselforge Fitness","mode":"CB"},{"id":4658,"name":"Blackbelly Skatepark","mode":"TC"}],[{"id":4644,"name":"Manta Maria","mode":"RM"},{"id":4677,"name":"Arowana Mall","mode":"SZ"},{"id":4690,"name":"Piranha Pit","mode":"CB"},{"id":4682,"name":"Goby Arena","mode":"SZ"},{"id":4618,"name":"Humpback Pump Track","mode":"TC"}],[{"id":4624,"name":"Inkblot Art Academy","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"},{"id":4610,"name":"Musselforge Fitness","mode":"CB"},{"id":4657,"name":"Blackbelly Skatepark","mode":"SZ"},{"id":4693,"name":"Camp Triggerfish","mode":"TC"},{"id":4664,"name":"MakoMart","mode":"RM"},{"id":4647,"name":"Kelp Dome","mode":"SZ"}],[{"id":4617,"name":"Humpback Pump Track","mode":"SZ"},{"id":4635,"name":"Moray Towers","mode":"CB"},{"id":4682,"name":"Goby Arena","mode":"SZ"},{"id":4644,"name":"Manta Maria","mode":"RM"},{"id":4678,"name":"Arowana Mall","mode":"TC"},{"id":4692,"name":"Camp Triggerfish","mode":"SZ"},{"id":4705,"name":"New Albacore Hotel","mode":"CB"}]]}`;

export async function seed(variation?: SeedVariations) {
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
    await prisma.lfgGroupLike.deleteMany();
    await prisma.lfgGroupMember.deleteMany();
    await prisma.lfgGroup.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.user.deleteMany();
    await prisma.lfgGroupMatchStage.deleteMany();
    await prisma.stage.deleteMany();

    //
    // create mock data
    //
    const adminUserCreated = await adminUser();
    const nzapUserCreated = await nzapUser();
    const userIds = new Array(500).fill(null).map(() => uuidv4());
    await users(userIds);
    const organization = await organizations(adminUserCreated.id);
    const tournament = await tournaments(organization.id);
    await tournamentTeams(tournament.id, userIds, adminUserCreated.id);
    await trustRelationship(nzapUserCreated.id, adminUserCreated.id);
    await stages();
    await tournamentAddMaps(tournament.id);
    await skills();

    const userIdsInTheSystem = (await prisma.user.findMany())
      .map((u) => u.id)
      .filter((id) => id !== ADMIN_TEST_UUID && id !== NZAP_TEST_UUID);
    const remainingUserIdsForGroups = await lfgGroups(userIdsInTheSystem);

    if (variation === "match" || variation === "tournament-start") {
      await tournamentRoundsCreate();
    }
    if (variation === "match") {
      await advanceRound();
    }
    if (variation === "looking" || variation === "looking-match") {
      await ownGroup(variation === "looking-match", remainingUserIdsForGroups);
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
            discordAvatar: user.discordAvatar,
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
        "Starburst",
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

      if (
        variation === "check-in" ||
        variation === "match" ||
        variation === "tournament-start"
      ) {
        const team = await prisma.tournamentTeam.create({
          data: {
            name: "Kraken Paradise",
            tournamentId,
            friendCode: "1234-1234-1234",
            inviteCode: "033e3695-0421-4aa1-a5ef-6ee82297a398",
            checkedInTime:
              variation === "match" || variation === "tournament-start"
                ? new Date()
                : undefined,
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
            friendCode: "0123-4567-8910",
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
            variation === "check-in"
              ? lastFullHour
              : new Date(2025, 11, 17, 11),
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
              id: "72867c9f-8515-4e44-ae8a-3766174e1ed4",
              type: "DE",
            },
          },
        },
        include: {
          brackets: true,
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

      for (const stage of stages.sort((a, b) => a.name.localeCompare(b.name))) {
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

    async function skills() {
      const users = (await prisma.user.findMany()).filter(
        () => Math.random() < 0.9
      );

      return prisma.skill.createMany({
        data: users.map((u) => ({
          mu: Math.random() * 40 + 10,
          sigma: Math.random() * 10 + 1,
          userId: u.id,
        })),
      });
    }

    async function stages() {
      return prisma.stage.createMany({
        data: stagesWithIds(),
      });
    }

    async function lfgGroups(userIds: string[]) {
      function randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      const userIdsStack = clone(userIds);
      for (let i = 0; i < 24; i++) {
        const amountOfUsers = randomIntFromInterval(1, 3);
        await prisma.lfgGroup.create({
          data: {
            looking: true,
            active: true,
            type: "VERSUS",
            ranked: i < 12,
            members: {
              createMany: {
                data: new Array(amountOfUsers).fill(null).map((_, i) => ({
                  memberId: userIdsStack.shift()!,
                  captain: i === 0,
                })),
              },
            },
          },
        });
      }

      for (let i = 0; i < 24; i++) {
        await prisma.lfgGroup.create({
          data: {
            looking: true,
            active: true,
            type: "VERSUS",
            ranked: i < 12,
            members: {
              createMany: {
                data: new Array(4).fill(null).map((_, i) => ({
                  memberId: userIdsStack.shift()!,
                  captain: i === 0,
                })),
              },
            },
          },
        });
      }

      return userIdsStack;
    }

    async function ownGroup(lookingMatch: boolean, userIds: string[]) {
      const groups = shuffle(await prisma.lfgGroup.findMany());

      const members = [
        {
          memberId: ADMIN_TEST_UUID,
          captain: true,
        },
        { memberId: NZAP_TEST_UUID },
      ];

      if (lookingMatch) {
        for (let i = 0; i < 2; i++) {
          members.push({ memberId: userIds.shift()! });
        }
      }

      return prisma.lfgGroup.create({
        data: {
          looking: true,
          type: "VERSUS",
          active: true,
          ranked: true,
          members: {
            createMany: {
              data: members,
            },
          },
          likesReceived: {
            createMany: {
              data: new Array(20).fill(null).map((_) => ({
                likerId: groups.shift()!.id,
              })),
            },
          },
        },
      });
    }

    async function tournamentRoundsCreate() {
      const stages = await prisma.stage.findMany({});
      await createTournamentRounds({
        userId: adminUserCreated.id,
        organizationNameForUrl: "sendou",
        tournamentNameForUrl: "in-the-zone-x",
        bracketId: tournament.brackets[0].id,
        mapList: {
          winners: JSON.parse(mapListDE).winners.map((round: any) =>
            round.map((stage: any) =>
              stages.find(
                (stageInDb) =>
                  stage.name === stageInDb.name && stage.mode === stageInDb.mode
              )
            )
          ),
          losers: JSON.parse(mapListDE).losers.map((round: any) =>
            round.map((stage: any) =>
              stages.find(
                (stageInDb) =>
                  stage.name === stageInDb.name && stage.mode === stageInDb.mode
              )
            )
          ),
        },
      });
    }

    async function advanceRound() {
      const matches = await prisma.tournamentMatch.findMany({
        include: { participants: true, round: { include: { stages: true } } },
      });
      const matchToAdvance = matches.find((match) => match.position === 1);
      invariant(matchToAdvance);

      await prisma.tournamentMatchGameResult.createMany({
        data: [
          {
            matchId: matchToAdvance.id,
            winner: "LOWER",
            roundStageId: matchToAdvance.round.stages.find(
              (stage) => stage.position === 1
            )!.id,
            reporterId: "",
          },
          {
            matchId: matchToAdvance.id,
            winner: "UPPER",
            roundStageId: matchToAdvance.round.stages.find(
              (stage) => stage.position === 2
            )!.id,
            reporterId: "",
          },
          {
            matchId: matchToAdvance.id,
            winner: "LOWER",
            roundStageId: matchToAdvance.round.stages.find(
              (stage) => stage.position === 3
            )!.id,
            reporterId: "",
          },
        ],
      });

      await prisma.tournamentMatchParticipant.createMany({
        data: [
          {
            matchId: matchToAdvance.winnerDestinationMatchId!,
            order: "LOWER",
            teamId: matchToAdvance.participants.find(
              (p) => p.order === "LOWER"
            )!.teamId,
          },
          {
            matchId: matchToAdvance.loserDestinationMatchId!,
            order: "LOWER",
            teamId: matchToAdvance.participants.find(
              (p) => p.order === "UPPER"
            )!.teamId,
          },
          {
            matchId: matches.find(
              (match) => match.id === matchToAdvance.loserDestinationMatchId!
            )!.winnerDestinationMatchId!,
            order: "LOWER",
            teamId: matchToAdvance.participants.find(
              (p) => p.order === "UPPER"
            )!.teamId,
          },
        ],
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}
