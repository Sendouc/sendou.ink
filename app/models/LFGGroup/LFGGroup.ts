import { z } from "zod";
import { Database } from "~/utils/db.server";
import { Model } from "~/models/common/Model";
import type { Optional } from "~/utils";
import { Helpers } from "../common/Helpers";

const LFGGroupType = z.enum(["TWIN", "QUAD", "VERSUS"]);

export const LFGGroupSchema = z.object({
  id: z.string().uuid(),
  message: z.string().max(250).nullable(),
  ranked: z.number().int().min(0).max(1).nullable(),
  type: LFGGroupType,
  active: z.number().int().min(0).max(1),
  match_id: z.string().uuid().nullable(),
  created_at: z.string(),
});

export type LFGGroupType = z.infer<typeof LFGGroupType>;
export type LFGGroupI = z.infer<typeof LFGGroupSchema>;

export class LFGGroupModel extends Model {
  #createStmt;
  constructor(db: Database["db"]) {
    super();
    this.#createStmt = this.prepareSql(db, __dirname, "create_lfg_group.sql");
  }

  create(args: Optional<LFGGroupI, "id" | "match_id" | "created_at">) {
    return this.#createStmt.run({
      ...args,
      ...Helpers.id(args.id),
      ...Helpers.createdAt,
    });
  }
}
