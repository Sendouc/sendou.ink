import * as Schema from "@effect/schema/Schema";
import { Id, PlusTier, User } from "~/shared/models";

export class TeamUser extends User.extend<TeamUser>("@schema/TeamUser")({
  plusTier: Schema.OptionFromNullOr(PlusTier),
  // weaponPool: WeaponPool,
  // role
}) {}

export class Team extends Schema.TaggedClass<Team>()("@schema/Team", {
  id: Id.pipe(Schema.brand("@schema/TeamId")),
  name: Schema.String,
  url: Schema.String,
  avatarUrl: Schema.OptionFromNullOr(Schema.String),
  members: Schema.Array(TeamUser),
}) {}
