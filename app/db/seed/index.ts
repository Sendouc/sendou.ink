import { faker } from "@faker-js/faker";
import capitalize from "just-capitalize";
import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import { ADMIN_DISCORD_ID, ADMIN_ID, INVITE_CODE_LENGTH } from "~/constants";
import { db } from "~/db";
import { sql } from "~/db/sql";
import {
  abilities,
  clothesGearIds,
  headGearIds,
  mainWeaponIds,
  modesShort,
  shoesGearIds,
  stageIds,
} from "~/modules/in-game-lists";
import type {
  MainWeaponId,
  StageId,
  AbilityType,
} from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import {
  lastCompletedVoting,
  nextNonCompletedVoting,
} from "~/modules/plus-server";
import allTags from "~/features/calendar/tags.json";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import type { UpsertManyPlusVotesArgs } from "../models/plusVotes/queries.server";
import { nanoid } from "nanoid";
import { mySlugify } from "~/utils/urls";
import { createVod } from "~/features/vods/queries/createVod.server";

import placements from "./placements.json";
import {
  NZAP_TEST_DISCORD_ID,
  ADMIN_TEST_AVATAR,
  NZAP_TEST_AVATAR,
  NZAP_TEST_ID,
  AMOUNT_OF_CALENDAR_EVENTS,
} from "./constants";
import { TOURNAMENT } from "~/features/tournament/tournament-constants";
import type { SeedVariation } from "~/routes/seed";
import { nullFilledArray, pickRandomItem } from "~/utils/arrays";
import type { Art, UserSubmittedImage } from "../types";
import { createGroup } from "~/features/sendouq/queries/createGroup.server";
import { MAP_LIST_PREFERENCE_OPTIONS } from "~/features/sendouq/q-constants";
import { addMember } from "~/features/sendouq/queries/addMember.server";
import { createMatch } from "~/features/sendouq/queries/createMatch.server";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { addSkills } from "~/features/sendouq/queries/addSkills.server";
import { reportScore } from "~/features/sendouq/queries/reportScore.server";
import { calculateMatchSkills } from "~/features/sendouq/core/skills.server";
import { winnersArrayToWinner } from "~/features/sendouq/q-utils";
import { addReportedWeapons } from "~/features/sendouq/queries/addReportedWeapons.server";
import { findMatchById } from "~/features/sendouq/queries/findMatchById.server";
import { setGroupAsInactive } from "~/features/sendouq/queries/setGroupAsInactive.server";
import { addMapResults } from "~/features/sendouq/queries/addMapResults.server";
import {
  summarizeMaps,
  summarizePlayerResults,
} from "~/features/sendouq/core/summarizer.server";
import { groupForMatch } from "~/features/sendouq/queries/groupForMatch.server";
import { addPlayerResults } from "~/features/sendouq/queries/addPlayerResults.server";
import { updateVCStatus } from "~/features/sendouq/queries/updateVCStatus.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";

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
  arts,
  commissionsOpen,
  playedMatches,
  groups,
];

export async function seed(variation?: SeedVariation | null) {
  wipeDB();

  for (const seedFunc of basicSeeds(variation)) {
    if (!seedFunc) continue;

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await seedFunc();
  }
}

function wipeDB() {
  const tablesToDelete = [
    "Skill",
    "ReportedWeapon",
    "GroupMatchMap",
    "GroupMatch",
    "Group",
    "ArtUserMetadata",
    "Art",
    "UnvalidatedUserSubmittedImage",
    "AllTeamMember",
    "AllTeam",
    "Build",
    "TournamentTeamMember",
    "MapPoolMap",
    "TournamentMatchGameResult",
    "TournamentTeam",
    "TournamentStage",
    "TournamentResult",
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
      `update "User" set "patronTier" = 2, "patronSince" = 1674663454 where id = 1`,
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
    `,
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
        WHERE id = $userId`,
      )
      .run(args);
  }

  for (let id = 3; id < 500; id++) {
    if (Math.random() < 0.25) continue; // 75% have bio

    sql
      .prepare(
        `UPDATE "User" SET bio = $bio, country = $country WHERE id = $id`,
      )
      .run({
        id,
        bio: faker.lorem.paragraphs(
          faker.helpers.arrayElement([1, 1, 1, 2, 3, 4]),
          "\n\n",
        ),
        country: Math.random() > 0.5 ? faker.location.countryCode() : null,
      });
  }

  for (let id = 3; id < 500; id++) {
    if (Math.random() < 0.15) continue; // 85% have weapons

    const weapons = shuffle([...mainWeaponIds]);

    for (let j = 0; j < faker.helpers.arrayElement([1, 2, 3, 4, 5]); j++) {
      sql
        .prepare(
          /* sql */ `insert into "UserWeapon" (
          "userId",
          "weaponSplId",
          "order",
          "isFavorite"
        ) values (
          @userId,
          @weaponSplId,
          @order,
          @isFavorite
        )`,
        )
        .run({
          userId: id,
          weaponSplId: weapons.pop()!,
          order: j + 1,
          isFavorite: Math.random() > 0.8 ? 1 : 0,
        });
    }
  }

  for (let id = 1; id < 500; id++) {
    const defaultLanguages = Math.random() > 0.1 ? ["en"] : [];
    if (Math.random() > 0.9) defaultLanguages.push("es");
    if (Math.random() > 0.9) defaultLanguages.push("fr");
    if (Math.random() > 0.9) defaultLanguages.push("de");
    if (Math.random() > 0.9) defaultLanguages.push("it");
    if (Math.random() > 0.9) defaultLanguages.push("ja");

    updateVCStatus({
      languages: defaultLanguages,
      userId: id,
      vc:
        Math.random() > 0.2
          ? "YES"
          : faker.helpers.arrayElement(["YES", "NO", "LISTEN_ONLY"]),
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
  `,
    )
    .run();
}

function badgesToAdmin() {
  const availableBadgeIds = shuffle(
    (sql.prepare(`select "id" from "Badge"`).all() as any[]).map((b) => b.id),
  ).slice(0, 8) as number[];

  const badgesWithDuplicates = availableBadgeIds.flatMap((id) =>
    new Array(faker.helpers.arrayElement([1, 1, 1, 2, 3, 4]))
      .fill(null)
      .map(() => id),
  );

  for (const id of badgesWithDuplicates) {
    sql
      .prepare(
        `insert into "TournamentBadgeOwner" ("badgeId", "userId") values ($id, $userId)`,
      )
      .run({ id, userId: 1 });
  }
}

function getAvailableBadgeIds() {
  return shuffle(
    (sql.prepare(`select "id" from "Badge"`).all() as any[]).map((b) => b.id),
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
          `insert into "TournamentBadgeOwner" ("badgeId", "userId") values ($id, $userId)`,
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
        `insert into "BadgeManager" ("badgeId", "userId") values ($id, $userId)`,
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
        `update user set "patronTier" = $patronTier, "patronSince" = $patronSince where id = $id`,
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
      `,
      )
      .run({
        id,
        name: `${capitalize(faker.word.adjective())} ${capitalize(
          faker.word.noun(),
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
                  ]),
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
      `,
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
        `,
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
          values ($eventId, $badgeId)`,
        )
        .run({ eventId, badgeId: availableBadgeIds.pop() });
    }
  }
}

async function calendarEventResults() {
  let userIds = userIdsInRandomOrder();
  const eventIdsOfPast = new Set<number>(
    (
      sql
        .prepare(
          `select "CalendarEvent"."id" 
          from "CalendarEvent" 
          join "CalendarEventDate" on "CalendarEventDate"."eventId" = "CalendarEvent"."id"
          where "CalendarEventDate"."startTime" < $startTime`,
        )
        .all({ startTime: dateToDatabaseTimestamp(new Date()) }) as any[]
    ).map((r) => r.id),
  );

  for (const eventId of eventIdsOfPast) {
    // event id = 1 needs to be without results for e2e tests
    if (Math.random() < 0.3 || eventId === 1) continue;

    await CalendarRepository.upsertReportedScores({
      eventId,
      participantCount: faker.number.int({ min: 10, max: 250 }),
      results: new Array(faker.helpers.arrayElement([1, 1, 2, 3, 3, 3, 8, 8]))
        .fill(null)
        // eslint-disable-next-line no-loop-func
        .map((_, i) => ({
          placement: i + 1,
          teamName: capitalize(faker.word.noun()),
          players: new Array(
            faker.helpers.arrayElement([1, 2, 3, 4, 4, 4, 4, 4, 5, 6]),
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
      `,
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
      `,
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
      `,
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
      `,
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

const availableStages: StageId[] = [1, 2, 3, 4, 6, 7, 8, 10, 11];
const availablePairs = rankedModesShort
  .flatMap((mode) =>
    availableStages.map((stageId) => ({ mode, stageId: stageId })),
  )
  .filter((pair) => !tiebreakerPicks.has(pair));
function calendarEventWithToToolsTeams(sz?: boolean) {
  const userIds = userIdsInAscendingOrderById();
  const names = Array.from(
    new Set(new Array(100).fill(null).map(() => validTournamentTeamName())),
  ).concat("Chimera");

  for (let id = 1; id <= 16; id++) {
    const teamId = id + (sz ? 100 : 0);

    const name = names.pop();
    invariant(name, "tournament team name is falsy");

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
      `,
      )
      .run({
        id: teamId,
        name,
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
      `,
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
      `,
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
        `,
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
    `,
      )
      .run({
        userId: id,
        tournamentId: 1,
        canVc: Number(Math.random() > 0.5),
        bestWeapons: nullFilledArray(
          faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5]),
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
                faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5]),
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
      adminWeaponPool.filter((id) => id !== 40).slice(),
    );

    db.builds.create({
      title: `${capitalize(faker.word.adjective())} ${capitalize(
        faker.word.noun(),
      )}`,
      ownerId: 1,
      private: 0,
      description: Math.random() < 0.75 ? faker.lorem.paragraph() : null,
      headGearSplId: randomOrderHeadGear[0]!,
      clothesGearSplId: randomOrderClothesGear[0]!,
      shoesGearSplId: randomOrderShoesGear[0]!,
      weaponSplIds: new Array(
        faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5]),
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
      (id) => id !== 500 && id !== ADMIN_ID && id !== NZAP_TEST_ID,
    ),
    500,
  ];

  for (let i = 0; i < 500; i++) {
    const SPLATTERSHOT_ID = 40;

    const randomOrderHeadGear = shuffle(headGearIds.slice());
    const randomOrderClothesGear = shuffle(clothesGearIds.slice());
    const randomOrderShoesGear = shuffle(shoesGearIds.slice());
    const randomOrderWeaponIds = shuffle(mainWeaponIds.slice()).filter(
      (id) => id !== SPLATTERSHOT_ID,
    );

    db.builds.create({
      private: 0,
      title: `${capitalize(faker.word.adjective())} ${capitalize(
        faker.word.noun(),
      )}`,
      ownerId: users.pop()!,
      description: Math.random() < 0.75 ? faker.lorem.paragraph() : null,
      headGearSplId: randomOrderHeadGear[0]!,
      clothesGearSplId: randomOrderClothesGear[0]!,
      shoesGearSplId: randomOrderShoesGear[0]!,
      weaponSplIds: new Array(
        faker.helpers.arrayElement([1, 1, 1, 2, 2, 3, 4, 5]),
      )
        .fill(null)
        .map((_, i) =>
          i === 0 ? SPLATTERSHOT_ID : randomOrderWeaponIds.pop()!,
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
  `,
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
  `,
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
    `,
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
    `,
      )
      .all() as any[]
  ).map((row) => row.userId);

  const userIds = userIdsInRandomOrder().filter(
    (u) => !usersInTeam.includes(u) && u !== 2,
  );

  for (let i = 3; i < 50; i++) {
    const teamName = `${capitalize(faker.word.adjective())} ${capitalize(
      faker.word.noun(),
    )}`;
    const teamCustomUrl = mySlugify(teamName);

    sql
      .prepare(
        /* sql */ `
      insert into "AllTeam" ("id", "name", "customUrl", "inviteCode", "twitter", "bio")
       values (
          @id,
          @name,
          @customUrl,
          @inviteCode,
          @twitter,
          @bio
       )
    `,
      )
      .run({
        id: i,
        name: teamName,
        customUrl: teamCustomUrl,
        inviteCode: nanoid(INVITE_CODE_LENGTH),
        twitter: faker.internet.userName(),
        bio: faker.lorem.paragraph(),
      });

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
      `,
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
    ).map((row) => row.badgeId),
  );
  sql
    .prepare(`update "User" set "favoriteBadgeId" = $id where "id" = 1`)
    .run({ id: badgeList[0] });
}

const addArtStm = sql.prepare(/* sql */ `
  insert into "Art" (
    "imgId",
    "authorId",
    "isShowcase",
    "description"
  )
  values (
    @imgId,
    @authorId,
    @isShowcase,
    @description
  ) returning *
`);
const addUnvalidatedUserSubmittedImageStm = sql.prepare(/* sql */ `
  insert into "UnvalidatedUserSubmittedImage" (
    "validatedAt",
    "url",
    "submitterUserId"
  ) values (
    @validatedAt,
    @url,
    @submitterUserId
  ) returning *
`);
const addArtUserMetadataStm = sql.prepare(/* sql */ `
  insert into "ArtUserMetadata" (
    "artId",
    "userId"
  )
  values (
    @artId,
    @userId
  )
`);
// get random image url: https://source.unsplash.com/random/?dog&1
const artImgUrls = [
  "https://images.unsplash.com/photo-1611627474565-2367887415d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NTA2&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1625120742520-3f085b6894ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NTI2&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1656695607245-9686ce8e1a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NTQ1&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1673011526786-c7bf154d2c6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NTY5&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1643833994700-059713434c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NTc2&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1541425284102-3d2c49dcb2bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NTk5&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1526946366170-7a81b443c4e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NjA4&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1551368003-4d96079d0a99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NjIz&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1595960684234-49d2a004e753?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NjMw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1676275062470-4b628cf1ce01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU1NjM5&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1602099081031-767e09dfdbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NDYz&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1547532182-bf296f6be875?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NDY5&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1601549838695-57580707e367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NDc2&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1595361315899-72a291112b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NDgy&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1676275061266-a28f2f3f4552?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NDg4&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/44/C3EWdWzT8imxs0fKeKoC_blackforrest.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NDk1&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1628425242605-a0039d89e8b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NTAx&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1542917118-105d7d34b9ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NTEw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1601549838695-57580707e367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NTE3&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1660583490803-75c0307c805b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nLDF8fHx8fHwxNjg4NTU2NTQ2&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1490042706304-06c664f6fd9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nLDF8fHx8fHwxNjg4NTU2NTU4&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1676998652985-fd74c7b2a8d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nLDF8fHx8fHwxNjg4NTU2NTY0&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1470390356535-d19bbf47bacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nLDF8fHx8fHwxNjg4NTU2NTcx&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nLDF8fHx8fHwxNjg4NTU2Njcy&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1604495589307-973bd87d7fa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nLDF8fHx8fHwxNjg4NTU2Njg2&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1563476651637-3e5c5941d432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NzEw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1551567819-eef106c515b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NzE2&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
  "https://images.unsplash.com/photo-1553536590-d28c5d5dee92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bmF0dXJlLDF8fHx8fHwxNjg4NTU2NzIx&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
];

function arts() {
  const artUsers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const allUsers = userIdsInRandomOrder();
  const urls = [...artImgUrls];

  for (const userId of artUsers) {
    for (let i = 0; i < faker.helpers.arrayElement([1, 2, 3, 3, 3, 4]); i++) {
      const getUrl = () => {
        if (urls.length === 0) {
          return faker.image.url();
        }

        return urls.pop();
      };

      const addedArt = addArtStm.get({
        imgId: (
          addUnvalidatedUserSubmittedImageStm.get({
            validatedAt: dateToDatabaseTimestamp(new Date()),
            url: getUrl(),
            submitterUserId: userId,
          }) as UserSubmittedImage
        ).id,
        authorId: userId,
        isShowcase: i === 0 ? 1 : 0,
        description: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
      }) as Art;

      if (i === 1) {
        for (
          let i = 0;
          i < faker.helpers.arrayElement([1, 1, 1, 1, 2, 4]);
          i++
        ) {
          addArtUserMetadataStm.run({
            artId: addedArt.id,
            userId: i === 0 ? NZAP_TEST_ID : allUsers.pop(),
          });
        }
      }
    }
  }
}

const updateCommissionStm = sql.prepare(/* sql */ `
  update "User"
  set
    "commissionsOpen" = @commissionsOpen,
    "commissionText" = @commissionText
  where id = @userId
`);
function commissionsOpen() {
  const allUsers = userIdsInRandomOrder();

  for (const userId of allUsers) {
    if (Math.random() > 0.5) {
      updateCommissionStm.run({
        commissionsOpen: 1,
        commissionText: faker.lorem.paragraph(),
        userId,
      });
    }
  }
}

const SENDOU_IN_FULL_GROUP = true;
function groups() {
  const users = userIdsInAscendingOrderById()
    .slice(0, 100)
    .filter((id) => id !== ADMIN_ID && id !== NZAP_TEST_ID);
  users.push(NZAP_TEST_ID);

  for (let i = 0; i < 25; i++) {
    const group = createGroup({
      mapListPreference: faker.helpers.arrayElement(
        MAP_LIST_PREFERENCE_OPTIONS,
      ),
      status: "ACTIVE",
      userId: users.pop()!,
      mapPool: new MapPool([
        { mode: "SZ", stageId: 1 },
        { mode: "SZ", stageId: 2 },
        { mode: "SZ", stageId: 3 },
        { mode: "SZ", stageId: 4 },
        { mode: "SZ", stageId: 5 },
        { mode: "SZ", stageId: 6 },
        { mode: "TC", stageId: 7 },
        { mode: "TC", stageId: 8 },
        { mode: "TC", stageId: 15 },
        { mode: "RM", stageId: 10 },
        { mode: "RM", stageId: 11 },
        { mode: "RM", stageId: 16 },
        { mode: "CB", stageId: 13 },
        { mode: "CB", stageId: 14 },
        { mode: "CB", stageId: 17 },
      ]),
    });

    const amountOfAdditionalMembers = () => {
      if (SENDOU_IN_FULL_GROUP) {
        if (i === 0) return 3;
        if (i === 1) return 3;
      }

      return i === 0 ? 2 : i % 4;
    };

    for (let j = 0; j < amountOfAdditionalMembers(); j++) {
      sql
        .prepare(
          /* sql */ `
        insert into "GroupMember" ("groupId", "userId", "role")
        values (@groupId, @userId, @role)
      `,
        )
        .run({
          groupId: group.id,
          userId: users.pop()!,
          role: "REGULAR",
        });
    }

    if (i === 0 && SENDOU_IN_FULL_GROUP) {
      users.push(ADMIN_ID);
    }
  }
}

const randomMapList = (
  groupAlpha: number,
  groupBravo: number,
): TournamentMapListMap[] => {
  const szOnly = faker.helpers.arrayElement([true, false]);
  const modePattern = shuffle([...rankedModesShort]);

  const mapList: TournamentMapListMap[] = [];
  const stageIdsShuffled = shuffle([...stageIds]);

  for (let i = 0; i < 7; i++) {
    const rankedMode = modePattern.pop()!;
    mapList.push({
      mode: szOnly ? "SZ" : rankedMode,
      stageId: stageIdsShuffled.pop()!,
      source: i === 6 ? "BOTH" : i % 2 === 0 ? groupAlpha : groupBravo,
    });

    modePattern.unshift(rankedMode);
  }

  return mapList;
};

const MATCHES_COUNT = 500;

function playedMatches() {
  const _groupMembers = (() => {
    return new Array(50).fill(null).map(() => {
      const users = shuffle(userIdsInAscendingOrderById().slice(0, 50));

      return new Array(4).fill(null).map(() => users.pop()!);
    });
  })();
  const defaultWeapons = Object.fromEntries(
    userIdsInAscendingOrderById()
      .slice(0, 50)
      .map((id) => {
        const weapons = shuffle([...mainWeaponIds]);
        return [id, weapons[0]];
      }),
  );

  // mid august 2021
  let matchDate = new Date(Date.UTC(2021, 7, 15, 0, 0, 0, 0));
  for (let i = 0; i < MATCHES_COUNT; i++) {
    const groupMembers = shuffle([..._groupMembers]);
    const groupAlphaMembers = groupMembers.pop()!;
    invariant(groupAlphaMembers, "groupAlphaMembers not found");

    const getGroupBravo = (): number[] => {
      const result = groupMembers.pop()!;
      invariant(result, "groupBravoMembers not found");
      if (groupAlphaMembers.some((m) => result.includes(m))) {
        return getGroupBravo();
      }

      return result;
    };
    const groupBravoMembers = getGroupBravo();

    let groupAlpha = 0;
    let groupBravo = 0;
    // -> create groups
    for (let i = 0; i < 2; i++) {
      const users = i === 0 ? [...groupAlphaMembers] : [...groupBravoMembers];
      const group = createGroup({
        // these should not matter here
        mapListPreference: "NO_PREFERENCE",
        mapPool: new MapPool([]),
        status: "ACTIVE",
        userId: users.pop()!,
      });

      // -> add regular members of groups
      for (let i = 0; i < 3; i++) {
        addMember({
          groupId: group.id,
          userId: users.pop()!,
        });
      }

      if (i === 0) {
        groupAlpha = group.id;
      } else {
        groupBravo = group.id;
      }
    }

    invariant(groupAlpha !== 0 && groupBravo !== 0, "groups not created");

    // @ts-expect-error creating without memento on purpose
    const match = createMatch({
      alphaGroupId: groupAlpha,
      bravoGroupId: groupBravo,
      mapList: randomMapList(groupAlpha, groupBravo),
    });

    // update match createdAt to the past
    sql
      .prepare(
        /* sql */ `
      update "GroupMatch"
      set "createdAt" = @createdAt
      where "id" = @id
    `,
      )
      .run({
        createdAt: dateToDatabaseTimestamp(matchDate),
        id: match.id,
      });

    if (Math.random() > 0.95) {
      // increment date by 1 day
      matchDate = new Date(matchDate.getTime() + 1000 * 60 * 60 * 24);
    }

    // -> report score
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const winners = faker.helpers.arrayElement([
      ["ALPHA", "ALPHA", "ALPHA", "ALPHA"],
      ["ALPHA", "ALPHA", "ALPHA", "BRAVO", "ALPHA"],
      ["BRAVO", "BRAVO", "BRAVO", "BRAVO"],
      ["ALPHA", "BRAVO", "BRAVO", "BRAVO", "BRAVO"],
      ["ALPHA", "ALPHA", "ALPHA", "BRAVO", "BRAVO", "BRAVO", "BRAVO"],
      ["BRAVO", "ALPHA", "BRAVO", "ALPHA", "BRAVO", "ALPHA", "BRAVO"],
      ["ALPHA", "BRAVO", "BRAVO", "ALPHA", "ALPHA", "ALPHA"],
      ["ALPHA", "BRAVO", "ALPHA", "BRAVO", "BRAVO", "BRAVO"],
    ]) as ("ALPHA" | "BRAVO")[];
    const winner = winnersArrayToWinner(winners);
    const finishedMatch = findMatchById(match.id)!;

    const { newSkills, differences } = calculateMatchSkills({
      groupMatchId: match.id,
      winner: winner === "ALPHA" ? groupAlphaMembers : groupBravoMembers,
      loser: winner === "ALPHA" ? groupBravoMembers : groupAlphaMembers,
      loserGroupId: winner === "ALPHA" ? groupBravo : groupAlpha,
      winnerGroupId: winner === "ALPHA" ? groupAlpha : groupBravo,
    });
    const members = [
      ...groupForMatch(match.alphaGroupId)!.members.map((m) => ({
        ...m,
        groupId: match.alphaGroupId,
      })),
      ...groupForMatch(match.bravoGroupId)!.members.map((m) => ({
        ...m,
        groupId: match.bravoGroupId,
      })),
    ];
    sql.transaction(() => {
      reportScore({
        matchId: match.id,
        reportedByUserId:
          Math.random() > 0.5 ? groupAlphaMembers[0] : groupBravoMembers[0],
        winners,
      });
      addSkills({
        skills: newSkills,
        differences,
        groupMatchId: match.id,
        oldMatchMemento: { users: {}, groups: {} },
      });
      setGroupAsInactive(groupAlpha);
      setGroupAsInactive(groupBravo);
      addMapResults(summarizeMaps({ match: finishedMatch, members, winners }));
      addPlayerResults(
        summarizePlayerResults({ match: finishedMatch, members, winners }),
      );
    })();

    // -> add weapons for 90% of matches
    if (Math.random() > 0.9) continue;
    const users = [...groupAlphaMembers, ...groupBravoMembers];
    const mapsWithUsers = users.flatMap((u) =>
      finishedMatch.mapList.map((m) => ({ map: m, user: u })),
    );

    addReportedWeapons(
      mapsWithUsers.map((mu) => {
        const weapon = () => {
          if (Math.random() < 0.9) return defaultWeapons[mu.user];
          if (Math.random() > 0.5)
            return (
              mainWeaponIds.find((id) => id > defaultWeapons[mu.user]) ?? 0
            );

          const shuffled = shuffle([...mainWeaponIds]);

          return shuffled[0];
        };

        return {
          groupMatchMapId: mu.map.id,
          userId: mu.user,
          weaponSplId: weapon(),
        };
      }),
    );
  }
}
