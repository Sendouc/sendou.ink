import { z } from "zod";
import { Database } from "~/utils/db.server";
import { Model } from "~/models/common/Model";
import type { Optional } from "~/utils";
import { Helpers } from "../common/Helpers";

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  name_for_url: z.string(),
  owner_id: z.string(),
  discord_invite: z.string(),
  twitter: z.string().nullable(),
});

export type OrganizationI = z.infer<typeof OrganizationSchema>;

export class OrganizationModel extends Model {
  #createStmt;
  constructor(db: Database["db"]) {
    super();
    this.#createStmt = this.prepareSql(
      db,
      __dirname,
      "create_organization.sql"
    );
  }

  create(args: Optional<OrganizationI, "id">) {
    return this.#createStmt.run({
      ...args,
      ...Helpers.id(args.id),
    });
  }
}
