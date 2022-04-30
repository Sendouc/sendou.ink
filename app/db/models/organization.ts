import { sql } from "../sqlite3";
import type { Organization } from "../types";

const createStm = sql.prepare(`
  INSERT INTO
    organizations (
      name,
      name_for_url,
      owner_id,
      discord_invite,
      twitter
    )
    VALUES (
      $name,
      $name_for_url,
      $owner_id,
      $discord_invite,
      $twitter
    )
`);

export function create(input: Omit<Organization, "id">) {
  createStm.run(input);
}
