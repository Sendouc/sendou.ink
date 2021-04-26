import fs from "fs";
import path from "path";
import prisma from "./client";
import calendarEventFactory from "./factories/calendarEvent";
import ladderRegisteredTeamFactory from "./factories/ladderRegisteredTeam";
import userFactory from "./factories/user";
import {
  getPlusStatusesData,
  getPlusSuggestionsData,
  getPlusVotingSummaryData,
} from "./mocks/plus";

async function main() {
  throwIfNotLocalhost();
  await dropAllData();
  await seedNewData();
}

function throwIfNotLocalhost() {
  fs.readFile(
    path.join(process.cwd(), "prisma", ".env"),
    function (err: any, data: any) {
      if (!err) {
        for (const line of data.toString().split("\n")) {
          if (!line.startsWith("DATABASE_URL=")) {
            continue;
          }

          if (!line.includes("localhost:")) {
            console.error("trying to seed a database not in localhost");
            process.exit(1);
          }
        }
      } else {
        console.error(err);
        process.exit(1);
      }
    }
  );
}

async function dropAllData() {
  // TODO: Programatically clear/truncate all tables, rather than listing each model individually
  // That way, we won't need to update this method each time we add a new model
  await prisma.profile.deleteMany({});
  await prisma.build.deleteMany({});
  await prisma.salmonRunRecord.deleteMany({});
  await prisma.freeAgentPost.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.ladderPlayerTrueSkill.deleteMany({});
  await prisma.ladderMatchPlayer.deleteMany({});
  await prisma.plusVotingSummary.deleteMany({});
  await prisma.plusSuggestion.deleteMany({});
  await prisma.plusStatus.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.plusBallot.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seedNewData() {
  await seedUsers();
  await seedEvents();
  await seedLadderData();
  await prisma.plusStatus.createMany({ data: getPlusStatusesData() });
  await prisma.plusSuggestion.createMany({ data: getPlusSuggestionsData() });
  await prisma.plusVotingSummary.createMany({
    data: getPlusVotingSummaryData(),
  });
}

async function seedUsers() {
  const randomUsers = [...Array(10)].map((_, _i) => {
    return userFactory.build();
  });

  await prisma.user.createMany({
    data: [
      ...randomUsers,
      userFactory.build({ username: "NZAP", id: 333 }),
      userFactory.build({
        username: "Sendou",
        patreonTier: 1,
        id: 999,
        discordId: "79237403620945920",
      }),
    ],
  });
}

async function seedEvents() {
  const randomEvents = [...Array(10)].map((_, _i) => {
    return calendarEventFactory.build();
  });

  await prisma.calendarEvent.createMany({
    data: [
      ...randomEvents,
      calendarEventFactory.build({
        name: "Should Not Show",
        posterId: 999,
        date: new Date(new Date().getTime() - 143200000),
      }),
      calendarEventFactory.build({
        name: "In The Zone Ultimate",
        posterId: 999,
        format: "DE",
        tags: ["SZ"],
        description: "Ultimate zoning",
      }),
      calendarEventFactory.build({
        name: "Low Ink All Year",
        posterId: 333,
        format: "SWISS2SE",
        tags: ["LOW", "MULTIPLE", "ART"],
      }),
    ],
  });
}

async function seedLadderData() {
  const twentyFourHoursFromNow = new Date(
    new Date().getTime() + 24 * 60 * 60 * 1000
  );
  twentyFourHoursFromNow.setHours(12, 0, 0);
  await prisma.ladderDay.createMany({
    data: [
      {
        id: 1,
        date: new Date(twentyFourHoursFromNow.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        date: twentyFourHoursFromNow,
      },
    ],
  });

  await prisma.ladderRegisteredTeam.createMany({
    data: [...Array(2)].map((_, _i) => {
      return ladderRegisteredTeamFactory.build();
    }),
  });

  await Promise.all([
    prisma.user.updateMany({
      where: { id: { in: [1, 2, 3, 4] } },
      data: { ladderTeamId: 1 },
    }),
    prisma.user.updateMany({
      where: { id: { in: [5, 6, 7] } },
      data: { ladderTeamId: 2 },
    }),
  ]);

  await prisma.ladderMatch.create({
    data: {
      id: 1,
      dayId: 1,
      maplist: [
        {
          stage: "The Reef",
          mode: "SZ",
        },
        {
          stage: "Musselforge Fitness",
          mode: "CB",
        },
        {
          stage: "Starfish Mainstage",
          mode: "SZ",
        },
        {
          stage: "Humpback Pump Track",
          mode: "TC",
        },
        {
          stage: "Inkblot Art Academy",
          mode: "SZ",
        },
        {
          stage: "Sturgeon Shipyard",
          mode: "RM",
        },
        {
          stage: "Manta Maria",
          mode: "SZ",
        },
        {
          stage: "Snapper Canal",
          mode: "CB",
        },
        {
          stage: "Blackbelly Skatepark",
          mode: "SZ",
        },
      ],
      order: 1,
      teamAScore: 5,
      teamBScore: 0,
    },
  });

  // await prisma.ladderMatch.createMany({
  //   data: [
  //     {
  //       id: 1,
  //       dayId: 1,
  //       maplist: [
  //         {
  //           stage: "The Reef",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Musselforge Fitness",
  //           mode: "CB",
  //         },
  //         {
  //           stage: "Starfish Mainstage",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Humpback Pump Track",
  //           mode: "TC",
  //         },
  //         {
  //           stage: "Inkblot Art Academy",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Sturgeon Shipyard",
  //           mode: "RM",
  //         },
  //         {
  //           stage: "Manta Maria",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Snapper Canal",
  //           mode: "CB",
  //         },
  //         {
  //           stage: "Blackbelly Skatepark",
  //           mode: "SZ",
  //         },
  //       ],
  //       order: 1,
  //       teamAScore: 5,
  //       teamBScore: 0,
  //     },
  //     {
  //       id: 2,
  //       dayId: 1,
  //       maplist: [
  //         {
  //           stage: "MakoMart",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Shellendorf Institute",
  //           mode: "TC",
  //         },
  //         {
  //           stage: "Goby Arena",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Piranha Pit",
  //           mode: "CB",
  //         },
  //         {
  //           stage: "Camp Triggerfish",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Wahoo World",
  //           mode: "RM",
  //         },
  //         {
  //           stage: "New Albacore Hotel",
  //           mode: "SZ",
  //         },
  //         {
  //           stage: "Ancho-V Games",
  //           mode: "TC",
  //         },
  //         {
  //           stage: "Skipper Pavilion",
  //           mode: "SZ",
  //         },
  //       ],
  //       order: 2,
  //     },
  //   ],
  // });

  await prisma.ladderMatchPlayer.createMany({
    data: [
      {
        matchId: 1,
        team: "ALPHA",
        userId: 1,
      },
      {
        matchId: 1,
        team: "ALPHA",
        userId: 2,
      },
      {
        matchId: 1,
        team: "ALPHA",
        userId: 3,
      },
      {
        matchId: 1,
        team: "ALPHA",
        userId: 4,
      },
      {
        matchId: 1,
        team: "BRAVO",
        userId: 5,
      },
      {
        matchId: 1,
        team: "BRAVO",
        userId: 6,
      },
      {
        matchId: 1,
        team: "BRAVO",
        userId: 7,
      },
      {
        matchId: 1,
        team: "BRAVO",
        userId: 8,
      },
    ],
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
