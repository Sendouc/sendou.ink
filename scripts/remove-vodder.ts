/* eslint-disable no-console */
import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

const id = (
  sql
    .prepare(`select "id" from "User" where "discordId" = @discordId`)
    .get({ discordId }) as any
)?.id;

invariant(id, "user not found");

sql
  .prepare(`update "User" set "isVideoAdder" = 0 where "id" = @id`)
  .run({ id });

sql
  .prepare(`delete from "UnvalidatedVideo" where "submitterUserId" = @id`)
  .run({ id });

console.log(`Removed vodder`);
