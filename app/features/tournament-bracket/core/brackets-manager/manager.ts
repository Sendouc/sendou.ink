import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "~/modules/brackets-manager";

export function getTournamentManager() {
  const storage = new InMemoryDatabase();
  const manager = new BracketsManager(storage);

  return manager;
}
