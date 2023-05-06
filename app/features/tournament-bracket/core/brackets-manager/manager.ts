import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { SqlDatabase } from "./crud.server";
import { BracketsManager } from "~/modules/brackets-manager";

export function getTournamentManager(type: "SQL" | "IN_MEMORY") {
  const storage =
    type === "IN_MEMORY" ? new InMemoryDatabase() : new SqlDatabase();
  // xxx: type this
  // @ts-expect-error TODO:
  const manager = new BracketsManager(storage);

  return manager;
}
