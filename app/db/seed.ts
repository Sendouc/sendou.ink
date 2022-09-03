import { faker } from "@faker-js/faker";
import capitalize from "just-capitalize";
import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import { ADMIN_DISCORD_ID } from "~/constants";
import { db } from "~/db";
import { sql } from "~/db/sql";
import {
  abilities,
  clothesGearIds,
  headGearIds,
  modesShort,
  shoesGearIds,
  weaponIds,
} from "~/modules/in-game-lists";
import {
  lastCompletedVoting,
  nextNonCompletedVoting,
} from "~/modules/plus-server";
import allTags from "~/routes/calendar/tags.json";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import type { UpsertManyPlusVotesArgs } from "./models/plusVotes/queries.server";

const ADMIN_TEST_AVATAR = "e424e1ba50d2019fdc4730d261e56c55";

const NZAP_TEST_DISCORD_ID = "455039198672453645";
const NZAP_TEST_AVATAR = "f809176af93132c3db5f0a5019e96339"; // https://cdn.discordapp.com/avatars/455039198672453645/f809176af93132c3db5f0a5019e96339.webp?size=160
const NZAP_TEST_ID = 2;

const AMOUNT_OF_CALENDAR_EVENTS = 200;

const basicSeeds = [
  adminUser,
  nzapUser,
  users,
  userBios,
  lastMonthsVoting,
  lastMonthSuggestions,
  thisMonthsSuggestions,
  badgesToAdmin,
  badgesToUsers,
  badgeManagers,
  patrons,
  calendarEvents,
  calendarEventBadges,
  calendarEventResults,
  adminBuilds,
];

export function seed() {
  wipeDB();

  for (const seedFunc of basicSeeds) {
    seedFunc();
  }
}

function wipeDB() {
  const tablesToDelete = [
    "Build",
    "CalendarEventDate",
    "CalendarEventResultPlayer",
    "CalendarEventResultTeam",
    "CalendarEventBadge",
    "CalendarEvent",
    "User",
    "PlusVote",
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
    discordDiscriminator: "4059",
    discordId: ADMIN_DISCORD_ID,
    discordName: "Sendou",
    twitch: "Sendou",
    youtubeId: "UCWbJLXByvsfQvTcR4HLPs5Q",
    discordAvatar: ADMIN_TEST_AVATAR,
    twitter: "sendouc",
  });
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
  });
}

function users() {
  const usedNames = new Set<string>();
  new Array(500).fill(null).map(fakeUser(usedNames)).forEach(db.users.upsert);
}

function userBios() {
  for (let id = 3; id < 500; id++) {
    if (Math.random() < 0.25) continue; // 75% have bio

    sql.prepare(`UPDATE "User" SET bio = $bio WHERE id = $id`).run({
      id,
      bio: faker.lorem.paragraphs(
        faker.helpers.arrayElement([1, 1, 1, 2, 3, 4]),
        "\n\n"
      ),
    });
  }
}

function fakeUser(usedNames: Set<string>) {
  return () => ({
    discordAvatar: null,
    discordDiscriminator: String(faker.random.numeric(4)),
    discordId: String(faker.random.numeric(17)),
    discordName: uniqueDiscordName(usedNames),
    twitch: null,
    twitter: null,
    youtubeId: null,
  });
}

function uniqueDiscordName(usedNames: Set<string>) {
  let result = faker.random.word();
  while (usedNames.has(result)) {
    result = faker.random.word();
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

function badgesToAdmin() {
  const availableBadgeIds = shuffle(
    sql
      .prepare(`select "id" from "Badge"`)
      .all()
      .map((b) => b.id)
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
    sql
      .prepare(`select "id" from "Badge"`)
      .all()
      .map((b) => b.id)
  );
}

function badgesToUsers() {
  const availableBadgeIds = getAvailableBadgeIds();

  let userIds = sql
    .prepare(`select "id" from "User" where id != 2`) // no badges for N-ZAP
    .all()
    .map((u) => u.id) as number[];

  for (const id of availableBadgeIds) {
    userIds = shuffle(userIds);
    for (
      let i = 0;
      i <
      faker.datatype.number({
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
  const userIds = sql
    .prepare(`select "id" from "User" order by random() limit 50`)
    .all()
    .map((u) => u.id);

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

function userIdsInRandomOrder() {
  return sql
    .prepare(`select "id" from "User" order by random()`)
    .all()
    .map((u) => u.id) as number[];
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
      id % 2 === 0 ? faker.date.soon(42) : faker.date.recent(42);
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
    sql
      .prepare(
        `select "CalendarEvent"."id" 
          from "CalendarEvent" 
          join "CalendarEventDate" on "CalendarEventDate"."eventId" = "CalendarEvent"."id"
          where "CalendarEventDate"."startTime" < $startTime`
      )
      .all({ startTime: dateToDatabaseTimestamp(new Date()) })
      .map((r) => r.id)
  );

  for (const eventId of eventIdsOfPast) {
    // event id = 1 needs to be without results for e2e tests
    if (Math.random() < 0.3 || eventId === 1) continue;

    db.calendarEvents.upsertReportedScores({
      eventId,
      participantCount: faker.datatype.number({ min: 10, max: 250 }),
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
                name: withStringName ? faker.name.firstName() : null,
                userId: withStringName ? null : userIds.pop()!,
              };
            }),
        })),
    });

    userIds = userIdsInRandomOrder();
  }
}

function adminBuilds() {
  for (let i = 0; i < 50; i++) {
    const randomOrderHeadGear = shuffle(headGearIds.slice());
    const randomOrderClothesGear = shuffle(clothesGearIds.slice());
    const randomOrderShoesGear = shuffle(shoesGearIds.slice());
    const randomOrderWeaponIds = shuffle(weaponIds.slice());

    db.builds.create({
      title: `${capitalize(faker.word.adjective())} ${capitalize(
        faker.word.noun()
      )}`,
      ownerId: 1,
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
      abilities: new Array(12).fill(null).map((_, i) => {
        const gearType = i < 4 ? "HEAD" : i < 8 ? "CLOTHES" : "SHOES";
        const isMain = i === 0 || i === 4 || i === 8;

        const randomOrderAbilities = shuffle([...abilities]);

        const getAbility = () => {
          const legalAbilityForSlot = randomOrderAbilities.find((ability) => {
            if (
              ability.type === "HEAD_MAIN_ONLY" &&
              (gearType !== "HEAD" || !isMain)
            ) {
              return false;
            }
            if (
              ability.type === "CLOTHES_MAIN_ONLY" &&
              (gearType !== "CLOTHES" || !isMain)
            ) {
              return false;
            }
            if (
              ability.type === "SHOES_MAIN_ONLY" &&
              (gearType !== "SHOES" || !isMain)
            ) {
              return false;
            }

            return true;
          });

          invariant(legalAbilityForSlot);

          return legalAbilityForSlot.name;
        };

        return {
          ability: getAbility(),
          gearType,
          slotIndex: (i % 4) as any,
        };
      }),
    });
  }
}
