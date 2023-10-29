import { dbNew, sql } from "~/db/sql";
import { syncXPBadges } from "../badges";
import type { Tables } from "~/db/tables";
import { dateToDatabaseTimestamp } from "~/utils/dates";

const removeOldLikesStm = sql.prepare(/*sql*/ `
  delete from 
    "GroupLike"
    where 
      "GroupLike"."createdAt" < cast(strftime('%s', datetime('now', 'start of day', '-7 days')) as int)
`);

const removeOldGroupStm = sql.prepare(/*sql*/ `
  delete from
    "Group"
  where "Group"."id" in (
    select "Group"."id"
    from "Group"
    left join "GroupMatch" on "Group"."id" = "GroupMatch"."alphaGroupId" or "Group"."id" = "GroupMatch"."bravoGroupId"
      where "Group"."status" = 'INACTIVE'
        and "GroupMatch"."id" is null
  )
`);

const cleanUpStm = sql.prepare(/*sql*/ `
  vacuum
`);

export const cleanUp = () => {
  removeOldLikesStm.run();
  removeOldGroupStm.run();
  cleanUpStm.run();
};

export function migrate(args: { newUserId: number; oldUserId: number }) {
  return dbNew.transaction().execute(async (trx) => {
    const deletedUser = await trx
      .deleteFrom("User")
      .where("User.id", "=", args.newUserId)
      .returning("discordId")
      .executeTakeFirstOrThrow();

    await trx
      .updateTable("User")
      .set({ discordId: deletedUser.discordId })
      .where("User.id", "=", args.oldUserId)
      .execute();
  });
}

export function refreshPlusTiers() {
  return dbNew.transaction().execute(async (trx) => {
    await trx.deleteFrom("PlusTier").execute();

    await trx
      .insertInto("PlusTier")
      .columns(["userId", "tier"])
      .expression((eb) =>
        eb
          .selectFrom("FreshPlusTier")
          .select(["FreshPlusTier.userId", "FreshPlusTier.tier"])
          .where("FreshPlusTier.tier", "is not", null),
      )
      .execute();
  });
}

export function makeVideoAdderByUserId(userId: number) {
  return dbNew
    .updateTable("User")
    .set({ isVideoAdder: 1 })
    .where("User.id", "=", userId)
    .execute();
}

export async function linkUserAndPlayer({
  userId,
  playerId,
}: {
  userId: number;
  playerId: number;
}) {
  await dbNew
    .updateTable("SplatoonPlayer")
    .set({ userId: null })
    .where("SplatoonPlayer.userId", "=", userId)
    .execute();

  await dbNew
    .updateTable("SplatoonPlayer")
    .set({ userId })
    .where("SplatoonPlayer.id", "=", playerId)
    .execute();

  syncXPBadges();
}

export function forcePatron(args: {
  id: number;
  patronTier: Tables["User"]["patronTier"];
  patronSince: Date;
  patronTill: Date;
}) {
  return dbNew
    .updateTable("User")
    .set({
      patronTier: args.patronTier,
      patronSince: dateToDatabaseTimestamp(args.patronSince),
      patronTill: dateToDatabaseTimestamp(args.patronTill),
    })
    .where("User.id", "=", args.id)
    .execute();
}
