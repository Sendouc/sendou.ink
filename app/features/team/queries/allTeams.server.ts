import { sql } from "~/db/sql";
import type { Team, UserWithPlusTier } from "~/db/types";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  select
    "Team"."customUrl",
    "Team"."name",
    "ia"."url" as "avatarSrc",
    json_group_array(
      json_object(
        'id',
        "User"."id",
        'username',
        "User"."username",
        'plusTier',
        "PlusTier"."tier"
      )
    ) as "members"
  from "Team"
    left join "UserSubmittedImage" as "ia" on "avatarImgId" = "ia"."id"
    left join "TeamMember" on "TeamMember"."teamId" = "Team"."id"
    left join "User" on "User"."id" = "TeamMember"."userId"
    left join "PlusTier" on "PlusTier"."userId" = "User"."id"
  group by "Team"."id"
`);

export type AllTeams = Array<
	Pick<Team, "customUrl" | "name"> & {
		avatarSrc?: string;
		members: Pick<UserWithPlusTier, "id" | "plusTier" | "username">[];
	}
>;

export function allTeams(): AllTeams {
	const rows = stm.all() as any[];

	return rows.map((row) => {
		return {
			...row,
			members: parseDBArray(row.members),
		};
	});
}
