/* eslint-disable no-console */
import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";

const code = process.argv[2]?.trim();
const newName = process.argv[3]?.trim();

invariant(code, "code of badge is required (argument 1)");
invariant(newName, "display name of badge is required (argument 2)");
invariant(
  newName !== newName.toLocaleLowerCase(),
  "displayName of badge must have at least one uppercase letter"
);

sql
  .prepare("update badge set displayName = @newName where code = @code")
  .run({ code, newName });

console.log(`Added updated name. New name: ${newName}`);
