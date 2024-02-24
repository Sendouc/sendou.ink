import { SqlDatabase } from "./crud.server";
import { BracketsManager } from "~/modules/brackets-manager";

export function getServerTournamentManager() {
  const storage = new SqlDatabase();
  // TODO: fix this ts-expect-error comment
  // @ts-expect-error interface mismatch
  const manager = new BracketsManager(storage);

  return manager;
}
