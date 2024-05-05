// import * as Schema from "@effect/schema/Schema";

// const Id = S.Number.pipe(S.int());

// class User extends S.Class<User>("@schema/User")({
//   id: Id.pipe(S.brand("@schema/UserId")),
//   discordName: S.String,
//   discordId: S.String,
//   discordAvatar: S.optional(S.String),
//   customUrl: S.optional(S.String),
// }) {
//   get username() {
//     return this.discordName;
//   }

//   // get avatarUrl()
//   // get pageUrl()
// }

// // xxx:WeaponSplId
// const WeaponSplId = S.Number;

// // xxx: SkillTier
// const SkillTier = S.Struct({
//   tier: S.Literal("LEVIATHAN", "DIAMOND"),
//   plus: S.Boolean,
// });

// class LFPostUser extends User.extend<LFPostUser>("@schema/LFPostUser")({
//   weaponPool: S.Array(WeaponSplId),
//   seasonalSkillTiers: S.Array(
//     S.Struct({
//       tier: SkillTier,
//       season: S.Number,
//     }),
//   ),
//   plusTier: S.optional(S.Literal(1, 2, 3)),
//   country: S.String,
//   languages: S.Array(S.String),
// }) {}

// const commonFields = {
//   id: Id.pipe(S.brand("@schema/LFGPostId")),
//   text: S.Trim,
//   author: LFPostUser,
//   timezone: S.String,
//   createdAt: S.DateFromString,
//   updatedAt: S.DateFromString,
// };

// class LFTeamPost extends S.TaggedClass<LFTeamPost>()("@schema/LFTeamPost", {
//   ...commonFields,
// }) {}

// class LFPlayerPost extends S.TaggedClass<LFPlayerPost>()(
//   "@schema/LFPlayerPost",
//   {
//     ...commonFields,
//     mates: S.Array(LFPostUser),
//   },
// ) {}

// class LFCoachPost extends S.TaggedClass<LFCoachPost>()("@schema/LFCoachPost", {
//   ...commonFields,
// }) {}

// class LFCoacheePost extends S.TaggedClass<LFCoacheePost>()(
//   "@schema/LFCoacheePost",
//   {
//     ...commonFields,
//   },
// ) {}

// type LFPost = LFPlayerPost | LFTeamPost | LFCoachPost | LFCoacheePost;
