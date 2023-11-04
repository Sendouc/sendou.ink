import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  delete from "LogInLink"
  where "code" = @code
`);

export function deleteLogInLinkByCode(code: string) {
  return stm.run({ code });
}
