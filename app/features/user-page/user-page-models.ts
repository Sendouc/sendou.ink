import * as Schema from "@effect/schema/Schema";
import { HashSet } from "effect";
import { Id, WeaponSplId } from "~/shared/models";

// xxx: clean up, username / avatarUrl / pageUrl etc.
export class User extends Schema.Class<User>("@schema/User")({
  id: Id.pipe(Schema.brand("@schema/UserId")),
  discordName: Schema.String,
  discordId: Schema.String,
  discordAvatar: Schema.OptionFromNullOr(Schema.String),
  customUrl: Schema.OptionFromNullOr(Schema.String),
}) {
  get username() {
    return this.discordName;
  }

  // get avatarUrl()
  // get pageUrl()
}

export class DetailedUser extends Schema.Class<User>("@schema/DetailedUser")({
  weaponPool: Schema.Array(
    Schema.Struct({
      weaponSplId: WeaponSplId,
      isFavorite: Schema.BooleanFromUnknown,
    }),
  ),
}) {}

// const Banned = Schema.transform(
//   Schema.Union(Schema.Number, Schema.Null),
//   Schema.Union(Schema.Boolean, Schema.Date),
//   {
//     decode: (n) =>
//       n === 0 || n === null
//         ? false
//         : n === 1
//           ? true
//           : databaseTimestampToDate(n).toISOString(),
//     encode: (v) =>
//       v === false ? 0 : v === true ? 1 : dateToDatabaseTimestamp(new Date(v)),
//   },
// );

const Perm = Schema.Literal(
  "Admin",
  "GlobalMod",
  "Artist",
  "Vodder",
  "TournamentCreator",
);
export class AuthUser extends User.extend<AuthUser>("@schema/AuthUser")({
  perms: Schema.HashSet(Perm),
  // weaponPool: WeaponPool,
  // role
}) {
  hasPerm(perm: (typeof Perm.literals)[number]) {
    return HashSet.has(this.perms, perm);
  }
}
