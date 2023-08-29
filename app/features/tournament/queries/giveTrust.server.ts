import { sql } from "~/db/sql";

const stm = sql.prepare(/*sql */ `
  insert into "TrustRelationship" (
    "trustGiverUserId",
    "trustReceiverUserId"
  ) values (
    @trustGiverUserId,
    @trustReceiverUserId
  ) on conflict do nothing
`);

export function giveTrust({
  trustGiverUserId,
  trustReceiverUserId,
}: {
  trustGiverUserId: number;
  trustReceiverUserId: number;
}) {
  stm.run({ trustGiverUserId, trustReceiverUserId });
}
