import { z } from "zod";
import { parsedSqlQuery, Unpacked } from "~/utils";
import sql from "../postgres";

export type RelativeOwnSP = Unpacked<ReturnType<typeof relativeOwnSP>>;
export async function relativeOwnSP(user: { id: number }) {
  return parsedSqlQuery({
    query: sql`
    with ordered_by_created_at as (
      select user_id, sp 
        from skills 
        order by created_at desc
    ),
    distinct_users as (
      select distinct on (user_id) user_id, sp 
        from ordered_by_created_at
    ),
    leaderboards as (
      select
        user_id,
        sp, 
        round(((percent_rank() over (
          order by sp desc
        ))) * 100) as top_x
        from distinct_users
    )
    select 
        sp::real,
        case 
          when top_x < 50 then top_x
          else null 
        end as top_x
      from leaderboards 
      where user_id = ${user.id}
  `,
    schema: z.object({ sp: z.number(), topX: z.number().nullish() }).nullish(),
    unwrap: true,
  });
}
