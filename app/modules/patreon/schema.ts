import { z } from "zod";
import { TIER_1_ID, TIER_2_ID, TIER_3_ID, TIER_4_ID } from "./constants";

export const patronResponseSchema = z.object({
  data: z.array(
    z.object({
      attributes: z.object({
        declined_since: z.string().nullable(),
        created_at: z.string(),
      }),
      relationships: z.object({
        patron: z.object({ data: z.object({ id: z.string() }) }),
        reward: z.object({
          data: z.object({
            id: z.enum([TIER_1_ID, TIER_2_ID, TIER_3_ID, TIER_4_ID]),
          }),
        }),
      }),
    })
  ),
  included: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("user"),
        id: z.string(),
        attributes: z.object({
          email: z.string(),
          full_name: z.string(),
          social_connections: z.object({
            discord: z.object({ user_id: z.string() }).nullable(),
          }),
        }),
      }),
      z.object({ type: z.literal("reward") }),
      z.object({ type: z.literal("goal") }),
      z.object({ type: z.literal("campaign") }),
    ])
  ),
  links: z.object({ next: z.string().nullish() }),
});
