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
      tournament_id,
      is_captain
    )
    VALUES (
      $member_id,
      $team_id,
      $tournament_id,
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

const countStm = sql.prepare(
  "SELECT COUNT(*) as count FROM tournament_teams WHERE tournament_id=$tournament_id"
);

export const countByTournamentId = (tournament_id: number) => {
  return (countStm.get({ tournament_id }) as { count: number }).count;
};

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
