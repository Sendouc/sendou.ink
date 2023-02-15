import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";
import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "AllTeam"
  set "inviteCode" = @inviteCode
  where "id" = @teamId
`);

export function resetInviteLink(teamId: number) {
  stm.run({ teamId, inviteCode: nanoid(INVITE_CODE_LENGTH) });
}
