import * as Schema from "@effect/schema/Schema";
import { Id, PlusTier } from "~/shared/models";
import { DetailedUser, User } from "../user-page/user-page-models";

export class TeamUser extends User.extend<TeamUser>("@schema/TeamUser")({
  plusTier: Schema.OptionFromNullOr(PlusTier),
}) {}

export class Team extends Schema.Class<Team>("@schema/Team")({
  id: Id.pipe(Schema.brand("@schema/TeamId")),
  name: Schema.String,
  url: Schema.String,
  avatarUrl: Schema.OptionFromNullOr(Schema.String),
  members: Schema.Array(TeamUser),
}) {}

export class DetailedTeamUser extends TeamUser.extend<DetailedTeamUser>(
  "@schema/DetailedTeamUser",
)({
  isOwner: Schema.BooleanFromUnknown,
  weaponPool: DetailedUser.fields.weaponPool,
  role: Schema.OptionFromNullOr(
    Schema.Literal(
      "CAPTAIN",
      "FRONTLINE",
      "SUPPORT",
      "MIDLINE",
      "BACKLINE",
      "FLEX",
      "COACH",
    ),
  ),
}) {}

export class DetailedTeam extends Schema.Class<Team>("@schema/DetailedTeam")({
  ...Team.fields,
  bannerUrl: Schema.OptionFromNullOr(Schema.String),
  bio: Schema.OptionFromNullOr(Schema.String),
  twitter: Schema.OptionFromNullOr(Schema.String),
  countries: Schema.HashSet(Schema.String),
  members: Schema.Array(DetailedTeamUser),
  customCssProperties: Schema.OptionFromNullOr(
    Schema.Record(Schema.String, Schema.String),
  ),
}) {}
