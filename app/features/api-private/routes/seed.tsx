import type { ActionFunction } from "@remix-run/node";
import { z } from "zod";
import { DEV_MODE_ENABLED } from "~/constants";
import { seed } from "~/db/seed";
import { parseRequestFormData } from "~/utils/remix";

const seedSchema = z.object({
  variation: z
    .enum(["NO_TOURNAMENT_TEAMS", "DEFAULT", "REG_OPEN", "SMALL_SOS"])
    .nullish(),
});

export type SeedVariation = NonNullable<
  z.infer<typeof seedSchema>["variation"]
>;

export const action: ActionFunction = async ({ request }) => {
  if (!DEV_MODE_ENABLED) {
    throw new Response(null, { status: 400 });
  }

  const { variation } = await parseRequestFormData({
    request,
    schema: seedSchema,
  });

  await seed(variation);

  return null;
};
