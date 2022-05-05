import { SqliteError } from "better-sqlite3";
import { CamelCasedPropertiesDeep } from "type-fest";
import { SQLITE_UNIQUE_CONSTRAINT_ERROR_CODE } from "~/constants";
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

type CreateTournamentTeamInput = Pick<
  TournamentTeam,
  "name" | "tournament_id"
> & {
  members: Pick<TournamentTeamMember, "member_id" | "is_captain">[];
};
const createTransaction = sql.transaction(
  (input: CreateTournamentTeamInput) => {
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

export const create = (input: CreateTournamentTeamInput) => {
  try {
    createTransaction(input);
  } catch (e) {
    if (
      e instanceof SqliteError &&
      e.code === SQLITE_UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return { error: "DUPLICATE_TEAM_NAME" } as const;
    } else throw e;
  }

  return { ok: true };
};

const delStm = sql.prepare(`
  DELETE FROM tournament_teams
    WHERE id = $team_id
`);

export function del(team_id: number) {
  delStm.run({ team_id });
}

const joinTeamStm = sql.prepare(`
  INSERT INTO tournament_team_members
    (member_id, team_id)
  VALUES
    ($user_id, $team_id)
`);

export function joinTeam(input: { user_id: number; team_id: number }) {
  joinTeamStm.run(input);
}

const leaveTeamStm = sql.prepare(`
  DELETE FROM tournament_team_members
    WHERE member_id = $user_id AND team_id = $team_id
`);

export function leaveTeam(input: { user_id: number; team_id: number }) {
  leaveTeamStm.run(input);
}

const countStm = sql.prepare(`
  SELECT COUNT(*) as count 
    FROM tournament_teams 
    WHERE tournament_id = $tournament_id
`);

export const countByTournamentId = (tournament_id: number) => {
  return (countStm.get({ tournament_id }) as { count: number }).count;
};

const findManyByTournamentIdStm = sql.prepare(`
  SELECT id, name, checked_in_timestamp as checkedInTimestamp, (
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
      ({ ...t, members: JSON.parse(t.members) } as CamelCasedPropertiesDeep<
        Pick<TournamentTeam, "id" | "name" | "checked_in_timestamp"> & {
          members: (Pick<
            User,
            "id" | "discord_avatar" | "discord_id" | "discord_name"
          > &
            Pick<TournamentTeamMember, "is_captain">)[];
        }
      >)
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

// TODO: rename... findOwnTeam
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
