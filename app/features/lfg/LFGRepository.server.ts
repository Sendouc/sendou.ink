import { db } from "~/db/sql";
import { TablesInsertable } from "~/db/tables";

export function insertPost(
  args: Omit<TablesInsertable["LFGPost"], "updatedAt">,
) {
  return db.insertInto("LFGPost").values(args).execute();
}
