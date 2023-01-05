import { sql } from "~/db/sql";
import type { Team, TeamMember, User } from "~/db/types";
import { removeDuplicates } from "~/utils/arrays";
import type { DetailedTeam } from "../team-types";

const teamStm = sql.prepare(/*sql*/ `
  select 
    "t"."id",
    "t"."name",
    "t"."twitter",
    "t"."bio",
    "ia"."url" as "avatarSrc",
    "ib"."url" as "bannerSrc",
    json_group_array("User"."country") as "countries"
  from "Team" as "t"
    left join "UserSubmittedImage" as "ia" on "avatarImgId" = "ia"."id" and "ia"."validatedAt" is not null
    left join "UserSubmittedImage" as "ib" on "bannerImgId" = "ib"."id" and "ib"."validatedAt" is not null
    left join "TeamMember" on "TeamMember"."teamId" = "t"."id"
    left join "User" on "User"."id" = "TeamMember"."userId"
  where "t"."customUrl" = @customUrl
    and "t"."deletedAt" is null
  group by "t"."id"
`);

const membersStm = sql.prepare(/*sql*/ `
  select
    "User"."id",
    "User"."discordName",
    "User"."discordAvatar",
    "User"."discordId",
    "TeamMember"."role",
    "TeamMember"."isOwner",
    json_group_array("UserWeapon"."weaponSplId") as "weapons"
  from "TeamMember"
    join "User" on "User"."id" = "TeamMember"."userId"
    left join "UserWeapon" on "UserWeapon"."userId" = "User"."id"
  where "TeamMember"."teamId" = @teamId
  group by "User"."id"
`);

type TeamRow =
  | (Pick<Team, "id" | "name" | "twitter" | "bio"> & {
      avatarSrc: string;
      bannerSrc: string;
      countries: string;
    })
  | null;

type MemberRows = Array<
  Pick<User, "id" | "discordName" | "discordAvatar" | "discordId"> &
    Pick<TeamMember, "role" | "isOwner"> & { weapons: string }
>;

export function findByIdentifier(customUrl: string): DetailedTeam | null {
  const team = teamStm.get({ customUrl: customUrl.toLowerCase() }) as TeamRow;

  if (!team) return null;

  const members = membersStm.all({ teamId: team.id }) as MemberRows;

  return {
    id: team.id,
    name: team.name,
    twitter: team.twitter ?? undefined,
    bio: team.bio ?? undefined,
    avatarSrc: team.avatarSrc,
    bannerSrc: team.bannerSrc,
    countries: removeDuplicates(JSON.parse(team.countries).filter(Boolean)),
    members: members.map((member) => ({
      id: member.id,
      discordAvatar: member.discordAvatar,
      discordId: member.discordId,
      discordName: member.discordName,
      role: member.role ?? undefined,
      isOwner: Boolean(member.isOwner),
      weapons: JSON.parse(member.weapons).filter(Boolean),
    })),
    results: undefined,
    // results: {
    //   count: 23,
    //   placements: [
    //     {
    //       count: 10,
    //       placement: 1,
    //     },
    //     {
    //       count: 5,
    //       placement: 2,
    //     },
    //   ],
    // },
  };
}
