import { sql } from "~/db/sql";
import type { UserSubmittedImage } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "id",
    "url",
    "submitterUserId"
  from "UnvalidatedUserSubmittedImage"
  where "validatedAt" is null
  limit 1
`);

type UnvalidatedImage = Pick<
  UserSubmittedImage,
  "id" | "url" | "submitterUserId"
>;

export function oneUnvalidatedImage(): UnvalidatedImage | null {
  return stm.get();
}
