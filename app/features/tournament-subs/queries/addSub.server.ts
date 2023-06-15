import { sql } from "~/db/sql";
import type { TournamentSub } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  insert into "TournamentSub" (
    "userId",
    "tournamentId",
    "canVc",
    "bestWeapons",
    "okWeapons",
    "message",
    "visibility"
  )
  values (
    @userId,
    @tournamentId,
    @canVc,
    @bestWeapons,
    @okWeapons,
    @message,
    @visibility
  )
`);

export function addSub(args: Omit<TournamentSub, "createdAt">) {
  stm.run(args);
}
