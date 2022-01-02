import { Database } from "~/utils/db.server";
import {
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  ADMIN_TEST_UUID,
  NZAP_TEST_AVATAR,
  NZAP_TEST_DISCORD_ID,
  NZAP_TEST_UUID,
} from "../../../app/constants";
import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

//const mapListDE = `{"losers":[[{"id":4647,"name":"Kelp Dome","mode":"SZ"},{"id":4658,"name":"Blackbelly Skatepark","mode":"TC"},{"id":4645,"name":"Manta Maria","mode":"CB"}],[{"id":4624,"name":"Inkblot Art Academy","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"},{"id":4618,"name":"Humpback Pump Track","mode":"TC"}],[{"id":4692,"name":"Camp Triggerfish","mode":"SZ"},{"id":4665,"name":"MakoMart","mode":"CB"},{"id":4634,"name":"Moray Towers","mode":"RM"}],[{"id":4609,"name":"Musselforge Fitness","mode":"RM"},{"id":4647,"name":"Kelp Dome","mode":"SZ"},{"id":4678,"name":"Arowana Mall","mode":"TC"}],[{"id":4705,"name":"New Albacore Hotel","mode":"CB"},{"id":4644,"name":"Manta Maria","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"}],[{"id":4657,"name":"Blackbelly Skatepark","mode":"SZ"},{"id":4690,"name":"Piranha Pit","mode":"CB"},{"id":4682,"name":"Goby Arena","mode":"SZ"},{"id":4678,"name":"Arowana Mall","mode":"TC"},{"id":4624,"name":"Inkblot Art Academy","mode":"RM"}]],"winners":[[{"id":4677,"name":"Arowana Mall","mode":"SZ"},{"id":4665,"name":"MakoMart","mode":"CB"},{"id":4618,"name":"Humpback Pump Track","mode":"TC"}],[{"id":4624,"name":"Inkblot Art Academy","mode":"RM"},{"id":4683,"name":"Goby Arena","mode":"TC"},{"id":4692,"name":"Camp Triggerfish","mode":"SZ"}],[{"id":4647,"name":"Kelp Dome","mode":"SZ"},{"id":4634,"name":"Moray Towers","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"},{"id":4610,"name":"Musselforge Fitness","mode":"CB"},{"id":4658,"name":"Blackbelly Skatepark","mode":"TC"}],[{"id":4644,"name":"Manta Maria","mode":"RM"},{"id":4677,"name":"Arowana Mall","mode":"SZ"},{"id":4690,"name":"Piranha Pit","mode":"CB"},{"id":4682,"name":"Goby Arena","mode":"SZ"},{"id":4618,"name":"Humpback Pump Track","mode":"TC"}],[{"id":4624,"name":"Inkblot Art Academy","mode":"RM"},{"id":4707,"name":"Ancho-V Games","mode":"SZ"},{"id":4610,"name":"Musselforge Fitness","mode":"CB"},{"id":4657,"name":"Blackbelly Skatepark","mode":"SZ"},{"id":4693,"name":"Camp Triggerfish","mode":"TC"},{"id":4664,"name":"MakoMart","mode":"RM"},{"id":4647,"name":"Kelp Dome","mode":"SZ"}],[{"id":4617,"name":"Humpback Pump Track","mode":"SZ"},{"id":4635,"name":"Moray Towers","mode":"CB"},{"id":4682,"name":"Goby Arena","mode":"SZ"},{"id":4644,"name":"Manta Maria","mode":"RM"},{"id":4678,"name":"Arowana Mall","mode":"TC"},{"id":4692,"name":"Camp Triggerfish","mode":"SZ"},{"id":4705,"name":"New Albacore Hotel","mode":"CB"}]]}`;

const db = new Database();

const ORG_ID = uuidv4();

export async function seed(variation?: "check-in" | "match") {
  //
  // make sure we won't override production database
  //
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw Error(
      "Trying to seed a database not in localhost or DATABASE_URL env var is not set"
    );
  }

  //
  // create mock data
  //
  adminUser();
  nzapUser();
  const userIds = new Array(500).fill(null).map(() => uuidv4());
  users(userIds);
  organizations();
  tournaments();
  // await tournamentTeams(tournament.id, userIds, adminUserCreated.id);
  // await trustRelationship(nzapUserCreated.id, adminUserCreated.id);
  // await stages();
  // await tournamentAddMaps(tournament.id);
  // if (variation === "match") {
  //   await tournamentRoundsCreate();
  //   await advanceRound();
  // }

  function adminUser() {
    return db.user.create({
      id: ADMIN_TEST_UUID,
      discord_discriminator: "4059",
      discord_id: ADMIN_TEST_DISCORD_ID,
      discord_name: "Sendou",
      discord_refresh_token: "none",
      twitch: "Sendou",
      youtube_id: "UCWbJLXByvsfQvTcR4HLPs5Q",
      youtube_name: "Sendou",
      discord_avatar: ADMIN_TEST_AVATAR,
      twitter: "sendouc",
    });
  }

  function nzapUser() {
    return db.user.create({
      id: NZAP_TEST_UUID,
      discord_discriminator: "6227",
      discord_id: NZAP_TEST_DISCORD_ID,
      discord_name: "N-ZAP",
      discord_refresh_token: "none",
      discord_avatar: NZAP_TEST_AVATAR,
      twitch: null,
      twitter: null,
      youtube_id: null,
      youtube_name: null,
    });
  }

  function users(ids: string[]) {
    const users_from_sendou_ink = fs.readFileSync(
      path.resolve(__dirname, "users.json"),
      "utf8"
    );

    const usersToCreate = JSON.parse(users_from_sendou_ink).slice(0, 200);
    for (const [i, user] of usersToCreate.entries()) {
      db.user.create({
        id: ids[i],
        discord_id: user.discordId,
        discord_avatar: user.discordAvatar ?? null,
        discord_discriminator: user.discriminator,
        discord_refresh_token: "none",
        discord_name: user.username,
        twitter: user.profile?.twitterName ?? null,
        twitch: null,
        youtube_id: null,
        youtube_name: null,
      });
    }
  }

  async function organizations() {
    return db.organization.create({
      id: ORG_ID,
      owner_id: ADMIN_TEST_UUID,
      discord_invite: "sendou",
      name_for_url: "sendou",
      twitter: "sendouc",
      name: "Sendou's Tournaments",
    });
  }

  async function tournaments() {
    const lastFullHour = new Date();
    lastFullHour.setMinutes(0);
    lastFullHour.setSeconds(0);
    lastFullHour.setMilliseconds(0);

    const oneAfterNextFullHour = new Date(lastFullHour);
    oneAfterNextFullHour.setHours(lastFullHour.getHours() + 2);

    return db.tournament.create({
      banner_background:
        "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
      banner_text_hsl_args: "231, 9%, 16%",
      check_in_start_timestamp:
        variation === "check-in"
          ? lastFullHour.toISOString()
          : new Date(2025, 11, 17, 11).toISOString(),
      start_time_timestamp:
        variation === "check-in"
          ? oneAfterNextFullHour.toISOString()
          : new Date(2025, 11, 17, 12).toISOString(),
      name: "In The Zone X",
      name_for_url: "in-the-zone-x",
      organizer_id: ORG_ID,
      seeds_json: null,
      description:
        "In The Zone eXtreme\n\nCroissant cookie jelly macaroon caramels. Liquorice icing bonbon fruitcake wafer. Fruitcake pudding icing biscuit pie pie macaroon carrot cake shortbread. Soufflé dessert powder marshmallow biscuit.\n\nJelly-o wafer chocolate bar tootsie roll cheesecake chocolate bar. Icing candy canes cookie chocolate bar sesame snaps sugar plum cheesecake lollipop biscuit. Muffin marshmallow sweet soufflé bonbon pudding gummies sweet apple pie.\n\nSoufflé cookie sugar plum sesame snaps muffin cupcake wafer jelly-o carrot cake. Ice cream danish jelly-o dragée marzipan croissant. Shortbread cheesecake marshmallow biscuit gummi bears.",
    });

    // TODO: brackets: {
    //   create: {
    //     id: "72867c9f-8515-4e44-ae8a-3766174e1ed4",
    //     type: "DE",
    //   },
    // },
  }

  // async function tournamentTeams(
  //   tournamentId: string,
  //   userIds: string[],
  //   loggedInUserId: string
  // ) {
  //   const userIdsCopy = [...userIds];
  //   const mockTeams = [
  //     "Team Olive",
  //     "Chimera",
  //     "Team Paradise",
  //     "Team Blue",
  //     "🛏️",
  //     "Name Subject to Change",
  //     "FTWin!",
  //     "Starbust",
  //     "Jackpot",
  //     "Crème Fresh",
  //     "Squids Next Door",
  //     "Get Kraken",
  //     "Kougeki",
  //     "Last Minute",
  //     "Squidding Good",
  //     "Alliance Rogue",
  //     "Second Wind",
  //     "Kelp Domers",
  //     "Arctic Moon",
  //     "sink gang",
  //     "Good Morning",
  //     "Kings",
  //     "NIS",
  //     "Woomy Zoomy Boomy",
  //   ];

  //   if (variation === "check-in" || variation === "match") {
  //     const team = await prisma.tournamentTeam.create({
  //       data: {
  //         name: "Kraken Paradise",
  //         tournamentId,
  //         friendCode: "1234-1234-1234",
  //         inviteCode: "033e3695-0421-4aa1-a5ef-6ee82297a398",
  //         checkedInTime: variation === "match" ? new Date() : undefined,
  //       },
  //     });

  //     await prisma.tournamentTeamMember.create({
  //       data: {
  //         memberId: loggedInUserId,
  //         teamId: team.id,
  //         captain: true,
  //         tournamentId,
  //       },
  //     });

  //     for (let memberI = 0; memberI < 3; memberI++) {
  //       const memberId = userIdsCopy.shift()!;
  //       await prisma.tournamentTeamMember.create({
  //         data: {
  //           memberId,
  //           teamId: team.id,
  //           tournamentId,
  //         },
  //       });
  //     }
  //   }

  //   for (const [mockTeamI, mockTeam] of mockTeams.entries()) {
  //     const memberCount = (mockTeamI % 5) + 2;
  //     const team = await prisma.tournamentTeam.create({
  //       data: {
  //         name: mockTeam,
  //         tournamentId,
  //         friendCode: "0123-4567-8910",
  //         checkedInTime: memberCount >= 4 ? new Date() : undefined,
  //       },
  //     });

  //     for (let memberI = 0; memberI < memberCount; memberI++) {
  //       const memberId = userIdsCopy.shift()!;
  //       await prisma.tournamentTeamMember.create({
  //         data: {
  //           memberId,
  //           teamId: team.id,
  //           captain: memberI === 0,
  //           tournamentId,
  //         },
  //       });
  //     }
  //   }
  // }

  // async function trustRelationship(
  //   trustGiverId: string,
  //   trustReceiverId: string
  // ) {
  //   return prisma.trustRelationships.create({
  //     data: {
  //       trustGiverId,
  //       trustReceiverId,
  //     },
  //   });
  // }

  // async function tournamentAddMaps(id: string) {
  //   const stages = await prisma.stage.findMany({});

  //   const mapsIncluded: string[] = [];
  //   const modesIncluded = {
  //     SZ: 0,
  //     TC: 0,
  //     RM: 0,
  //     CB: 0,
  //   };
  //   const connect: { id: number }[] = [];

  //   for (const stage of stages.sort((a, b) => a.name.localeCompare(b.name))) {
  //     if (
  //       modesIncluded.SZ === 8 &&
  //       modesIncluded.TC === 6 &&
  //       modesIncluded.RM === 6 &&
  //       modesIncluded.CB === 6
  //     ) {
  //       break;
  //     }
  //     if (stage.mode === "TW") continue;
  //     if (modesIncluded.SZ === 8 && stage.mode === "SZ") {
  //       continue;
  //     }
  //     if (modesIncluded.TC === 6 && stage.mode === "TC") {
  //       continue;
  //     }
  //     if (modesIncluded.RM === 6 && stage.mode === "RM") {
  //       continue;
  //     }
  //     if (modesIncluded.CB === 6 && stage.mode === "CB") {
  //       continue;
  //     }
  //     if (
  //       mapsIncluded.reduce(
  //         (acc, cur) => acc + (cur === stage.name ? 1 : 0),
  //         0
  //       ) >= 2
  //     ) {
  //       continue;
  //     }

  //     connect.push({ id: stage.id });
  //     modesIncluded[stage.mode]++;
  //     mapsIncluded.push(stage.name);
  //   }

  //   return prisma.tournament.update({
  //     where: { id },
  //     data: {
  //       mapPool: {
  //         connect,
  //       },
  //     },
  //   });
  // }

  // async function stages() {
  //   const modesList = ["TW", "SZ", "TC", "RM", "CB"] as const;
  //   const result = [];

  //   for (const mapName of stagesList) {
  //     for (const modeName of modesList) {
  //       const created = await prisma.stage.create({
  //         data: {
  //           name: mapName,
  //           mode: modeName,
  //         },
  //       });

  //       result.push(created.id);
  //     }
  //   }

  //   return result;
  // }

  // async function tournamentRoundsCreate() {
  //   const stages = await prisma.stage.findMany({});
  //   await createTournamentRounds({
  //     userId: adminUserCreated.id,
  //     organizationNameForUrl: "sendou",
  //     tournamentNameForUrl: "in-the-zone-x",
  //     bracketId: tournament.brackets[0].id,
  //     mapList: {
  //       winners: JSON.parse(mapListDE).winners.map((round: any) =>
  //         round.map((stage: any) =>
  //           stages.find(
  //             (stageInDb) =>
  //               stage.name === stageInDb.name && stage.mode === stageInDb.mode
  //           )
  //         )
  //       ),
  //       losers: JSON.parse(mapListDE).losers.map((round: any) =>
  //         round.map((stage: any) =>
  //           stages.find(
  //             (stageInDb) =>
  //               stage.name === stageInDb.name && stage.mode === stageInDb.mode
  //           )
  //         )
  //       ),
  //     },
  //   });
  // }

  // async function advanceRound() {
  //   const matches = await prisma.tournamentMatch.findMany({
  //     include: { participants: true },
  //   });
  //   const matchToAdvance = matches.find((match) => match.position === 1);
  //   invariant(matchToAdvance);

  //   await prisma.tournamentMatchGameResult.createMany({
  //     data: [
  //       {
  //         matchId: matchToAdvance.id,
  //         winner: "LOWER",
  //         position: 1,
  //         reporterId: "",
  //       },
  //       {
  //         matchId: matchToAdvance.id,
  //         winner: "UPPER",
  //         position: 2,
  //         reporterId: "",
  //       },
  //       {
  //         matchId: matchToAdvance.id,
  //         winner: "LOWER",
  //         position: 3,
  //         reporterId: "",
  //       },
  //     ],
  //   });

  //   await prisma.tournamentMatchParticipant.createMany({
  //     data: [
  //       {
  //         matchId: matchToAdvance.winnerDestinationMatchId!,
  //         order: "LOWER",
  //         teamId: matchToAdvance.participants.find(
  //           (p) => p.order === "LOWER"
  //         )!.teamId,
  //       },
  //       {
  //         matchId: matchToAdvance.loserDestinationMatchId!,
  //         order: "LOWER", // TODO: figure out this
  //         teamId: matchToAdvance.participants.find(
  //           (p) => p.order === "UPPER"
  //         )!.teamId,
  //       },
  //     ],
  //   });
  // }
}
