import { CamelCasedProperties } from "type-fest";
import { sql } from "../sqlite3";
import { TournamentTeam, TournamentTeamMember, User } from "../types";

const createTournamentTeamStm = sql.prepare(`
  INSERT INTO
    tournament_teams (
      name,
      tournament_id
    )
    VALUES (
      $name,
      $tournament_id
    )
`);

const createTournamentTeamMemberStm = sql.prepare(`
  INSERT INTO
    tournament_team_members (
      member_id,
      team_id,
      is_captain
    )
    VALUES (
      $member_id,
      $team_id,
      $is_captain
    )
`);

export const create = sql.transaction(
  (
    input: Pick<TournamentTeam, "name" | "tournament_id"> & {
      members: Pick<TournamentTeamMember, "member_id" | "is_captain">[];
    }
  ) => {
    const { members, ...createTournamentTeamsArgs } = input;
    const info = createTournamentTeamStm.run(createTournamentTeamsArgs);

    for (const member of members) {
      createTournamentTeamMemberStm.run({
        ...member,
        tournament_id: createTournamentTeamsArgs.tournament_id,
        team_id: info.lastInsertRowid,
      });
    }
  }
);

const countStm = sql.prepare(`
  SELECT COUNT(*) as count 
    FROM tournament_teams 
    WHERE tournament_id = $tournament_id
`);

export const countByTournamentId = (tournament_id: number) => {
  return (countStm.get({ tournament_id }) as { count: number }).count;
};

const findManyByTournamentIdStm = sql.prepare(`
  SELECT id, name, (
      SELECT json_group_array(
        json_object(
          'id', users.id, 
          'discordAvatar', users.discord_avatar,
          'discordId', users.discord_id,
          'discordName', users.discord_name,
          'isCaptain', tournament_team_members.is_captain
        )
      ) 
      FROM tournament_team_members
      JOIN users ON tournament_team_members.member_id = users.id
      WHERE tournament_team_members.team_id = tournament_teams.id
    ) as members
    FROM tournament_teams
    WHERE tournament_teams.tournament_id = $tournament_id
    ORDER BY created_at_timestamp DESC
`);

export type TournamentTeamFindManyByTournamentId = ReturnType<
  typeof findManyByTournamentId
>;
export function findManyByTournamentId(tournament_id: number) {
  const teams = findManyByTournamentIdStm.all({
    tournament_id,
  });

  return teams.map(
    (t) =>
      // eslint-disable-next-line
      ({ ...t, members: JSON.parse(t.members) } as Pick<
        TournamentTeam,
        "id" | "name"
      > & {
        members: CamelCasedProperties<
          Pick<User, "id" | "discord_avatar" | "discord_id" | "discord_name"> &
            Pick<TournamentTeamMember, "is_captain">
        >[];
      })
  );
}

const findByUserIdStm = sql.prepare(`
  SELECT tournament_teams.* FROM tournament_teams
    JOIN tournament_team_members ON tournament_teams.id = tournament_team_members.team_id
    WHERE tournament_teams.tournament_id = $tournament_id AND tournament_team_members.member_id = $user_id
`);

const findMembers = sql.prepare(`
  SELECT * FROM tournament_team_members
    JOIN users on tournament_team_members.member_id = users.id
    WHERE team_id = $team_id
`);

export type TournamentTeamFindByUserId = ReturnType<typeof findByUserId>;
export const findByUserId = (params: {
  tournament_id: number;
  user_id?: number;
}) => {
  if (!params.user_id) return;

  const team = findByUserIdStm.get(params) as TournamentTeam | undefined;
  if (!team) return;

  const members = findMembers.all({ team_id: team.id }) as Array<
    TournamentTeamMember & User
  >;

  return { ...team, members };
};
