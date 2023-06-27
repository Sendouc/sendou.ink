import { sql } from "~/db/sql";
import {
  LEADERBOARD_MAX_SIZE,
  MATCHES_COUNT_NEEDED_FOR_LEADERBOARD,
} from "../leaderboards-constants";
import type { Team, User, UserSubmittedImage } from "~/db/types";
import { ordinalToSp } from "~/features/mmr";
import { parseDBJsonArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  select
    "Skill"."id" as "entryId",
    "Skill"."ordinal",
    rank () over ( 
      order by "Skill"."Ordinal" desc
    ) "placementRank",
    json_group_array(
      json_object(
        'id',
        "User"."id",
        'discordName',
        "User"."discordName",
        'discordAvatar',
        "User"."discordAvatar",
        'discordDiscriminator',
        "User"."discordDiscriminator",
        'discordId',
        "User"."discordId",
        'customUrl',
        "User"."customUrl"
      )
    ) as "members",
    json_group_array(
      json_object(
        'name',
        "Team"."name",
        'avatarImgUrl',
        "UserSubmittedImage"."url",
        'customUrl',
        "Team"."customUrl"
      )
    ) as "teams"
  from 
    "Skill"
    inner join "SkillTeamUser" on "SkillTeamUser"."skillId" = "Skill"."id"
    left join "User" on "User"."id" = "SkillTeamUser"."userId"
    left join "TeamMember" on "TeamMember"."userId" = "User"."id"
    left join "Team" on "Team"."id" = "TeamMember"."teamId"
    left join "UserSubmittedImage" on "UserSubmittedImage"."id" = "Team"."avatarImgId"
    inner join (
      select "identifier", max("id") as "maxId"
      from "Skill"
      group by "identifier"
    ) "Latest" on "Skill"."identifier" = "Latest"."identifier" and "Skill"."id" = "Latest"."maxId"
  where
    "Skill"."matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
  group by
    "Skill"."identifier"
  order by
    "Skill"."ordinal" desc
  limit
    ${LEADERBOARD_MAX_SIZE}
`);

export interface TeamSPLeaderboardItem {
  entryId: number;
  power: number;
  members: Array<{
    id: User["id"];
    discordName: User["discordName"];
    discordAvatar: User["discordAvatar"];
    discordDiscriminator: User["discordDiscriminator"];
    discordId: User["discordId"];
    customUrl: User["customUrl"];
    teamId: Team["id"];
    teamName: Team["name"];
    teamAvatarImgUrl: UserSubmittedImage["url"];
    teamCustomUrl: Team["customUrl"];
  }>;
  team?: {
    name: Team["name"];
    avatarImgUrl: UserSubmittedImage["url"];
    customUrl: Team["customUrl"];
  };
  placementRank: number;
}

export function teamSPLeaderboard(): TeamSPLeaderboardItem[] {
  return (stm.all() as any[]).map(({ ordinal, members, teams, ...rest }) => {
    const parsedTeams = parseDBJsonArray(teams);
    const sharesSameTeam =
      parsedTeams.length === 4 &&
      parsedTeams.every((team: any) => team.id === parsedTeams[0].id);

    return {
      ...rest,
      power: ordinalToSp(ordinal),
      members: parseDBJsonArray(members),
      team: sharesSameTeam ? parsedTeams[0] : undefined,
    };
  });
}
