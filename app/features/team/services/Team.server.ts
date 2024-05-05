import * as Schema from "@effect/schema/Schema";
import { Effect, Layer } from "effect";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { teamPage, userSubmittedImage } from "~/utils/urls";
import { Team } from "../t-models";

export const make = Effect.gen(function* () {
  const all = yield* Effect.gen(function* () {
    // xxx: kysely module to return nonempty array and update t-models
    const rows = yield* Effect.promise(() =>
      db
        .selectFrom("Team")
        .innerJoin(
          "UserSubmittedImage",
          "Team.avatarImgId",
          "UserSubmittedImage.id",
        )
        .select(({ eb }) => [
          "Team.id",
          "Team.name",
          "Team.customUrl",
          "UserSubmittedImage.url as avatarUrl",
          jsonArrayFrom(
            eb
              .selectFrom("TeamMember")
              .innerJoin("User", "TeamMember.userId", "User.id")
              .leftJoin("PlusTier", "User.id", "PlusTier.userId")
              // xxx: kysely module?
              .select([...COMMON_USER_FIELDS, "PlusTier.tier as plusTier"])
              .whereRef("TeamMember.teamId", "=", "Team.id"),
          ).as("members"),
        ])
        .execute(),
    );

    return rows.map((row) => {
      return Schema.decodeSync(Team)({
        ...row,
        _tag: "@schema/Team",
        url: teamPage(row.customUrl),
        avatarUrl: row.avatarUrl ? userSubmittedImage(row.avatarUrl) : null,
        members: row.members.map((m) => ({
          ...m,
          plusTier: m.plusTier as 1 | 2 | 3 | null,
        })),
      });
    });
  });

  return {
    all,
  };
});

export class Teams extends Effect.Tag("@services/Teams")<
  Teams,
  Effect.Effect.Success<typeof make>
>() {
  static live = Layer.effect(this, make);
  static layer = this.live;
}
