import { sql } from "~/db/sql";
import type { User } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  update "User"
  set "vc" = @vc,
      "languages" = @languages
  where "id" = @userId
`);

export function updateVCStatus({
  vc,
  languages,
  userId,
}: {
  vc: User["vc"];
  languages: string[];
  userId: User["id"];
}) {
  stm.run({
    vc,
    languages: languages.join(","),
    userId,
  });
}
