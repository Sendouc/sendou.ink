import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  insert into "TournamentMatchGameResultParticipant"
    ("matchGameResultId", "userId")
  values
    (@matchGameResultId, @userId)
`);

export function insertTournamentMatchGameResultParticipant(args: {
	matchGameResultId: number;
	userId: number;
}) {
	stm.run(args);
}
