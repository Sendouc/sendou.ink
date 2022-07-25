/* eslint-disable no-console */
import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";

const code = process.argv[2]?.trim();
const displayName = process.argv[3]?.trim();

invariant(code, "code of badge is required (argument 1)");
invariant(displayName, "display name of badge is required (argument 2)");
invariant(code === code.toLocaleLowerCase(), "code of badge must be lowercase");
invariant(
  displayName !== displayName.toLocaleLowerCase(),
  "displayName of badge must have at least one uppercase letter"
);

sql
  .prepare("insert into badge (code, displayName) values ($code, $displayName)")
  .run({ code, displayName });

console.log(`Added new badge: ${displayName}`);
