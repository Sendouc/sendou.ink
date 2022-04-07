import { z } from "zod";
import { parsedSqlQuery } from "~/utils";
import sql from "../postgres";
import { activeGroupStatus } from "../schemas";

export async function ownGroupStatus(user: { id: number }) {
  return parsedSqlQuery({
    query: sql`
    select groups.group_status as status, groups.match_id
      from groups
      join group_members on id = group_id
      where group_members.user_id = ${user.id} and groups.group_status != 'INACTIVE';
    `,
    schema: z
      .object({ status: activeGroupStatus, matchId: z.number() })
      .nullish(),
    unwrap: true,
  });
}
