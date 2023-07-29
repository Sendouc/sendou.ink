import { z } from "zod";
import { ability, safeJSONParse } from "~/utils/zod";

const buildFilterSchema = z.object({
  ability,
  value: z.union([z.number(), z.boolean()]),
  comparison: z
    .string()
    .toUpperCase()
    .pipe(z.enum(["AT_LEAST", "AT_MOST"]))
    .nullish(),
});

export const buildFiltersSearchParams = z.preprocess(
  safeJSONParse,
  z.union([z.null(), z.array(buildFilterSchema)])
);

export type BuildFiltersFromSearchParams = NonNullable<
  z.infer<typeof buildFiltersSearchParams>
>;
