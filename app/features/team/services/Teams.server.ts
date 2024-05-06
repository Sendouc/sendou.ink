import * as Schema from "@effect/schema/Schema";
import { Effect, HashSet, Layer, pipe } from "effect";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { teamPage, userSubmittedImage } from "~/utils/urls";
import { DetailedTeam, DetailedTeamUser, Team } from "../t-models";
import { Kysely } from "~/shared/prelude.server";

const service = {
  all: Effect.gen(function* () {
    const rows = yield* Kysely.executeTakeMany(
      db
        .selectFrom("Team")
        .leftJoin(
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
        .compile(),
    );

    return rows.map((row) => {
      return Schema.decodeSync(Team)({
        ...row,
        url: teamPage(row.customUrl),
        avatarUrl: row.avatarUrl ? userSubmittedImage(row.avatarUrl) : null,
        members: row.members.map((m) => ({
          ...m,
          plusTier: m.plusTier as 1 | 2 | 3 | null,
        })),
      });
    });
  }),
  // findDetailedById: (id: Team["id"]) =>
  //   pipe(
  //     Kysely.executeTakeOne(
  //       db
  //         .selectFrom("Team")
  //         .leftJoin(
  //           "UserSubmittedImage",
  //           "Team.avatarImgId",
  //           "UserSubmittedImage.id",
  //         )
  //         .select(({ eb }) => [
  //           "Team.id",
  //           "Team.name",
  //           "Team.customUrl",
  //           "Team.bio",
  //           "Team.twitter",
  //           "UserSubmittedImage.url as avatarUrl",
  //           jsonArrayFrom(
  //             eb
  //               .selectFrom("TeamMember")
  //               .innerJoin("User", "TeamMember.userId", "User.id")
  //               .leftJoin("PlusTier", "User.id", "PlusTier.userId")
  //               // xxx: kysely module?
  //               .select(({ eb }) => [
  //                 ...COMMON_USER_FIELDS,
  //                 "PlusTier.tier as plusTier",
  //                 "TeamMember.isOwner",
  //                 "TeamMember.role",
  //                 jsonArrayFrom(
  //                   eb
  //                     .selectFrom("UserWeapon")
  //                     .select([
  //                       "UserWeapon.weaponSplId",
  //                       "UserWeapon.isFavorite",
  //                     ])
  //                     .whereRef("UserWeapon.userId", "=", "User.id"),
  //                 ).as("weaponPool"),
  //               ])
  //               .whereRef("TeamMember.teamId", "=", "Team.id"),
  //           ).as("members"),
  //         ])
  //         .where("Team.id", "=", id)
  //         .compile(),
  //     ),
  //     Effect.flatMap((row) => ({
  //       ...row,
  //       url: teamPage(row.customUrl),
  //       avatarUrl: row.avatarUrl ? userSubmittedImage(row.avatarUrl) : null,
  //       bannerUrl: null,
  //       customCssProperties: null,
  //       countries: [],
  //       members: row.members.map((member) => ({
  //         ...member,
  //         plusTier: member.plusTier as 1 | 2 | 3 | null,
  //         role: member.role as Schema.Schema.Encoded<DetailedTeamUser["role"]>,
  //       })),
  //     })),
  //     Schema.decodeSync(DetailedTeam),
  //   ),
  // findDetailedById: (id: Team["id"]) =>
  //   Effect.gen(function* () {
  //     const row = Kysely.executeTakeOne(
  //       db
  //         .selectFrom("Team")
  //         .leftJoin(
  //           "UserSubmittedImage",
  //           "Team.avatarImgId",
  //           "UserSubmittedImage.id",
  //         )
  //         .select(({ eb }) => [
  //           "Team.id",
  //           "Team.name",
  //           "Team.customUrl",
  //           "Team.bio",
  //           "Team.twitter",
  //           "UserSubmittedImage.url as avatarUrl",
  //           jsonArrayFrom(
  //             eb
  //               .selectFrom("TeamMember")
  //               .innerJoin("User", "TeamMember.userId", "User.id")
  //               .leftJoin("PlusTier", "User.id", "PlusTier.userId")
  //               // xxx: kysely module?
  //               .select(({ eb }) => [
  //                 ...COMMON_USER_FIELDS,
  //                 "PlusTier.tier as plusTier",
  //                 "TeamMember.isOwner",
  //                 "TeamMember.role",
  //                 jsonArrayFrom(
  //                   eb
  //                     .selectFrom("UserWeapon")
  //                     .select([
  //                       "UserWeapon.weaponSplId",
  //                       "UserWeapon.isFavorite",
  //                     ])
  //                     .whereRef("UserWeapon.userId", "=", "User.id"),
  //                 ).as("weaponPool"),
  //               ])
  //               .whereRef("TeamMember.teamId", "=", "Team.id"),
  //           ).as("members"),
  //         ])
  //         .where("Team.id", "=", id)
  //         .compile(),
  //     );

  //     const rowed = yield* row;

  //     return Schema.decodeSync(DetailedTeam)({
  //       ...rowed,
  //       url: teamPage(rowed.customUrl),
  //       avatarUrl: rowed.avatarUrl ? userSubmittedImage(rowed.avatarUrl) : null,
  //       bannerUrl: null,
  //       customCssProperties: null,
  //       countries: [],
  //       members: rowed.members.map((member) => ({
  //         ...member,
  //         plusTier: member.plusTier as 1 | 2 | 3 | null,
  //         role: member.role as Schema.Schema.Encoded<DetailedTeamUser["role"]>,
  //       })),
  //     });
  //   }),
};

export class Teams extends Effect.Tag("@services/Teams")<
  Teams,
  typeof service
>() {
  static live = Layer.succeed(this, service);
  static layer = this.live;
}
