import { add } from "date-fns";
import type { Insertable, NotNull, Transaction } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { nanoid } from "nanoid";
import { db } from "~/db/sql";
import type { CastedMatchesInfo, DB, Tables } from "~/db/tables";
import { Status } from "~/modules/brackets-model";
import { modesShort } from "~/modules/in-game-lists";
import {
  databaseTimestampToDate,
  dateToDatabaseTimestamp,
} from "~/utils/dates";
import { COMMON_USER_FIELDS, userChatNameColor } from "~/utils/kysely.server";

export async function findById(id: number) {
  const result = await db
    .selectFrom("Tournament")
    .innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .select(({ eb, exists, selectFrom }) => [
      "Tournament.id",
      "CalendarEvent.id as eventId",
      "CalendarEvent.discordUrl",
      "Tournament.settings",
      "Tournament.showMapListGenerator",
      "Tournament.castTwitchAccounts",
      "Tournament.castedMatchesInfo",
      "Tournament.mapPickingStyle",
      "Tournament.rules",
      "CalendarEvent.name",
      "CalendarEvent.description",
      "CalendarEventDate.startTime",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .select([...COMMON_USER_FIELDS, userChatNameColor])
          .whereRef("User.id", "=", "CalendarEvent.authorId"),
      ).as("author"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStaff")
          .innerJoin("User", "TournamentStaff.userId", "User.id")
          .select([
            ...COMMON_USER_FIELDS,
            userChatNameColor,
            "TournamentStaff.role",
          ])
          .where("TournamentStaff.tournamentId", "=", id),
      ).as("staff"),
      exists(
        selectFrom("TournamentResult")
          .where("TournamentResult.tournamentId", "=", id)
          .select("TournamentResult.tournamentId"),
      ).as("isFinalized"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStage")
          .select([
            "TournamentStage.id",
            "TournamentStage.name",
            "TournamentStage.type",
            "TournamentStage.createdAt",
          ])
          .where("TournamentStage.tournamentId", "=", id)
          .orderBy("TournamentStage.number asc"),
      ).as("inProgressBrackets"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentTeam")
          .select(({ eb: innerEb }) => [
            "TournamentTeam.id",
            "TournamentTeam.name",
            "TournamentTeam.seed",
            "TournamentTeam.prefersNotToHost",
            "TournamentTeam.noScreen",
            "TournamentTeam.droppedOut",
            "TournamentTeam.inviteCode",
            "TournamentTeam.createdAt",
            jsonArrayFrom(
              innerEb
                .selectFrom("TournamentTeamMember")
                .innerJoin("User", "TournamentTeamMember.userId", "User.id")
                .leftJoin("PlusTier", "User.id", "PlusTier.userId")
                .select([
                  "User.id as userId",
                  "User.discordName",
                  "User.discordId",
                  "User.discordAvatar",
                  "User.customUrl",
                  "User.inGameName",
                  "User.country",
                  "PlusTier.tier as plusTier",
                  "TournamentTeamMember.isOwner",
                  "TournamentTeamMember.createdAt",
                ])
                .whereRef(
                  "TournamentTeamMember.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                )
                .orderBy("TournamentTeamMember.createdAt asc"),
            ).as("members"),
            jsonArrayFrom(
              innerEb
                .selectFrom("TournamentTeamCheckIn")
                .select([
                  "TournamentTeamCheckIn.bracketIdx",
                  "TournamentTeamCheckIn.checkedInAt",
                ])
                .whereRef(
                  "TournamentTeamCheckIn.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                ),
            ).as("checkIns"),
            jsonArrayFrom(
              innerEb
                .selectFrom("MapPoolMap")
                .whereRef(
                  "MapPoolMap.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                )
                .select(["MapPoolMap.stageId", "MapPoolMap.mode"]),
            ).as("mapPool"),
            jsonObjectFrom(
              innerEb
                .selectFrom("AllTeam")
                .leftJoin(
                  "UserSubmittedImage",
                  "AllTeam.avatarImgId",
                  "UserSubmittedImage.id",
                )
                .whereRef("AllTeam.id", "=", "TournamentTeam.teamId")
                .select([
                  "AllTeam.customUrl",
                  "UserSubmittedImage.url as logoUrl",
                  "AllTeam.deletedAt",
                ]),
            ).as("team"),
          ])
          .where("TournamentTeam.tournamentId", "=", id)
          .orderBy(["TournamentTeam.seed asc", "TournamentTeam.createdAt asc"]),
      ).as("teams"),
      jsonArrayFrom(
        eb
          .selectFrom("MapPoolMap")
          .select(["MapPoolMap.stageId", "MapPoolMap.mode"])
          .whereRef(
            "MapPoolMap.tieBreakerCalendarEventId",
            "=",
            "CalendarEvent.id",
          ),
      ).as("tieBreakerMapPool"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStage")
          .innerJoin(
            "TournamentMatch",
            "TournamentMatch.stageId",
            "TournamentStage.id",
          )
          .innerJoin(
            "TournamentMatchGameResult",
            "TournamentMatch.id",
            "TournamentMatchGameResult.matchId",
          )
          .innerJoin(
            "TournamentMatchGameResultParticipant",
            "TournamentMatchGameResult.id",
            "TournamentMatchGameResultParticipant.matchGameResultId",
          )
          .select("TournamentMatchGameResultParticipant.userId")
          .groupBy("TournamentMatchGameResultParticipant.userId")
          .where("TournamentStage.tournamentId", "=", id),
      ).as("participatedUsers"),
    ])
    .where("Tournament.id", "=", id)
    .$narrowType<{ author: NotNull }>()
    .executeTakeFirst();

  if (!result) return null;

  return {
    ...result,
    participatedUsers: result.participatedUsers.map((user) => user.userId),
  };
}

export async function findTOSetMapPoolById(tournamentId: number) {
  return (
    await db
      .selectFrom("CalendarEvent")
      .innerJoin("MapPoolMap", "CalendarEvent.id", "MapPoolMap.calendarEventId")
      .select(["MapPoolMap.mode", "MapPoolMap.stageId"])
      .where("CalendarEvent.tournamentId", "=", tournamentId)
      .execute()
  ).sort((a, b) => {
    const modeAIndexOf = modesShort.indexOf(a.mode);
    const modeBIndexOf = modesShort.indexOf(b.mode);

    if (modeAIndexOf < modeBIndexOf) return -1;
    if (modeAIndexOf > modeBIndexOf) return 1;

    return a.stageId - b.stageId;
  });
}

const NEXT_TOURNAMENTS_TO_SHOW_WITH_UPCOMING = 2;
export async function forShowcase() {
  const rows = await db
    .selectFrom("Tournament")
    .innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .select((eb) => [
      "Tournament.id",
      "CalendarEvent.name",
      "CalendarEventDate.startTime",
      jsonArrayFrom(
        eb
          .selectFrom("TournamentResult")
          .innerJoin("User", "TournamentResult.userId", "User.id")
          .innerJoin(
            "TournamentTeam",
            "TournamentResult.tournamentTeamId",
            "TournamentTeam.id",
          )
          .whereRef("TournamentResult.tournamentId", "=", "Tournament.id")
          .where("TournamentResult.placement", "=", 1)
          .select([
            "User.id",
            "User.discordName",
            "TournamentTeam.name as teamName",
          ]),
      ).as("firstPlacers"),
    ])
    .orderBy("CalendarEventDate.startTime desc")
    .execute();

  const latestWinners = rows.find((r) => r.firstPlacers.length > 0);
  const next: typeof rows = [];

  const nextTournamentsCount = latestWinners
    ? NEXT_TOURNAMENTS_TO_SHOW_WITH_UPCOMING
    : NEXT_TOURNAMENTS_TO_SHOW_WITH_UPCOMING + 1;

  for (const row of rows) {
    if (row.id === latestWinners?.id) break;

    // if they did not finalize the tournament for whatever reason, lets just stop showing it after 6 hours
    if (
      new Date() > add(databaseTimestampToDate(row.startTime), { hours: 6 })
    ) {
      continue;
    }
    next.unshift(row);

    if (next.length > nextTournamentsCount) next.pop();
  }

  return [latestWinners, ...next].filter(Boolean);
}

export async function findCastTwitchAccountsByTournamentId(
  tournamentId: number,
) {
  const result = await db
    .selectFrom("Tournament")
    .select("castTwitchAccounts")
    .where("id", "=", tournamentId)
    .executeTakeFirst();

  if (!result) return null;

  return result.castTwitchAccounts;
}

export function checkedInTournamentTeamsByBracket({
  tournamentId,
  bracketIdx,
}: {
  tournamentId: number;
  bracketIdx: number;
}) {
  return db
    .selectFrom("TournamentTeamCheckIn")
    .innerJoin(
      "TournamentTeam",
      "TournamentTeamCheckIn.tournamentTeamId",
      "TournamentTeam.id",
    )
    .select(["TournamentTeamCheckIn.tournamentTeamId"])
    .where("TournamentTeamCheckIn.bracketIdx", "=", bracketIdx)
    .where("TournamentTeam.tournamentId", "=", tournamentId)
    .execute();
}

export async function friendCodesByTournamentId(tournamentId: number) {
  const values = await db
    .selectFrom("TournamentTeam")
    .innerJoin(
      "TournamentTeamMember",
      "TournamentTeam.id",
      "TournamentTeamMember.tournamentTeamId",
    )
    .innerJoin(
      "UserFriendCode",
      "TournamentTeamMember.userId",
      "UserFriendCode.userId",
    )
    .select(["TournamentTeamMember.userId", "UserFriendCode.friendCode"])
    .orderBy("UserFriendCode.createdAt asc")
    .where("TournamentTeam.tournamentId", "=", tournamentId)
    .execute();

  // later friend code overwrites earlier ones
  return values.reduce(
    (acc, cur) => {
      acc[cur.userId] = cur.friendCode;
      return acc;
    },
    {} as Record<number, string>,
  );
}

export function checkIn({
  tournamentTeamId,
  bracketIdx,
}: {
  tournamentTeamId: number;
  bracketIdx: number | null;
}) {
  return db
    .insertInto("TournamentTeamCheckIn")
    .values({
      checkedInAt: dateToDatabaseTimestamp(new Date()),
      tournamentTeamId,
      bracketIdx,
    })
    .execute();
}

export function checkOut({
  tournamentTeamId,
  bracketIdx,
}: {
  tournamentTeamId: number;
  bracketIdx: number | null;
}) {
  let query = db
    .deleteFrom("TournamentTeamCheckIn")
    .where("TournamentTeamCheckIn.tournamentTeamId", "=", tournamentTeamId);

  if (typeof bracketIdx === "number") {
    query = query.where("TournamentTeamCheckIn.bracketIdx", "=", bracketIdx);
  }

  return query.execute();
}

export function updateTeamName({
  tournamentTeamId,
  name,
}: {
  tournamentTeamId: number;
  name: string;
}) {
  return db
    .updateTable("TournamentTeam")
    .set({
      name,
    })
    .where("id", "=", tournamentTeamId)
    .execute();
}

export function dropTeamOut({
  tournamentTeamId,
  previewBracketIdxs,
}: {
  tournamentTeamId: number;
  previewBracketIdxs: number[];
}) {
  return db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("TournamentTeamCheckIn")
      .where("tournamentTeamId", "=", tournamentTeamId)
      .where("TournamentTeamCheckIn.bracketIdx", "in", previewBracketIdxs)
      .execute();

    await trx
      .updateTable("TournamentTeam")
      .set({
        droppedOut: 1,
      })
      .where("id", "=", tournamentTeamId)
      .execute();
  });
}

export function undoDropTeamOut(tournamentTeamId: number) {
  return db
    .updateTable("TournamentTeam")
    .set({
      droppedOut: 0,
    })
    .where("id", "=", tournamentTeamId)
    .execute();
}

export function addStaff({
  tournamentId,
  userId,
  role,
}: {
  tournamentId: number;
  userId: number;
  role: Tables["TournamentStaff"]["role"];
}) {
  return db
    .insertInto("TournamentStaff")
    .values({
      tournamentId,
      userId,
      role,
    })
    .execute();
}

export function removeStaff({
  tournamentId,
  userId,
}: {
  tournamentId: number;
  userId: number;
}) {
  return db
    .deleteFrom("TournamentStaff")
    .where("tournamentId", "=", tournamentId)
    .where("userId", "=", userId)
    .execute();
}

export function updateCastTwitchAccounts({
  tournamentId,
  castTwitchAccounts,
}: {
  tournamentId: number;
  castTwitchAccounts: string[];
}) {
  return db
    .updateTable("Tournament")
    .set({
      castTwitchAccounts: JSON.stringify(castTwitchAccounts),
    })
    .where("id", "=", tournamentId)
    .execute();
}

const castedMatchesInfoByTournamentId = async (
  trx: Transaction<DB>,
  tournamentId: number,
) =>
  (
    await trx
      .selectFrom("Tournament")
      .select("castedMatchesInfo")
      .where("id", "=", tournamentId)
      .executeTakeFirstOrThrow()
  ).castedMatchesInfo ??
  ({
    castedMatches: [],
    lockedMatches: [],
  } as CastedMatchesInfo);

export function lockMatch({
  matchId,
  tournamentId,
}: {
  matchId: number;
  tournamentId: number;
}) {
  return db.transaction().execute(async (trx) => {
    const castedMatchesInfo = await castedMatchesInfoByTournamentId(
      trx,
      tournamentId,
    );

    if (!castedMatchesInfo.lockedMatches.includes(matchId)) {
      castedMatchesInfo.lockedMatches.push(matchId);
    }

    await trx
      .updateTable("Tournament")
      .set({
        castedMatchesInfo: JSON.stringify(castedMatchesInfo),
      })
      .where("id", "=", tournamentId)
      .execute();
  });
}

export function unlockMatch({
  matchId,
  tournamentId,
}: {
  matchId: number;
  tournamentId: number;
}) {
  return db.transaction().execute(async (trx) => {
    const castedMatchesInfo = await castedMatchesInfoByTournamentId(
      trx,
      tournamentId,
    );

    castedMatchesInfo.lockedMatches = castedMatchesInfo.lockedMatches.filter(
      (lockedMatchId) => lockedMatchId !== matchId,
    );

    await trx
      .updateTable("Tournament")
      .set({
        castedMatchesInfo: JSON.stringify(castedMatchesInfo),
      })
      .where("id", "=", tournamentId)
      .execute();
  });
}

export function setMatchAsCasted({
  matchId,
  tournamentId,
  twitchAccount,
}: {
  matchId: number;
  tournamentId: number;
  twitchAccount: string | null;
}) {
  return db.transaction().execute(async (trx) => {
    const castedMatchesInfo = await castedMatchesInfoByTournamentId(
      trx,
      tournamentId,
    );

    let newCastedMatchesInfo: CastedMatchesInfo;
    if (twitchAccount === null) {
      newCastedMatchesInfo = {
        ...castedMatchesInfo,
        castedMatches: castedMatchesInfo.castedMatches.filter(
          (cm) => cm.matchId !== matchId,
        ),
      };
    } else {
      newCastedMatchesInfo = {
        ...castedMatchesInfo,
        castedMatches: castedMatchesInfo.castedMatches
          .filter(
            (cm) =>
              // currently a match can only  be streamed by one account
              // and a cast can only stream one match at a time
              // these can change in the future
              cm.matchId !== matchId && cm.twitchAccount !== twitchAccount,
          )
          .concat([{ twitchAccount, matchId }]),
      };
    }

    await trx
      .updateTable("Tournament")
      .set({
        castedMatchesInfo: JSON.stringify(newCastedMatchesInfo),
      })
      .where("id", "=", tournamentId)
      .execute();
  });
}

export function pickBanEventsByMatchId(matchId: number) {
  return db
    .selectFrom("TournamentMatchPickBanEvent")
    .select([
      "TournamentMatchPickBanEvent.mode",
      "TournamentMatchPickBanEvent.stageId",
      "TournamentMatchPickBanEvent.type",
      "TournamentMatchPickBanEvent.number",
    ])
    .where("matchId", "=", matchId)
    .orderBy("TournamentMatchPickBanEvent.number asc")
    .execute();
}

export function addPickBanEvent(
  values: Insertable<DB["TournamentMatchPickBanEvent"]>,
) {
  return db.insertInto("TournamentMatchPickBanEvent").values(values).execute();
}

export function resetBracket(tournamentStageId: number) {
  return db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("TournamentMatch")
      .where("stageId", "=", tournamentStageId)
      .execute();

    await trx
      .deleteFrom("TournamentRound")
      .where("stageId", "=", tournamentStageId)
      .execute();

    await trx
      .deleteFrom("TournamentGroup")
      .where("stageId", "=", tournamentStageId)
      .execute();

    await trx
      .deleteFrom("TournamentStage")
      .where("id", "=", tournamentStageId)
      .execute();
  });
}

export type TournamentRepositoryInsertableMatch = Omit<
  Insertable<DB["TournamentMatch"]>,
  "status" | "bestOf" | "chatCode"
>;

export function insertSwissMatches(
  matches: TournamentRepositoryInsertableMatch[],
) {
  if (matches.length === 0) {
    throw new Error("No matches to insert");
  }

  return db
    .insertInto("TournamentMatch")
    .values(
      matches.map((match) => ({
        groupId: match.groupId,
        number: match.number,
        opponentOne: match.opponentOne,
        opponentTwo: match.opponentTwo,
        roundId: match.roundId,
        stageId: match.stageId,
        status: Status.Ready,
        createdAt: dateToDatabaseTimestamp(new Date()),
        chatCode: nanoid(10),
      })),
    )
    .execute();
}

export function deleteSwissMatches({
  groupId,
  roundId,
}: {
  groupId: number;
  roundId: number;
}) {
  return db
    .deleteFrom("TournamentMatch")
    .where("groupId", "=", groupId)
    .where("roundId", "=", roundId)
    .execute();
}
