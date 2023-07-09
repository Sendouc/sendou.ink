import { sql } from "~/db/sql";
import type { UserSubmittedImage } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "UnvalidatedUserSubmittedImage"."id",
    "UnvalidatedUserSubmittedImage"."url",
    "UnvalidatedUserSubmittedImage"."submitterUserId"
  from "UnvalidatedUserSubmittedImage"
  where "UnvalidatedUserSubmittedImage"."validatedAt" is null
  limit 1
`);

type UnvalidatedImage = Pick<
  UserSubmittedImage,
  "id" | "url" | "submitterUserId"
>;

export function oneUnvalidatedImage() {
  return stm.get() as UnvalidatedImage | null;
}
