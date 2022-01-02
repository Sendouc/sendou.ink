import { z } from "zod";
import { Database } from "~/utils/db.server";
import { Model } from "~/models/common/Model";
import type { Optional } from "~/utils";
import { Helpers } from "../common/Helpers";

export const TournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  name_for_url: z.string(),
  description: z.string(),
  start_time_timestamp: z.string(),
  check_in_start_timestamp: z.string(),
  banner_background: z.string(),
  banner_text_hsl_args: z.string(),
  seeds_json: z.string().nullable(),
  organizer_id: z.string(),
});

export type TournamentI = z.infer<typeof TournamentSchema>;

export class TournamentModel extends Model {
  #createStmt;
  constructor(db: Database["db"]) {
    super();
    this.#createStmt = this.prepareSql(db, __dirname, "create_tournament.sql");
  }

  create(args: Optional<TournamentI, "id">) {
    return this.#createStmt.run({
      ...args,
      ...Helpers.id(args.id),
    });
  }
}
