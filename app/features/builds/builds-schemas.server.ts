import { z } from "zod";
import { ability, safeJSONParse } from "~/utils/zod";
import { MAX_BUILD_FILTERS } from "./builds-constants";

const buildFilterSchema = z.object({
  ability: z.string().toUpperCase().pipe(ability),
  value: z.union([z.number(), z.boolean()]),
  comparison: z
    .string()
    .toUpperCase()
    .pipe(z.enum(["AT_LEAST", "AT_MOST"]))
    .optional(),
});

export const buildFiltersSearchParams = z.preprocess(
  safeJSONParse,
  z.union([z.null(), z.array(buildFilterSchema).max(MAX_BUILD_FILTERS)]),
);

export type BuildFiltersFromSearchParams = NonNullable<
  z.infer<typeof buildFiltersSearchParams>
>;
