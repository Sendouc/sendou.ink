import type { ActionFunction } from "@remix-run/node";
import { z } from "zod";
import { seed } from "~/db/seed";
import { parseRequestFormData } from "~/utils/remix";

const seedSchema = z.object({
  variation: z.enum(["NO_TOURNAMENT_TEAMS", "DEFAULT"]).nullish(),
});

export type SeedVariation = NonNullable<
  z.infer<typeof seedSchema>["variation"]
>;

export const action: ActionFunction = async ({ request }) => {
  if (process.env.NODE_ENV === "production") {
    throw new Response(null, { status: 400 });
  }

  const { variation } = await parseRequestFormData({
    request,
    schema: seedSchema,
  });

  seed(variation);

  return null;
};
