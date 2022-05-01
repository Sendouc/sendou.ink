import { sql } from "../sqlite3";
import type { Tournament, TournamentBracket } from "../types";

const createTournamentStm = sql.prepare(`
  INSERT INTO
    tournaments (
      name,
      name_for_url,
      description,
      start_time_timestamp,
      check_in_start_timestamp,
      banner_background,
      banner_text_hsl_args,
      organizer_id
    )
    VALUES (
      $name,
      $name_for_url,
      $description,
      $start_time_timestamp,
      $check_in_start_timestamp,
      $banner_background,
      $banner_text_hsl_args,
      $organizer_id
    )
`);

const createTournamentBracketStm = sql.prepare(`
  INSERT INTO
    tournament_brackets (
      type,
      tournament_id
    )
    VALUES (
      $type,
      $tournament_id
    )
`);

export const create = sql.transaction(
  (
    input: Omit<
      Tournament,
      "id" | "banner_text_color" | "banner_text_color_transparent"
    > & { bracket: Pick<TournamentBracket, "type"> }
  ) => {
    const { bracket, ...createTournamentArgs } = input;
    const info = createTournamentStm.run(createTournamentArgs);
    createTournamentBracketStm.run({
      ...bracket,
      tournament_id: info.lastInsertRowid,
    });
  }
);

const findByNamesForUrlStm = sql.prepare(`
SELECT tournaments.* 
  FROM tournaments 
  JOIN organizations ON tournaments.organizer_id = organizations.id
  WHERE tournaments.name_for_url = $tournament AND organizations.name_for_url=$organization;
`);

export function findByNamesForUrl(params: {
  organization: string;
  tournament: string;
}) {
  return findByNamesForUrlStm.get(params) as Tournament;
}

const isAdminStm = sql.prepare(`
  SELECT EXISTS (
    SELECT 1 
      FROM tournaments
      JOIN organizations ON tournaments.organizer_id = organizations.id
      WHERE organizations.owner_id = $userId AND tournaments.id = $tournamentId
  ) as is_tournament_admin
`);

export function isAdmin(params: { userId?: number; tournamentId: number }) {
  if (!params.userId) return false;
  const { is_tournament_admin } = isAdminStm.get(params) as {
    is_tournament_admin: number;
  };

  return Boolean(is_tournament_admin);
}
