import { sql } from "../sqlite3";
import { TournamentTeam, TournamentTeamMember } from "../types";

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
  "SELECT COUNT(*) as count from tournament_teams WHERE tournament_id=$tournament_id"
);

export const countByTournamentId = (tournament_id: number) => {
  return (countStm.get({ tournament_id }) as { count: number }).count;
};
