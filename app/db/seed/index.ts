import { faker } from "@faker-js/faker";
import capitalize from "just-capitalize";
import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import { ADMIN_DISCORD_ID, ADMIN_ID, INVITE_CODE_LENGTH } from "~/constants";
import { db } from "~/db";
import { sql } from "~/db/sql";
import type { MainWeaponId } from "~/modules/in-game-lists";
import {
  abilities,
  clothesGearIds,
  headGearIds,
  mainWeaponIds,
  modesShort,
  shoesGearIds,
  type StageId,
  type AbilityType,
} from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import {
  lastCompletedVoting,
  nextNonCompletedVoting,
} from "~/modules/plus-server";
import allTags from "~/routes/calendar/tags.json";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import type { UpsertManyPlusVotesArgs } from "../models/plusVotes/queries.server";
import { nanoid } from "nanoid";
import { mySlugify } from "~/utils/urls";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { createVod } from "~/features/vods/queries/createVod.server";

import placements from "./placements.json";
import {
  NZAP_TEST_DISCORD_ID,
  ADMIN_TEST_AVATAR,
  NZAP_TEST_AVATAR,
  NZAP_TEST_ID,
  AMOUNT_OF_CALENDAR_EVENTS,
} from "./constants";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { TOURNAMENT } from "~/features/tournament/tournament-constants";
import type { SeedVariation } from "~/routes/seed";
import { nullFilledArray, pickRandomItem } from "~/utils/arrays";

const calendarEventWithToToolsSz = () => calendarEventWithToTools(true);
const calendarEventWithToToolsTeamsSz = () =>
  calendarEventWithToToolsTeams(true);

const basicSeeds = (variation?: SeedVariation | null) => [
  adminUser,
  makeAdminPatron,
  makeAdminVideoAdder,
  adminUserWeaponPool,
  nzapUser,
  users,
  userProfiles,
  lastMonthsVoting,
  syncPlusTiers,
  lastMonthSuggestions,
  thisMonthsSuggestions,
  badgesToAdmin,
  badgesToUsers,
  badgeManagers,
  patrons,
  calendarEvents,
  calendarEventBadges,
  calendarEventResults,
  calendarEventWithToTools,
  calendarEventWithToToolsTieBreakerMapPool,
  variation === "NO_TOURNAMENT_TEAMS"
    ? undefined
    : calendarEventWithToToolsTeams,
  variation === "NO_TOURNAMENT_TEAMS" ? undefined : calendarEventWithToToolsSz,
  variation === "NO_TOURNAMENT_TEAMS"
    ? undefined
    : calendarEventWithToToolsTeamsSz,
  tournamentSubs,
  adminBuilds,
  manySplattershotBuilds,
  detailedTeam,
  otherTeams,
  realVideo,
  realVideoCast,
  xRankPlacements,
  userFavBadges,
];

export function seed(variation?: SeedVariation | null) {
  wipeDB();

  for (const seedFunc of basicSeeds(variation)) {
    if (!seedFunc) continue;
    seedFunc();
  }
}

function wipeDB() {
  const tablesToDelete = [
    "UnvalidatedUserSubmittedImage",
    "AllTeamMember",
    "AllTeam",
    "Build",
    "TournamentTeamMember",
    "MapPoolMap",
    "TournamentMatchGameResult",
    "TournamentTeam",
    "Tournament",
    "CalendarEventDate",
    "CalendarEventResultPlayer",
    "CalendarEventResultTeam",
    "CalendarEventBadge",
    "CalendarEvent",
    "UserWeapon",
    "PlusTier",
    "UnvalidatedVideo",
    "XRankPlacement",
    "SplatoonPlayer",
    "User",
    "PlusSuggestion",
    "PlusVote",
    "TournamentBadgeOwner",
    "BadgeManager",
  ];

  for (const table of tablesToDelete) {
    sql.prepare(`delete from "${table}"`).run();
  }
}

function adminUser() {
  db.users.upsert({
    discordDiscriminator: "0",
    discordId: ADMIN_DISCORD_ID,
    discordName: "Sendou",
    twitch: "Sendou",
    youtubeId: "UCWbJLXByvsfQvTcR4HLPs5Q",
    discordAvatar: ADMIN_TEST_AVATAR,
    twitter: "sendouc",
    discordUniqueName: "sendou",
  });
}

function makeAdminPatron() {
  sql
    .prepare(
      `update "User" set "patronTier" = 2, "patronSince" = 1674663454 where id = 1`
    )
    .run();
}

function makeAdminVideoAdder() {
  sql.prepare(`update "User" set "isVideoAdder" = 1 where id = 1`).run();
}

function adminUserWeaponPool() {
  for (const [i, weaponSplId] of [200, 1100, 2000, 4000].entries()) {
    sql
      .prepare(
        `
      insert into "UserWeapon" ("userId", "weaponSplId", "order")
        values ($userId, $weaponSplId, $order)
    `
      )
      .run({ userId: 1, weaponSplId, order: i + 1 });
  }
}

function nzapUser() {
  db.users.upsert({
    discordDiscriminator: "6227",
    discordId: NZAP_TEST_DISCORD_ID,
    discordName: "N-ZAP",
    twitch: null,
    youtubeId: null,
    discordAvatar: NZAP_TEST_AVATAR,
    twitter: null,
    discordUniqueName: null,
  });
}

function users() {
  const usedNames = new Set<string>();
  new Array(500).fill(null).map(fakeUser(usedNames)).forEach(db.users.upsert);
}

function userProfiles() {
  for (const args of [
    {
      userId: 1,
      country: "FI",
      customUrl: "sendou",
      motionSens: 50,
      stickSens: 5,
      inGameName: "Sendou#1234",
    },
    {
      userId: 2,
      country: "SE",
      customUrl: "nzap",
      motionSens: -40,
      stickSens: 0,
      inGameName: "N-ZAP#5678",
    },
  ]) {
    sql
      .prepare(
        `
        UPDATE "User" SET 
          country = $country,
          customUrl = $customUrl,
          motionSens = $motionSens,
          stickSens = $stickSens,
          inGameName = $inGameName
        WHERE id = $userId`
      )
      .run(args);
  }

  for (let id = 3; id < 500; id++) {
    if (Math.random() < 0.25) continue; // 75% have bio

    sql
      .prepare(
        `UPDATE "User" SET bio = $bio, country = $country WHERE id = $id`
      )
      .run({
        id,
        bio: faker.lorem.paragraphs(
          faker.helpers.arrayElement([1, 1, 1, 2, 3, 4]),
          "\n\n"
        ),
        country: Math.random() > 0.5 ? faker.location.countryCode() : null,
      });
  }
}

function fakeUser(usedNames: Set<string>) {
  return () => ({
    discordAvatar: null,
    discordDiscriminator: String(faker.string.numeric(4)),
    discordId: String(faker.string.numeric(17)),
    discordName: uniqueDiscordName(usedNames),
    twitch: null,
    twitter: null,
    youtubeId: null,
    discordUniqueName: null,
  });
}

function uniqueDiscordName(usedNames: Set<string>) {
  let result = faker.internet.userName();
  while (usedNames.has(result)) {
    result = faker.internet.userName();
  }
  usedNames.add(result);

  return result;
}

const idToPlusTier = (id: number) => {
  if (id < 30) return 1;
  if (id < 80) return 2;
  if (id <= 150) return 3;

  // these ids failed the voting
  if (id >= 200 && id <= 209) return 1;
  if (id >= 210 && id <= 219) return 2;
  if (id >= 220 && id <= 229) return 3;

  throw new Error("Invalid id - no plus tier");
};

function lastMonthsVoting() {
  const votes: UpsertManyPlusVotesArgs = [];

  const { month, year } = lastCompletedVoting(new Date());

  const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);

  for (let id = 1; id < 151; id++) {
    if (id === 2) continue; // omit N-ZAP user for testing;

    votes.push({
      authorId: 1,
      month,
      year,
      score: 1,
      tier: idToPlusTier(id),
      validAfter: fiveMinutesAgo,
      votedId: id,
    });
  }

  for (let id = 200; id < 225; id++) {
    votes.push({
      authorId: 1,
      month,
      year,
      score: -1,
      tier: idToPlusTier(id),
      validAfter: fiveMinutesAgo,
      votedId: id,
    });
  }

  db.plusVotes.upsertMany(votes);
}

function lastMonthSuggestions() {
  const usersSuggested = [
    3, 10, 14, 90, 120, 140, 200, 201, 203, 204, 205, 216, 217, 218, 219, 220,
  ];
  const { month, year } = lastCompletedVoting(new Date());

  for (const id of usersSuggested) {
    db.plusSuggestions.create({
      authorId: 1,
      month,
      year,
      suggestedId: id,
      text: faker.lorem.lines(),
      tier: idToPlusTier(id),
    });
  }
}

function thisMonthsSuggestions() {
  const usersInPlus = db.users
    .findAll()
    .filter((u) => u.plusTier && u.id !== 1); // exclude admin
  const { month, year } = nextNonCompletedVoting(new Date());

  for (let userId = 150; userId < 190; userId++) {
    const amountOfSuggestions = faker.helpers.arrayElement([1, 1, 2, 3, 4]);

    for (let i = 0; i < amountOfSuggestions; i++) {
      const suggester = usersInPlus.shift();
      invariant(suggester);
      invariant(suggester.plusTier);

      db.plusSuggestions.create({
        authorId: suggester.id,
        month,
        year,
        suggestedId: userId,
        text: faker.lorem.lines(),
        tier: suggester.plusTier,
      });
    }
  }
}

function syncPlusTiers() {
  sql
    .prepare(
      /* sql */ `
    insert into "PlusTier" ("userId", "tier") select "userId", "tier" from "FreshPlusTier" where "tier" is not null;
  `
    )
    .run();
}

function badgesToAdmin() {
  const availableBadgeIds = shuffle(
    (sql.prepare(`select "id" from "Badge"`).all() as any[]).map((b) => b.id)
  ).slice(0, 8) as number[];

  const badgesWithDuplicates = availableBadgeIds.flatMap((id) =>
    new Array(faker.helpers.arrayElement([1, 1, 1, 2, 3, 4]))
      .fill(null)
      .map(() => id)
  );

  for (const id of badgesWithDuplicates) {
    sql
      .prepare(
        `insert into "TournamentBadgeOwner" ("badgeId", "userId") values ($id, $userId)`
      )
      .run({ id, userId: 1 });
  }
}

function getAvailableBadgeIds() {
  return shuffle(
    (sql.prepare(`select "id" from "Badge"`).all() as any[]).map((b) => b.id)
  );
}

function badgesToUsers() {
  const availableBadgeIds = getAvailableBadgeIds();

  let userIds = (
    sql
      .prepare(`select "id" from "User" where id != 2`) // no badges for N-ZAP
      .all() as any[]
  ).map((u) => u.id) as number[];

  for (const id of availableBadgeIds) {
    userIds = shuffle(userIds);
    for (
      let i = 0;
      i <
      faker.number.int({
        min: 1,
        max: 24,
      });
      i++
    ) {
      const userToGetABadge = userIds.shift()!;
      sql
        .prepare(
          `insert into "TournamentBadgeOwner" ("badgeId", "userId") values ($id, $userId)`
        )
        .run({ id, userId: userToGetABadge });

      userIds.push(userToGetABadge);
    }
  }
}

function badgeManagers() {
  // make N-ZAP user manager of several badges
  for (let id = 1; id <= 10; id++) {
    sql
      .prepare(
        `insert into "BadgeManager" ("badgeId", "userId") values ($id, $userId)`
      )
      .run({ id, userId: 2 });
  }
}

function patrons() {
  const userIds = (
    sql
      .prepare(`select "id" from "User" order by random() limit 50`)
      .all() as any[]
  )
    .map((u) => u.id)
    .filter((id) => id !== NZAP_TEST_ID);

  for (const id of userIds) {
    sql
      .prepare(
        `update user set "patronTier" = $patronTier, "patronSince" = $patronSince where id = $id`
      )
      .run({
        id,
        patronSince: dateToDatabaseTimestamp(faker.date.past()),
        patronTier: faker.helpers.arrayElement([1, 1, 2, 2, 2, 3, 3, 4]),
      });
  }
}

function userIdsInRandomOrder(specialLast = false) {
  const rows = (
    sql.prepare(`select "id" from "User" order by random()`).all() as any[]
  ).map((u) => u.id) as number[];

  if (!specialLast) return rows;

  return [...rows.filter((id) => id !== 1 && id !== 2), 1, 2];
}

function userIdsInAscendingOrderById() {
  return (
    sql.prepare(`select "id" from "User" order by id asc`).all() as any[]
  ).map((u) => u.id) as number[];
}

function calendarEvents() {
  const userIds = userIdsInRandomOrder();

  for (let id = 1; id <= AMOUNT_OF_CALENDAR_EVENTS; id++) {
    const tags = shuffle(Object.keys(allTags)).filter((tag) => tag !== "BADGE");

    sql
      .prepare(
        `
      insert into "CalendarEvent" (
        "id",
        "name",
        "description",
        "discordInviteCode",
        "bracketUrl",
        "authorId",
        "tags"
      ) values (
        $id,
        $name,
        $description,
        $discordInviteCode,
        $bracketUrl,
        $authorId,
        $tags
      )
      `
      )
      .run({
        id,
        name: `${capitalize(faker.word.adjective())} ${capitalize(
          faker.word.noun()
        )}`,
        description: faker.lorem.paragraph(),
        discordInviteCode: faker.lorem.word(),
        bracketUrl: faker.internet.url(),
        authorId: id === 1 ? NZAP_TEST_ID : userIds.pop(),
        tags:
          Math.random() > 0.2
            ? tags
                .slice(
                  0,
                  faker.helpers.arrayElement([
                    1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 5, 6,
                  ])
                )
                .join(",")
            : null,
      });

    const twoDayEvent = Math.random() > 0.9;
    const startTime =
      id % 2 === 0
        ? faker.date.soon({ days: 42 })
        : faker.date.recent({ days: 42 });
    startTime.setMinutes(0, 0, 0);

    sql
      .prepare(
        `
        insert into "CalendarEventDate" (
          "eventId",
          "startTime"
        ) values (
          $eventId,
          $startTime
        )
      `
      )
      .run({
        eventId: id,
        startTime: dateToDatabaseTimestamp(startTime),
      });

    if (twoDayEvent) {
      startTime.setDate(startTime.getDate() + 1);

      sql
        .prepare(
          `
          insert into "CalendarEventDate" (
            "eventId",
            "startTime"
          ) values (
            $eventId,
            $startTime
          )
        `
        )
        .run({
          eventId: id,
          startTime: dateToDatabaseTimestamp(startTime),
        });
    }
  }
}

function calendarEventBadges() {
  for (let eventId = 1; eventId <= AMOUNT_OF_CALENDAR_EVENTS; eventId++) {
    if (Math.random() > 0.25) continue;

    const availableBadgeIds = getAvailableBadgeIds();

    for (
      let i = 0;
      i < faker.helpers.arrayElement([1, 1, 1, 1, 2, 2, 3]);
      i++
    ) {
      sql
        .prepare(
          `insert into "CalendarEventBadge" 
          ("eventId", "badgeId") 
          values ($eventId, $badgeId)`
        )
        .run({ eventId, badgeId: availableBadgeIds.pop() });
    }
  }
}

function calendarEventResults() {
  let userIds = userIdsInRandomOrder();
  const eventIdsOfPast = new Set<number>(
    (
      sql
        .prepare(
          `select "CalendarEvent"."id" 
          from "CalendarEvent" 
          join "CalendarEventDate" on "CalendarEventDate"."eventId" = "CalendarEvent"."id"
          where "CalendarEventDate"."startTime" < $startTime`
        )
        .all({ startTime: dateToDatabaseTimestamp(new Date()) }) as any[]
    ).map((r) => r.id)
  );

  for (const eventId of eventIdsOfPast) {
    // event id = 1 needs to be without results for e2e tests
    if (Math.random() < 0.3 || eventId === 1) continue;

    db.calendarEvents.upsertReportedScores({
      eventId,
      participantCount: faker.number.int({ min: 10, max: 250 }),
      results: new Array(faker.helpers.arrayElement([1, 1, 2, 3, 3, 3, 8, 8]))
        .fill(null)
        // eslint-disable-next-line no-loop-func
        .map((_, i) => ({
          placement: i + 1,
          teamName: capitalize(faker.word.noun()),
          players: new Array(
            faker.helpers.arrayElement([1, 2, 3, 4, 4, 4, 4, 4, 5, 6])
          )
            .fill(null)
            .map(() => {
              const withStringName = Math.random() < 0.2;

              return {
                name: withStringName ? faker.person.firstName() : null,
                userId: withStringName ? null : userIds.pop()!,
              };
            }),
        })),
    });

    userIds = userIdsInRandomOrder();
  }
}

const TO_TOOLS_CALENDAR_EVENT_ID = 201;
function calendarEventWithToTools(sz?: boolean) {
  const tournamentId = sz ? 2 : 1;
  const eventId = TO_TOOLS_CALENDAR_EVENT_ID + (sz ? 1 : 0);

  sql
    .prepare(
      `
      insert into "Tournament" (
        "id",
        "mapPickingStyle",
        "format"
      ) values (
        $id,
        $mapPickingStyle,
        $format
      ) returning *
      `
    )
    .run({
      id: tournamentId,
      format: "DE",
      mapPickingStyle: sz ? "AUTO_SZ" : "AUTO_ALL",
    });

  sql
    .prepare(
      `
      insert into "CalendarEvent" (
        "id",
        "name",
        "description",
        "discordInviteCode",
        "bracketUrl",
        "authorId",
        "tournamentId"
      ) values (
        $id,
        $name,
        $description,
        $discordInviteCode,
        $bracketUrl,
        $authorId,
        $tournamentId
      )
      `
    )
    .run({
      id: eventId,
      name: sz ? "In The Zone 22" : "PICNIC #2",
      description: faker.lorem.paragraph(),
      discordInviteCode: faker.lorem.word(),
      bracketUrl: faker.internet.url(),
      authorId: 1,
      tournamentId,
    });

  sql
    .prepare(
      `
        insert into "CalendarEventDate" (
          "eventId",
          "startTime"
        ) values (
          $eventId,
          $startTime
        )
      `
    )
    .run({
      eventId,
      startTime: dateToDatabaseTimestamp(new Date(Date.now() + 1000 * 60 * 60)),
    });
}

const tiebreakerPicks = new MapPool([
  { mode: "SZ", stageId: 1 },
  { mode: "TC", stageId: 2 },
  { mode: "RM", stageId: 3 },
  { mode: "CB", stageId: 4 },
]);
function calendarEventWithToToolsTieBreakerMapPool() {
  for (const { mode, stageId } of tiebreakerPicks.stageModePairs) {
    sql
      .prepare(
        `
        insert into "MapPoolMap" (
          "tieBreakerCalendarEventId",
          "stageId",
          "mode"
        ) values (
          $tieBreakerCalendarEventId,
          $stageId,
          $mode
        )
      `
      )
      .run({
        tieBreakerCalendarEventId: TO_TOOLS_CALENDAR_EVENT_ID,
        stageId,
        mode,
      });
  }
}

const validTournamentTeamName = () => {
  while (true) {
    const name = faker.music.songName();
    if (name.length <= TOURNAMENT.TEAM_NAME_MAX_LENGTH) return name;
  }
};

const names = Array.from(
  new Set(new Array(100).fill(null).map(() => validTournamentTeamName()))
).concat("Chimera");
const availableStages: StageId[] = [1, 2, 3, 4, 6, 7, 8, 10, 11];
const availablePairs = rankedModesShort
  .flatMap((mode) =>
    availableStages.map((stageId) => ({ mode, stageId: stageId }))
  )
  .filter((pair) => !tiebreakerPicks.has(pair));
function calendarEventWithToToolsTeams(sz?: boolean) {
  const userIds = userIdsInAscendingOrderById();
  for (let id = 1; id <= 16; id++) {
    const teamId = id + (sz ? 100 : 0);

    sql
      .prepare(
        `
      insert into "TournamentTeam" (
        "id",
        "name",
        "createdAt",
        "tournamentId",
        "inviteCode"
      ) values (
        $id,
        $name,
        $createdAt,
        $tournamentId,
        $inviteCode
      )
      `
      )
      .run({
        id: teamId,
        name: names.pop(),
        createdAt: dateToDatabaseTimestamp(new Date()),
        tournamentId: sz ? 2 : 1,
        inviteCode: nanoid(INVITE_CODE_LENGTH),
      });

    if (sz || id !== 1) {
      sql
        .prepare(
          `
      insert into "TournamentTeamCheckIn" (
        "tournamentTeamId",
        "checkedInAt"
      ) values (
        $tournamentTeamId,
        $checkedInAt
      )
      `
        )
        .run({
          tournamentTeamId: id + (sz ? 100 : 0),
          checkedInAt: dateToDatabaseTimestamp(new Date()),
        });
    }

    for (let i = 0; i < (id < 10 ? 4 : 5); i++) {
      let userId = userIds.shift()!;
      // ensure N-ZAP is in different team than Sendou for ITZ
      if (userId === NZAP_TEST_ID && teamId === 101) {
        userId = userIds.shift()!;
        userIds.unshift(NZAP_TEST_ID);
      }

      sql
        .prepare(
          `
      insert into "TournamentTeamMember" (
        "tournamentTeamId",
        "userId",
        "isOwner",
        "createdAt"
      ) values (
        $tournamentTeamId,
        $userId,
        $isOwner,
        $createdAt
      )
      `
        )
        .run({
          tournamentTeamId: id + (sz ? 100 : 0),
          userId,
          isOwner: i === 0 ? 1 : 0,
          createdAt: dateToDatabaseTimestamp(new Date()),
        });
    }

    if (Math.random() < 0.8 || id === 1) {
      const shuffledPairs = shuffle(availablePairs.slice());

      let SZ = 0;
      let TC = 0;
      let RM = 0;
      let CB = 0;
      const stageUsedCounts: Partial<Record<StageId, number>> = {};

      for (const pair of shuffledPairs) {
        if (sz && pair.mode !== "SZ") continue;

        if (pair.mode === "SZ" && SZ >= (sz ? 6 : 2)) continue;
        if (pair.mode === "TC" && TC >= 2) continue;
        if (pair.mode === "RM" && RM >= 2) continue;
        if (pair.mode === "CB" && CB >= 2) continue;

        if (stageUsedCounts[pair.stageId] === (sz ? 1 : 2)) continue;

        stageUsedCounts[pair.stageId] =
          (stageUsedCounts[pair.stageId] ?? 0) + 1;

        sql
          .prepare(
            `
        insert into "MapPoolMap" (
          "tournamentTeamId",
          "stageId",
          "mode"
        ) values (
          $tournamentTeamId,
          $stageId,
          $mode
        )
        `
          )
          .run({
            tournamentTeamId: id + (sz ? 100 : 0),
            stageId: pair.stageId,
            mode: pair.mode,
          });

        if (pair.mode === "SZ") SZ++;
        if (pair.mode === "TC") TC++;
        if (pair.mode === "RM") RM++;
        if (pair.mode === "CB") CB++;
      }
    }
  }
}

function tournamentSubs() {
  for (let id = 100; id < 120; id++) {
    const includedWeaponIds: MainWeaponId[] = [];

    sql
      .prepare(
        /* sql */ `
      insert into "TournamentSub" (
        "userId",
        "tournamentId",
        "canVc",
        "bestWeapons",
        "okWeapons",
        "message",
        "visibility"
      ) values (
        @userId,
        @tournamentId,
        @canVc,
        @bestWeapons,
        @okWeapons,
        @message,
        @visibility
      )
    `
      )
      .run({
        userId: id,
        tournamentId: 1,
        canVc: Number(Math.random() > 0.5),
        bestWeapons: nullFilledArray(
          faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5])
        )
          .map(() => {
            while (true) {
              const weaponId = pickRandomItem(mainWeaponIds);
              if (!includedWeaponIds.includes(weaponId)) {
                includedWeaponIds.push(weaponId);
                return weaponId;
              }
            }
          })
          .join(","),
        okWeapons:
          Math.random() > 0.5
            ? null
            : nullFilledArray(
                faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5])
              )
                .map(() => {
                  while (true) {
                    const weaponId = pickRandomItem(mainWeaponIds);
                    if (!includedWeaponIds.includes(weaponId)) {
                      includedWeaponIds.push(weaponId);
                      return weaponId;
                    }
                  }
                })
                .join(","),
        message: Math.random() > 0.5 ? null : faker.lorem.paragraph(),
        visibility: id < 105 ? "+1" : id < 110 ? "+2" : id < 115 ? "+2" : "ALL",
      });
  }

  return null;
}

const randomAbility = (legalTypes: AbilityType[]) => {
  const randomOrderAbilities = shuffle([...abilities]);

  return randomOrderAbilities.find((a) => legalTypes.includes(a.type))!.name;
};

const adminWeaponPool = mainWeaponIds.filter(() => Math.random() > 0.8);
function adminBuilds() {
  for (let i = 0; i < 50; i++) {
    const randomOrderHeadGear = shuffle(headGearIds.slice());
    const randomOrderClothesGear = shuffle(clothesGearIds.slice());
    const randomOrderShoesGear = shuffle(shoesGearIds.slice());
    // filter out sshot to prevent test flaking
    const randomOrderWeaponIds = shuffle(
      adminWeaponPool.filter((id) => id !== 40).slice()
    );

    db.builds.create({
      title: `${capitalize(faker.word.adjective())} ${capitalize(
        faker.word.noun()
      )}`,
      ownerId: 1,
      private: 0,
      description: Math.random() < 0.75 ? faker.lorem.paragraph() : null,
      headGearSplId: randomOrderHeadGear[0]!,
      clothesGearSplId: randomOrderClothesGear[0]!,
      shoesGearSplId: randomOrderShoesGear[0]!,
      weaponSplIds: new Array(
        faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5])
      )
        .fill(null)
        .map(() => randomOrderWeaponIds.pop()!),
      modes:
        Math.random() < 0.75
          ? modesShort.filter(() => Math.random() < 0.5)
          : null,
      abilities: [
        [
          randomAbility(["HEAD_MAIN_ONLY", "STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
        ],
        [
          randomAbility(["CLOTHES_MAIN_ONLY", "STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
        ],
        [
          randomAbility(["SHOES_MAIN_ONLY", "STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
        ],
      ],
    });
  }
}

function manySplattershotBuilds() {
  // ensure 500 has at least one splattershot build for x placement test
  const users = [
    ...userIdsInRandomOrder().filter(
      (id) => id !== 500 && id !== ADMIN_ID && id !== NZAP_TEST_ID
    ),
    500,
  ];

  for (let i = 0; i < 500; i++) {
    const SPLATTERSHOT_ID = 40;

    const randomOrderHeadGear = shuffle(headGearIds.slice());
    const randomOrderClothesGear = shuffle(clothesGearIds.slice());
    const randomOrderShoesGear = shuffle(shoesGearIds.slice());
    const randomOrderWeaponIds = shuffle(mainWeaponIds.slice()).filter(
      (id) => id !== SPLATTERSHOT_ID
    );

    db.builds.create({
      private: 0,
      title: `${capitalize(faker.word.adjective())} ${capitalize(
        faker.word.noun()
      )}`,
      ownerId: users.pop()!,
      description: Math.random() < 0.75 ? faker.lorem.paragraph() : null,
      headGearSplId: randomOrderHeadGear[0]!,
      clothesGearSplId: randomOrderClothesGear[0]!,
      shoesGearSplId: randomOrderShoesGear[0]!,
      weaponSplIds: new Array(
        faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5])
      )
        .fill(null)
        .map((_, i) =>
          i === 0 ? SPLATTERSHOT_ID : randomOrderWeaponIds.pop()!
        ),
      modes:
        Math.random() < 0.75
          ? modesShort.filter(() => Math.random() < 0.5)
          : null,
      abilities: [
        [
          randomAbility(["HEAD_MAIN_ONLY", "STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
        ],
        [
          randomAbility(["CLOTHES_MAIN_ONLY", "STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
        ],
        [
          randomAbility(["SHOES_MAIN_ONLY", "STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
          randomAbility(["STACKABLE"]),
        ],
      ],
    });
  }
}

function detailedTeam() {
  sql
    .prepare(
      /* sql */ `
    insert into "UnvalidatedUserSubmittedImage" ("validatedAt", "url", "submitterUserId")
      values 
        (1672587342, 'AiGSM5T-cxm6BFGT7N_lA-1673297699133.webp', 1), 
        (1672587342, 'jTbWd95klxU2MzGFIdi1c-1673297932788.webp', 1)
  `
    )
    .run();

  sql
    .prepare(
      /* sql */ `
      insert into "AllTeam" ("name", "customUrl", "inviteCode", "twitter", "bio", "avatarImgId", "bannerImgId")
       values (
          'Alliance Rogue',
          'alliance-rogue',
          '${nanoid(INVITE_CODE_LENGTH)}',
          'AllianceRogueFR',
          '${faker.lorem.paragraph()}',
          1,
          2
       )
  `
    )
    .run();

  const userIds = userIdsInRandomOrder(true).filter((id) => id !== 2);
  for (let i = 0; i < 5; i++) {
    const userId = i === 0 ? 1 : userIds.shift()!;

    sql
      .prepare(
        /*sql*/ `
      insert into "AllTeamMember" ("teamId", "userId", "role", "isOwner", "leftAt")
        values (
          1,
          ${userId},
          ${i === 0 ? "'CAPTAIN'" : "'FRONTLINE'"},
          ${i === 0 ? 1 : 0},
          ${i < 4 ? "null" : "1672587342"}
        )
    `
      )
      .run();
  }
}

function otherTeams() {
  const usersInTeam = (
    sql
      .prepare(
        /*sql */ `select
    "userId"
    from "AllTeamMember"
    `
      )
      .all() as any[]
  ).map((row) => row.userId);

  const userIds = userIdsInRandomOrder().filter(
    (u) => !usersInTeam.includes(u) && u !== 2
  );

  for (let i = 3; i < 50; i++) {
    const teamName = `${capitalize(faker.word.adjective())} ${capitalize(
      faker.word.noun()
    )}`;
    const teamCustomUrl = mySlugify(teamName);

    sql
      .prepare(
        /* sql */ `
      insert into "AllTeam" ("id", "name", "customUrl", "inviteCode", "twitter", "bio")
       values (
          ${i},
          '${teamName}',
          '${teamCustomUrl}',
          '${nanoid(INVITE_CODE_LENGTH)}',
          '${faker.internet.userName()}',
          '${faker.lorem.paragraph()}'
       )
    `
      )
      .run();

    const numMembers = faker.helpers.arrayElement([
      1, 2, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 7, 8,
    ]);
    for (let j = 0; j < numMembers; j++) {
      const userId = userIds.shift()!;

      sql
        .prepare(
          /*sql*/ `
        insert into "AllTeamMember" ("teamId", "userId", "role", "isOwner")
          values (
            ${i},
            ${userId},
            ${j === 0 ? "'CAPTAIN'" : "'FRONTLINE'"},
            ${j === 0 ? 1 : 0}
          )
      `
        )
        .run();
    }
  }
}

function realVideo() {
  createVod({
    type: "TOURNAMENT",
    youtubeId: "M4aV-BQWlVg",
    youtubeDate: dateToDatabaseTimestamp(new Date("02-02-2023")),
    submitterUserId: 1,
    title: "LUTI Division X Tournament - ABBF (THRONE) vs. Ascension",
    povUserId: 2,
    isValidated: true,
    matches: [
      {
        mode: "SZ",
        stageId: 8,
        startsAt: 13,
        weapons: [3040],
      },
      {
        mode: "CB",
        stageId: 6,
        startsAt: 307,
        weapons: [3040],
      },
      {
        mode: "TC",
        stageId: 2,
        startsAt: 680,
        weapons: [3040],
      },
      {
        mode: "SZ",
        stageId: 9,
        startsAt: 1186,
        weapons: [3040],
      },
      {
        mode: "RM",
        stageId: 2,
        startsAt: 1386,
        weapons: [3000],
      },
      {
        mode: "TC",
        stageId: 4,
        startsAt: 1586,
        weapons: [1110],
      },
      // there are other matches too...
    ],
  });
}

function realVideoCast() {
  createVod({
    type: "CAST",
    youtubeId: "M4aV-BQWlVg",
    youtubeDate: dateToDatabaseTimestamp(new Date("02-02-2023")),
    submitterUserId: 1,
    title: "LUTI Division X Tournament - ABBF (THRONE) vs. Ascension",
    isValidated: true,
    matches: [
      {
        mode: "SZ",
        stageId: 8,
        startsAt: 13,
        weapons: [3040, 1000, 2000, 4000, 5000, 6000, 7010, 8000],
      },
      {
        mode: "CB",
        stageId: 6,
        startsAt: 307,
        weapons: [3040, 1001, 2010, 4001, 5001, 6010, 7020, 8010],
      },
      {
        mode: "TC",
        stageId: 2,
        startsAt: 680,
        weapons: [3040, 1010, 2020, 4010, 5010, 6020, 7010, 8000],
      },
      {
        mode: "SZ",
        stageId: 9,
        startsAt: 1186,
        weapons: [3040, 1020, 2030, 4020, 5020, 6020, 7020, 8010],
      },
      // there are other matches too...
    ],
  });
}

// some copy+paste from placements script
const addPlayerStm = sql.prepare(/* sql */ `
  insert into "SplatoonPlayer" ("splId", "userId")
  values (@splId, @userId)
  on conflict ("splId") do nothing
`);

const addPlacementStm = sql.prepare(/* sql */ `
  insert into "XRankPlacement" (
    "weaponSplId",
    "name",
    "nameDiscriminator",
    "power",
    "rank",
    "title",
    "badges",
    "bannerSplId",
    "playerId",
    "month",
    "year",
    "region",
    "mode"
  )
  values (
    @weaponSplId,
    @name,
    @nameDiscriminator,
    @power,
    @rank,
    @title,
    @badges,
    @bannerSplId,
    (select "id" from "SplatoonPlayer" where "splId" = @playerSplId),
    @month,
    @year,
    @region,
    @mode
  )
`);

function xRankPlacements() {
  sql.transaction(() => {
    for (const [i, placement] of placements.entries()) {
      const userId = () => {
        // admin
        if (placement.playerSplId === "qx6imlx72tfeqrhqfnmm") return 1;
        // user in top 500 who is not plus server member
        if (i === 0) return 500;

        return null;
      };
      addPlayerStm.run({
        splId: placement.playerSplId,
        userId: userId(),
      });
      addPlacementStm.run(placement);
    }
  })();
}

function userFavBadges() {
  // randomly choose Sendou's favorite badge
  const badgeList = shuffle(
    (
      sql
        .prepare(`select "badgeId" from "BadgeOwner" where "userId" = 1`)
        .all() as any[]
    ).map((row) => row.badgeId)
  );
  sql
    .prepare(`update "User" set "favoriteBadgeId" = $id where "id" = 1`)
    .run({ id: badgeList[0] });
}
