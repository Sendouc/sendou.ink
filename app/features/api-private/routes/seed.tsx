import type { ActionFunction } from "@remix-run/node";
import { z } from "zod";
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
  if (process.env.NODE_ENV === "production" && !process.env["CI"]) {
    throw new Response(null, { status: 400 });
  }

  // double check
  if (
    !process.env["BASE_URL"] ||
    !process.env["BASE_URL"].includes("localhost")
  ) {
    throw new Response(null, { status: 400 });
  }

  const { variation } = await parseRequestFormData({
    request,
    schema: seedSchema,
  });

  await seed(variation);

  return null;
};
