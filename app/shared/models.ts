import * as Schema from "@effect/schema/Schema";

export const Id = Schema.Number.pipe(Schema.int());

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

export const PlusTier = Schema.Literal(1, 2, 3);

// xxx: WeaponSplId -> user page
export const WeaponSplId = Schema.Number;
export const WeaponPool = Schema.Array(WeaponSplId);

// xxx: SkillTier
export const SkillTier = Schema.Struct({
  tier: Schema.Literal("LEVIATHAN", "DIAMOND"),
  plus: Schema.Boolean,
});
