import { sql } from "../sqlite3";
import { TournamentBracket } from "../types";

const activeIdByTournamentIdStm = sql.prepare(`
  SELECT tournament_brackets.id
    FROM tournament_rounds
    JOIN tournament_brackets ON tournament_rounds.bracket_id = tournament_brackets.id
    WHERE tournament_brackets.tournament_id = $tournament_id
`);

export const activeIdByTournamentId = (tournament_id: number) => {
  return (
    activeIdByTournamentIdStm.get({ tournament_id }) as
      | Pick<TournamentBracket, "id">
      | undefined
  )?.id;
};
